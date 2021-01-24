import mapboxgl from 'mapbox-gl';
import copy from 'copy-text-to-clipboard';

/**
 * Local modules
 */
import {validate} from './validate.js';
import {Easing} from './easing.js';
import {state, presets} from './settings.js';
/**
 * Remote modules. 
 */
import {simd} from 'https://unpkg.com/wasm-feature-detect?module';
import loadEncoder from 'https://unpkg.com/mp4-h264@1.0.7/build/mp4-encoder.js';

class MinAniMap {
  constructor(map, opt) {
    const am = this;
    /**
     * Bind .. all.
     */
    am.bindAll();

    //am.getPopupPos = am.getPopupPos.bind(am);
    //am.lookAtPopup = am.lookAtPopup.bind(am);
    return am.init(map, opt);
  }

  async init(map, opt) {
    const am = this;
    if (am.is('destroyed') || am.is('init')) {
      throw new Error('Ignore init');
    }
    opt = Object.assign({}, opt);
    
    /**
     * Refs
     */
    am._map = map; 
    am._on = []; 
    am._state = {};
    am._flags = {};
    am._frames = [];
    am._steps = [];
    am._frame_id = 0;
    am._preset = {};

    /**
     * Video encoding
     */
    am._supportsSIMD = await simd();
    am._Encoder = await loadEncoder({simd: am._supportSIMD});

    /**
     * Restore steps if available
     */
    const stepsStorage = localStorage.getItem('steps');
    if (am.validateSteps(stepsStorage)) {
      opt.steps = stepsStorage;
    }

    /**
     * Merge options to default settings as init state
     */
    Object.keys(state).forEach((k) => {
      const def = am.getStateDefault(k);
      am.setState(k, am.normalizeObject(opt[k] || def));
    });

    /**
     * General init
     */
    am.setFlag('destroyed', false);
    am.setFlag('playing', false);

    /**
     * Map behaviour
     */
    am._map.on('mousedown', am.pause);

    /**
     * Validate init
     */
    if (!am._validate_init()) {
      throw new Error('Invalid init');
    }

    /**
     * Set as initialized properly
     */
    am.setState('init', true);

    /*
     * steps frames pre rendering. Done when adding steps: wrap this ?
     */
    setTimeout(() => {
      am._pre_render();
      am.render(0);
    }, 0);

    return am;
  }

  /**
   * Check that init stuff is correct
   */
  _validate_init() {
    const am = this;
    const hasMap = am._map instanceof mapboxgl.Map;
    const hasSteps = am.validateSteps(am.getSteps());
    return hasMap && hasSteps;
  }

  /**
   * Flags
   */
  setFlag(id, value) {
    const am = this;
    am._flags[id] = value;
  }
  getFlag(id) {
    const am = this;
    return am._flags ? am._flags[id] : null;
  }
  // shortcut for getFlag
  is(id) {
    return this.getFlag(id);
  }

  /**
   * Map
   */
  getMap() {
    const am = this;
    return am.is('recording') ? am._map_recording : am._map;
  }

  /**
   * State
   */
  setState(id, value) {
    const am = this;
    am._state[id] = value;
  }
  getState(id) {
    const am = this;
    return am._state ? am._state[id] : null;
  }
  getStateDefault(id) {
    const am = this;
    return am.cloneObject(state[id]);
  }
  getStateItem(idState, idItem) {
    const am = this;
    return am._state ? am._state[idState][idItem] : null;
  }
  // Shortcut for getState
  state(id) {
    return this.getState(id);
  }

  /**
   * URL save / copy
   */
  urlSave(e) {
    const am = this;
    if (e instanceof Event) {
      e.preventDefault();
    }
    /**
     * Partial state save: only steps for now.
     */
    const state = {steps: am.getState('steps')};
    const url = new URL(document.location);
    url.searchParams.set('state', JSON.stringify(state));
    history.replaceState(null, null, url);
    am.fire('url_saved', url);
    return url;
  }

  urlCopy() {
    const am = this;
    const url = am.urlSave();
    copy(url.toString());
    am.fire('url_copied', url);
  }

  /**
   * Steps : add / set steps, validate
   */
  addStepFromHere() {
    const am = this;
    const step = am.stepFromHere();
    am.addSteps([step]);
  }

