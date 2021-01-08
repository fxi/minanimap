import {Timer} from './timer.js';
//import {validate, betterAjvErrors, schema} from './validate.js';
import {validate} from './validate.js';
import {Easing} from './easing.js';
import {steps} from './steps.js';
/**
 * Local wasm feature detect does nork: need node stuff
 */
import {simd} from 'https://unpkg.com/wasm-feature-detect?module';
import loadEncoder from 'https://unpkg.com/mp4-h264@1.0.7/build/mp4-encoder.js';

const def = {
  duration_anim: 5000,
  duration_pause: 0,
  easing: 'easeInOutQuad'
};

class MinAniMap {
  constructor(map, steps, opt) {
    const am = this;
    am._render = am._render.bind(am);
    am.next = am.next.bind(am);
    am.play = am.play.bind(am);
    am.pause = am.pause.bind(am);
    am.resume = am.resume.bind(am);
    am.stop = am.stop.bind(am);
    //am.getPopupPos = am.getPopupPos.bind(am);
    //am.lookAtPopup = am.lookAtPopup.bind(am);

    return am.init(map, steps, opt);
  }

  async init(map, steps, opt) {
    const am = this;

    if (am.state('destroyed') || am.state('init')) {
      throw new Error('Invalid init');
    }

    /**
     * Base
     */
    am._timer = new Timer();
    am._map = map;
    am._on = [];
    am._state = {};

    /**
     * Video encoding
     */
    am._supportsSIMD = await simd();
    am._Encoder = await loadEncoder({simd: am._supportSIMD});

    /**
     * Restore step if needed
     */
    const stepsStorage = localStorage.getItem('steps');
    if (am.validateSteps(stepsStorage)) {
      steps = stepsStorage;
    }
    am.setState('steps', []);
    am.setState('opt', Object.assign({}, def, opt));
    am.setState('step_id', -1); // no step, current pos
    am.setState('destroyed', false);
    am.setState('playing', false);
    am.addSteps(steps);

    am._map.on('mousedown', () => {
      am.pause();
    });

    if (!am._validate_init()) {
      throw new Error('Invalid init');
    }

    am.setState('init', true);
    return am;
  }

  recordStartStop() {
    const am = this;
    if (am.state('recording')) {
      am.recordEnd();
    } else {
      am.recordStart();
    }
  }

  recordStart() {
    const am = this;
    am.setState('recording', false);
    const steps = am.getSteps();
    const duration = steps.reduce((a, step) => a + step.duration_anime, 0);

    if (duration < 1) {
      alert('Video too short, better take a screenshot :) ');
    }

    const sizeMBs = prompt('Select output file size in MB', '100');
    const fps = prompt('Select frames per second', '30');

    const sizeKilobits = sizeMBs * 8000;
    const kbps = sizeKilobits / duration;

    am._gl = am._map.painter.context.gl;
    am._gl_width = am._gl.drawingBufferWidth;
    am._gl_height = am._gl.drawingBufferHeight;

    am._encoder = am._Encoder.create({
      width: am._gl_width,
      height: am._gl_height,
      fps: fps*1 || 30,
      kbps: kbps*1 || 800,
      rgbFlipY: true
    });

    am._rgb_pointer = am._encoder.getRGBPointer();
    am.setState('recording', true);
    am.fire('record_start');
    am.play();
  }

  recordEnd() {
    const am = this;
    am._mp4 = am._encoder.end();
    am.setState('recording', false);
    am.fire('record_end');
    am.pause();
  }