  addSteps(steps, replace) {
    const am = this;
    steps = am.normalizeObject(steps, []);
    const valid = am.validateSteps(steps);
    if (valid) {
      const stepsState = am.state('steps');
      if (replace) {
        stepsState.length = 0;
      }
      stepsState.push(...steps);
      localStorage.setItem('steps', JSON.stringify(stepsState));
      am._pre_render();
      am.fire('steps_updated');
    }
  }
  replaceSteps(steps) {
    const am = this;
    am.addSteps(steps, true);
  }

  getSteps() {
    const am = this;
    return am.state('steps');
  }
  getStepsRendered() {
    const am = this;
    return am._steps;
  }

  getStepsCount() {
    const am = this;
    return am.state('steps').length;
  }

  getStep(id, rendered) {
    const am = this;
    const steps = rendered ? am.getStepsRendered() : am.getSteps();
    const max = steps.length - 1;
    if (id < 0) {
      return steps[max];
    }
    if (id > max) {
      return steps[0];
    }
    const step = steps[id];
    if (!step) {
      return steps[0];
    }
    return step;
  }
  getStepRendered(id) {
    const am = this;
    return am.getStep(id, true);
  }

  /**
   * Video settings
   */
  getVideoConfig() {
    const am = this;
    return am.getState('video_config');
  }
  setVideoConfig(conf) {
    const am = this;
    conf = am.normalizeObject(conf);
    const valid = am.validateVideoConfig(conf);
    if (valid) {
      am.setState('video_config', conf);
    }
  }
  validateVideoConfig(value) {
    const am = this;
    const config = am.normalizeObject(value, {});
    const valid = validate({video_config: config});
    const msg = am._ajv_err_msg(valid, validate);
    am.message({
      type: 'validate-video-config',
      text: msg
    });
    return valid;
  }

  getDuration() {
    const am = this;
    const steps = am.getSteps();
    return steps.reduce(
      (a, step) => a + step.duration_anim + step.duration_pause,
      0
    );
  }

  estimateFileSize() {
    const am = this;
    const duration = am.getDuration();
    const config = am.getVideoConfig();
    const preset = presets.find((r) => r.id === config.preset);
    return preset.kbps * duration;
  }

  /**
   * Manage secondary map (for recording );
   */
  updateRecordingMap() {
    return new Promise((resolve) => {
      const am = this;
      const config = am.getVideoConfig();
      if (!am._map_recording) {
        am._el_recording = document.createElement('div');
        am._map_recording = new mapboxgl.Map({
          container: am._el_recording
        });
      }
      /*
       * width, height
       */
      am._preset = presets.find((r) => r.id === config.preset);
      const dim = am._preset.dim;
      /**
       * Transfert style
       */
      const style = am._map.getStyle();
      am._map_recording.setStyle(style);

      /**
       * Set orientation
       */
      if (config.orientation === 'portrait') {
        dim.reverse();
      }

      /*
       * Define non-visible canvas
       * Container should be added to dom : map.resize need that...
       * -> its removed short after
       */
      const dpr = window.devicePixelRatio;
      am._el_recording.style.width = dim[0] / dpr + 'px';
      am._el_recording.style.height = dim[1] / dpr + 'px';
      am._el_recording.style.zIndex = -1;
      document.body.appendChild(am._el_recording);
      am._map_recording.resize();
      am._map_recording.on('idle', () => {
        am._el_recording.remove();
        resolve(true);
      });
    });
  }

  //initPopup(){
  //const am = this;
  //am._map.on('click', (e) => {
  //if (am._popup_look_at) {
  //am._popup_look_at.remove();
  //}
  //am._popup_look_at = new mapboxgl.Popup()
  //.setLngLat(e.lngLat)
  //.setHTML('<h3>Look at me</>')
  //.addTo(map);
  //am.lookAtPopup();
  //am._map.on('move', am.lookAtPopup);

  //am._popup_look_at.on('close', () => {
  //am._map.off('move', am.lookAtPopup);
  //});
  //});
  //}

  //getPopupPos() {
  //const am = this;
  //const hasLookAtPop = am._popup_look_at && am._popup_look_at.isOpen();
  //if (hasLookAtPop) {
  //return am._popup_look_at.getLngLat();
  //}
  //}

  //lookAtPopup() {
  //const am = this;
  //const lngLat = am.getPopupPos();
  //if (lngLat) {
  //const co = am._map.getFreeCameraOptions();
  //if (!am._map.isMoving()) {
  //co.lookAtPoint(lngLat);
  //am._map.setFreeCameraOptions(co);
  //}
  //}
  /*}*/

  /**
   * Events
   */
  on(type, cb) {
    const am = this;
    if (type && cb) {
      am._on.push({type: type, cb: cb});
    }
  }

  fire(type, data) {
    const am = this;
    am._on.forEach((o) => {
      if (o.type === type) {
        o.cb(data);
      }
    });
  }

  /**
   * Validation
   */
  validateVideoSettings(settings) {
    const am = this;
    const video_config = am.getState('video_config');
    settings = am.normalizeObject(settings, video_config);
    const valid = validate({video_config: settings});
    const msg = am._ajv_err_msg(valid, validate);
    am.message({
      type: 'validate-steps',
      text: msg
    });
    return valid;
  }

  validateSteps(steps) {
    const am = this;
    steps = am.normalizeObject(steps, []);
    const valid = validate({steps: steps});
    const msg = am._ajv_err_msg(valid, validate);
    am.message({
      type: 'validate-steps',
      text: msg
    });
    return valid;
  }

  _ajv_err_msg(valid, validate) {
    let msg = '';
    if (!valid) {
      msg = validate.errors.reduce((a, c) => {
        return `${a} \n Invalid param at ${c.dataPath},${
          c.message
        }. Details: ( '${JSON.stringify(c.params)}' )`;
      }, '');
    } else {
      msg = 'All good';
    }
    return msg;
  }

  /**
   * Message
   */
  message(m) {
    this.fire('message', m);
  }

  destroy() {
    const am = this;
    am.fire('destroy');
    am.setFlag('destroyed', true);
    am._on.length = 0;
  }

  stepFromHere(config) {
    const am = this;
    const co = am._map.getFreeCameraOptions();

    const lngLat = co.position.toLngLat();
    const alt = co.position.toAltitude();
    const pitch = am._map.getPitch();
    const bearing = am._map.getBearing();
    const step_config = am.state('step_config');
    const step = {
      duration_anim: step_config.duration_anim,
      duration_pause: step_config.duration_pause,
      center: [lngLat.lng, lngLat.lat],
      altitude: alt,
      pitch: pitch,
      easing: step_config.easing,
      bearing: bearing
    };
    return Object.assign({}, step, config);
  }

  play() {
    const am = this;
    const nSteps = am.getStepsCount();
    if (am.is('playing') || am.is('destroyed') || nSteps === 0) {
      am.stop();
      return;
    }
    /**
     * set playing flag first,
     * it's used in _render
     */
    am.fire('play');
    am.setFlag('playing', true);
    if (am.is('paused')) {
      am.resume();
    } else {
      am.render();
    }
  }

  resume() {
    const am = this;
    if (am.is('paused')) {
      am.setFlag('paused', false);
      am.setFlag('playing', true);
      am.render();
    }
  }

  pause() {
    const am = this;
    if (!am.is('playing')) {
      return;
    }
    am.cancelRender();
    am.fire('pause');
    am.setFlag('paused', true);
    am.setFlag('playing', false);
  }

  toggle() {
    const am = this;
    if (am.is('playing')) {
      am.pause();
    } else {
      am.play();
    }
  }

  stop() {
    const am = this;
    am.pause();
    if (am.is('recording')) {
      am.recordingEnd();
    }
    am.setFlag('playing', false);
    am.setFlag('paused', false);
    am._frame_id = 0;
    am.fire('stop');
  }

  resetSteps() {
    const am = this;
    const choice = confirm("Reset steps to default ?  (this can't be undone) ");
    if (choice) {
      localStorage.removeItem('steps');
      const steps = state.steps;
      am.replaceSteps(steps);
      am.fire('steps_reset');
    }
  }

  removeSteps() {
    const am = this;
    const choice = confirm("Remove all steps ?  (this can't be undone) ");
    if (choice) {
      localStorage.removeItem('steps');
      const defaultStep = am.stepFromHere();
      am.replaceSteps([defaultStep]);
      am.fire('steps_removed');
    }
  }

  clear() {
    const am = this;
    am.stop();
    am._state.steps.length = 0;
  }

  /**
   * Cancel requests and timeout
   */
  cancelRender() {
    window.cancelAnimationFrame(am._id_render_frame);
  }