  recordFrame() {
    const am = this;
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
      am.recordEnd();
      alert('Record failed, check console');
      console.warn(e);
    }
  }

  recordDownload() {
    const am = this;
    if (am._mp4) {
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(
        new Blob([am._mp4], {type: 'video/mp4'})
      );
      anchor.download = 'mapbox-gl';
      anchor.click();
      am.fire('video_downloaded');
    }
  }

  getOpt(id) {
    const am = this;
    const opt = am.state('opt');
    return opt[id];
  }

  setState(id, value) {
    const am = this;
    am._state[id] = value;
  }

  getState(id) {
    const am = this;
    return am._state ? am._state[id] : null;
  }

  state(id) {
    return this.getState(id);
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

  _validate_init() {
    const am = this;
    const hasMapox = !!window.mapboxgl;
    const hasMap = hasMapox && am._map instanceof mapboxgl.Map;
    const hasSteps = am.validateSteps(am.getSteps());
    return hasMapox && hasMap && hasSteps;
  }

  validateSteps(steps) {
    const am = this;
    steps = am.toSteps(steps);
    const data = {steps: steps};
    let valid = validate(data);
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

    am.message(msg);
    return valid;
  }

  message(m) {
    this.fire('message', m);
  }

  addSteps(steps, replace) {
    const am = this;
    steps = am.toSteps(steps);
    const valid = am.validateSteps(steps);
    if (valid) {
      const stepsState = am.state('steps');
      if (replace) {
        stepsState.length = 0;
      }
      stepsState.push(...steps);
      localStorage.setItem('steps', JSON.stringify(stepsState));
    }
  }
  getSteps() {
    const am = this;
    return am.state('steps');
  }
  getStep(id) {
    const am = this;
    const stepsState = am.state('steps');
    return stepsState[id || 0];
  }
  replaceSteps(steps) {
    const am = this;
    am.addSteps(steps, true);
  }

  toSteps(steps) {
    const am = this;
    if (am.isJSON(steps)) {
      steps = JSON.parse(steps);
    }
    if (!Array.isArray(steps)) {
      steps = [];
    }
    return steps;
  }

  isJSON(str) {
    let out = false;
    if (typeof str === 'string') {
      try {
        JSON.parse(str);
        out = true;
      } catch (e) {}
    }
    return out;
  }

  destroy() {
    const am = this;
    am.fire('destroy');
    am.setState('destroyed', true);
    am._on.length = 0;
  }

  getCamPos() {
    const am = this;
    const co = am._map.getFreeCameraOptions();

    const lngLat = co.position.toLngLat();
    const alt = co.position.toAltitude();
    const pitch = am._map.getPitch();
    const bearing = am._map.getBearing();

    return {
      duration_anim: am.getOpt('duration_anim'),
      duration_pause: am.getOpt('duration_pause'),
      center: [lngLat.lng, lngLat.lat],
      altitude: alt,
      pitch: pitch,
      easing: am.getOpt('easing'),
      bearing: bearing
    };
  }

  play() {
    console.log('play');
    const am = this;
    if (
      am.state('playing') ||
      am.state('destroyed') ||
      am._state.steps.length === 0
    ) {
      am.stop();
      return;
    }
    /**
     * set playing flag first,
     * it's used in _render
     */
    console.log('Fire play');
    am.fire('play');
    am.setState('playing', true);
    if (am.state('paused')) {
      console.log('Play: resume');
      am.resume();
    } else {
      console.log('Play: trigger next');
      am.next();
    }
  }

  resume() {
    const am = this;
    if (am.state('paused')) {
      am.setState('paused', false);
      am._timer.resume();
      am._render();
    }
  }

  pause() {
    console.log('pause');
    const am = this;
    if (!am.state('playing')) {
      return;
    }
    am._timer.pause();
    am.fire('pause');
    am.setState('playing', false);
    am.setState('paused', true);
  }

  toggle() {
    const am = this;
    if (am.state('playing')) {
      am.pause();
    } else {
      am.play();
    }
  }

  stop() {
    console.log('stop');
    const am = this;
    am.fire('stop');
    am.reset();
    am.setState('playing', false);
    am.setState('paused', false);
  }

  reset() {
    console.log('reset');
    const am = this;
    am.fire('reset');
    am._step_id = -1; //no step, current pos
    am._timer.reset();
  }

  resetSteps() {
    const am = this;
    const choice = confirm("Reset steps to default ?  (this can't be undone) ");
    if (choice) {
      localStorage.removeItem('steps');
      am.replaceSteps(steps);
      am.fire('reset_steps');
    }
  }

  removeSteps() {
    const am = this;
    const choice = confirm("Remove all steps ?  (this can't be undone) ");
    if (choice) {
      localStorage.removeItem('steps');
      am.replaceSteps([am.getCamPos()]);
      am.fire('reset_steps');
    }
  }

  clear() {
    console.log('clear');
    const am = this;
    am.stop();
    am._state.steps.length = 0;
  }

  next() {
    const am = this;
    const nBearing = am._map._normalizeBearing;
    const hasNoId = am._step_id === null || typeof am._step_id === 'undefined';
    const isLast = am._step_id + 1 >= am._state.steps.length;
    const isRecording = am.state('recording');
    if (hasNoId || isLast) {
      am._step_id = -1; //non existing step, use current camera pos
    }
    if (isRecording && isLast) {
      am.pause();
      am.recordEnd();
      return;
    }
    am._step_from = am.getStep(am._step_id) || am.getCamPos();
    am._step_to = am.getStep(++am._step_id);
    am._duration_anim = am._step_to.duration_anim;
    console.log('Playing step ', am._step_id);
    am._ease = Easing[am._step_to.easing] || Easing.linear;

    if (isRecording) {
      am._frame_i = 0;
      am._frame_n = am._duration_anim / (1000 / 60);
    }

    /**
     * Normalize to avoid crazy full rotation for small angles
     */
    if (am._step_from.bearing && am._step_to.bearing) {
      am._step_to.bearing = nBearing(
        am._step_to.bearing,
        am._step_from.bearing
      );
    }

    am._timer.lap();
    am._render();
  }

  _render() {
    const am = this;

    if (!am.state('playing') || am.state('destroyed')) {
      return;
    }
    const isRecording = am.state('recording');

    const elapsed = isRecording ? am._frame_i++ : am._timer.get();
    const duration = isRecording ? am._frame_n : am._duration_anim;

    if (elapsed < duration) {
      const percent = am._ease(elapsed / duration);
      am._animate(percent);
      if (isRecording) {
        am.recordFrame();
      }
    }
    if (elapsed >= duration) {
      /**
       * Handling pause
       */
      if (isRecording) {
        const pauseDuration = am._step_to.duration_pause / (1000 / 60);
        for (let i = 0; i < pauseDuration; i++) {
          am._recordFrame();
        }
        am.next();
      } else {
        setTimeout(am.next, am._step_to.duration_pause || 0);
      }
    } else {
      window.requestAnimationFrame(am._render);
    }
  }

  _animate(percent) {
    const am = this;
    const step_from = am._step_from;
    const step_to = am._step_to;

    /**
     * Interpolations
     */
    const position = am._linrp(step_from.center, step_to.center, percent);
    const altitude = am._linrp(step_from.altitude, step_to.altitude, percent);

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

    am._updateCameraPosition(position, altitude, lookAt, pitch, bearing);
  }

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

  _updateCameraPosition(position, altitude, lookAt, pitch, bearing) {
    const am = this;
    const co = am._map.getFreeCameraOptions();

    co.position = window.mapboxgl.MercatorCoordinate.fromLngLat(
      position,
      altitude
    );

    if (lookAt) {
      co.lookAtPoint(lookAt);
    } else if (pitch && bearing) {
      co.setPitchBearing(pitch, bearing);
    }

    am._map.setFreeCameraOptions(co);
  }
}

export {MinAniMap, Timer};