  _pre_render() {
    const am = this;
    const nBearing = am._map._normalizeBearing;
    am._steps = am.cloneObject(am.getSteps());
    am._frames.length = 0;
    let k = 0;

    /**
     * Step loop
     */
    for (let i = 0; i < am._steps.length - 1; i++) {
      const step_from = am._steps[i];
      const step_to = am._steps[i + 1];
      const easing = Easing[step_to.easing] || Easing.linear;
      const tAnim = step_to.duration_anim;
      const tPause = step_to.duration_pause;
      const nFrameAnim = tAnim / (1000 / 60);
      const nFramePause = tPause / (1000 / 60);
      const nFrame = nFrameAnim + nFramePause;
      /**
       * Normalize bearing movement:
       * - search for the shortest bearing change to avoid full
       * crazy big rotation
       */
      if (step_from.bearing && step_to.bearing) {
        step_to.bearing = nBearing(step_to.bearing, step_from.bearing);
      }

      if (i === 0) {
        step_from._frame_start = 0;
        step_from._frame_end = 0;
      }

      step_to._frame_start = k;
      step_to._frame_end = k + nFrame;

      /**
       * Frame loop
       */
      for (let j = 0; j < nFrame; j++) {
        const percent = easing(j / nFrame);
        const position = am._linrp(step_from.center, step_to.center, percent);

        const altitude = am._linrp(
          step_from.altitude,
          step_to.altitude,
          percent
        );

        const lookAt = step_from.lookAt
          ? am._linrp(step_from.lookAt, step_to.lookAt, percent)
          : null;

        const pitch =
          !lookAt && step_from.pitch
            ? am._linrp(step_from.pitch, step_to.pitch, percent)
            : null;

        const bearing =
          !lookAt && step_from.bearing
            ? am._linrp(step_from.bearing, step_to.bearing, percent)
            : null;
        /*
         * Create 'frame' parameters
         */
        const frame = {
          id: k++,
          step_id_from: i,
          step_id_to: i + 1,
          percent,
          position,
          altitude,
          lookAt,
          pitch,
          bearing
        };

        am._frames.push(frame);

        /**
         * Paused frames
         */
        if (j === nFrame - 1) {
          for (let p = 0; p < nFramePause; p++) {
            am._frames.push(frame);
          }
        }
      }
    }
    am.fire('pre_rendered', {nFrames: am._frames.length, idFrame:am._frame_id});
  }

  render(id) {
    const am = this;
    const max = am._frames.length - 1;

    if (max <= 0) {
      return console.warn('No frames to render');
    }

    if (am.validFrameId(id)) {
      am._frame_id = id % max;
    } else {
      /*
       * loop ? am._frame_id = am._frame_id + (1 % max);
       */
      am._frame_id = am._frame_id + 1;
    }

    if (!am.validFrameId(am._frame_id)) {
      am.stop();
      return;
    }

    am._frame = am._frames[am._frame_id];

    am._update_camera_position(am._frame);

    if (am.is('recording')) {
      am.recordingFrame();
      am.message({
        type: 'recording_progress',
        text: `${am._frame_id}/${max}`,
        i: am._frame_id,
        n: max
      });
    }
    if (am.is('playing')) {
      am._id_render_frame = requestAnimationFrame(() => am.render());
    }
    am.fire('render',am._frame_id)
  }

  validFrameId(id) {
    const am = this;
    const n = am._frames.length;
    return Number.isInteger(id) && id >= 0 && am._frame_id < n;
  }

  /**
   * Step navigation
   */
  nextStep() {
    const am = this;
    let idFrame = 0;
    if (am._frame) {
      const step = am.getStepRendered(am._frame.step_id_to + 1);
      idFrame = step._frame_start;
    }
    am.cancelRender();
    am.render(idFrame);
    am.fire('play_next');
  }

  previousStep() {
    const am = this;
    let idFrame = 0;
    if (am._frame) {
      const step = am.getStepRendered(am._frame.step_id_from);
      idFrame = step._frame_start;
    }
    am.cancelRender();
    am.render(idFrame);
    am.fire('play_previous');
  }

  firstStep() {
    const am = this;
    am.render(0);
    am.fire('play_first');
  }

  /**
   * Record methods
   */
  recordingStartStop() {
    const am = this;
    if (am.is('recording')) {
      am.recordingEnd();
    } else {
      am.recordingStart();
    }
  }
  async recordingStart() {
    const am = this;
    am.stop();
    await am.updateRecordingMap();
    const preset = am._preset;
    const duration = am.getDuration();

    if (duration < 1) {
      alert('Video is too short, better take a screenshot :) ');
    }

    if (!am._supportsSIMD) {
      alert('SIMD not supported. It will probably be a slow ride');
    }

    const fSizeKb = am.estimateFileSize();

    const acceptSize = confirm(
      `Estimated file size will be ~ ${Math.round(
        fSizeKb / 8e6
      )} MB. Continue ?`
    );

    if (!acceptSize) {
      return;
    }

    am._gl = am._map_recording.painter.context.gl;
    am._gl_width = am._gl.drawingBufferWidth;
    am._gl_height = am._gl.drawingBufferHeight;

    am._encoder = am._Encoder.create({
      width: am._gl_width,
      height: am._gl_height,
      fps: 60,
      kbps: preset.kbps,
      rgbFlipY: true
    });

    am._rgb_pointer = am._encoder.getRGBPointer();
    am.message({
      type: 'recording_progress',
      text: 'Recording start'
    });
    am.fire('recording_start');
    am.setFlag('recording', true);
    am.play();
  }

  recordingEnd() {
    const am = this;
    if (am.is('playing')) {
      am.stop();
    }
    if (!am.is('recording')) {
      return;
    }
    am.setFlag('recording', false);

    try {
      am._mp4 = am._encoder.end();
    } catch (e) {
      console.warn(e);
    }

    am.fire('recording_end');
    am.message({
      type: 'recording_progress',
      text: 'Recording finished'
    });

  }

  recordingFrame() {
    const am = this;
    if (!am.is('recording')) {
      return;
    }
    try {
      const pixels = am._encoder.memory().subarray(am._rgb_pointer);
      am._gl.readPixels(
        0,
        0,
        am._gl_width,
        am._gl_height,
        am._gl.RGBA,
        am._gl.UNSIGNED_BYTE,
        pixels
      );
      am._encoder.encodeRGBPointer(); // encode the frame
    } catch (e) {
      am.recordingEnd();
      alert('Record failed, check console');
      console.warn(e);
    }
  }

  recordingDownload() {
    const am = this;
    if (am._mp4) {
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(
        new Blob([am._mp4], {type: 'video/mp4'})
      );
      anchor.download = 'minanimap';
      anchor.click();
      am.fire('video_downloaded');
    }
  }

  /**
   * Helpers
   */

  _linrp(from, to, percent) {
    if (Array.isArray(from) && Array.isArray(to)) {
      const out = [];
      for (let i = 0; i < Math.min(from.length, to.length); i++) {
        out[i] = from[i] * (1.0 - percent) + to[i] * percent;
      }
      return out;
    } else {
      return from * (1.0 - percent) + to * percent;
    }
  }

  _update_camera_position(frame) {
    const am = this;
    const map = am.getMap();
    const co = map.getFreeCameraOptions();

    if (!frame) {
      return;
    }

    co.position = window.mapboxgl.MercatorCoordinate.fromLngLat(
      frame.position,
      frame.altitude
    );

    if (frame.lookAt) {
      co.lookAtPoint(frame.lookAt);
    } else {
      co.setPitchBearing(frame.pitch || 0, frame.bearing || 0);
    }

    map.setFreeCameraOptions(co);
  }

  /**
   * JSON parse if needed, with default in case of error
   *
   * @param {Object|String} data  Input object or string 
   * ®return {Object} object or default 
   */
  normalizeObject(data, def = []) {
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {}
    }
    if (typeof data !== typeof def) {
      data = def;
    }
    return data;
  }

  /**
   * Object clone using JSON stringify/parse 
   *
   * @param {Object} obj Input object. 
   * ®return {Object} cloned object 
   */
  cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Simple check for object equality. 
   *
   * @param {Object|Sring} a Input a
   * @param {Object|Sring} b Input b
   * ®return {Boolean} String version are equivalent
   */
  equivObject(a, b) {
    const am = this;
    const aN = am.normalizeObject(a, {});
    const bN = am.normalizeObject(b, {});
    return JSON.stringify(aN) === JSON.stringify(bN);
  }

  /**
  * Bind all methods. 
  * @return null
  */
  bindAll() {
    const am = this;
    Object.getOwnPropertyNames(Object.getPrototypeOf(am)).map((k) => {
      if (am[k] instanceof Function && k !== 'constructor') {
        am[k] = am[k].bind(am);
      }
    });
  }
}

export {MinAniMap};
