/**
 * MinAniMap sample app.
 */
import {MinAniMap} from './minanimap/index.js';
import {FlashIcon} from './flashicon/index.js';
import './style/minanimap.css';
import './style/banner_github.css';
import {map, geocoder} from './map.js';
//import SunCalc from 'suncalc';

/**
 * Elements
 */



/* recording */
const elBtnRecording = document.getElementById('btnRecording');
const elBtnStopRecording = document.getElementById('btnStopRecording');
const elBtnDownload = document.getElementById('btnDownload');
const elContainerProgressRecording = document.getElementById(
  'progressRecordingContainer'
);
const elMsgBoxProgressRecording = document.getElementById(
  'msgBoxProgressRecording'
);

const elBtnCloseRecording = document.getElementById('btnCloseRecording');

/* playing */
const elBtnPlay = document.getElementById('btnPlay');
const elBtnNext = document.getElementById('btnNext');
const elBtnPrevious = document.getElementById('btnPrevious');
const elSliderFrame = document.getElementById('sliderFrame');
/* edit */
const elBtnEdit = document.getElementById('btnEdit');
const elBtnDiscard = document.getElementById('btnDiscard');
const elBtnReset = document.getElementById('btnReset');
const elBtnAddStep = document.getElementById('btnAddStep');
const elBtnCopyUrl = document.getElementById('btnCopyUrl');
const elPanel = document.getElementById('panelEdit');
const elEditorSteps = document.getElementById('editorSteps');
const elEditorVideo = document.getElementById('editorVideo');
const elMsgBoxValidationVideo = document.getElementById(
  'msgBoxValidationVideo'
);
const elMsgBoxValidationSteps = document.getElementById(
  'msgBoxValidationSteps'
);
const elMsgBoxAutoSave = document.getElementById('msgBoxAutoSave');
const elSelTheme = document.getElementById('selTheme');

/*
* Geocoder
*/
const elGeoCoder = document.getElementById('geocoder');
geocoder.addTo(elGeoCoder);


/**
 * Setup minanimap
 */
const url = new URL(document.location);
const stateOrig = JSON.parse(url.searchParams.get('state'));

new MinAniMap(map, stateOrig).then((am) => {
  top.am = am;

  elEditorSteps.value = JSON.stringify(am.getSteps(), 0, 2);
  elEditorVideo.value = JSON.stringify(am.getVideoConfig(), 0, 2);

  /*
  * Render initial frame
  */
  am.render(0);

  /**
   * MinAniMap Events
   */
  am.on('message', (msg) => {
    switch (msg.type) {
      case 'recording_progress':
        elMsgBoxProgressRecording.innerText = `${msg.text}`;
        break;
      case 'validate-steps':
        elMsgBoxValidationSteps.innerText = msg.text;
        break;
      case 'validate-video-config':
        elMsgBoxValidationVideo.innerText = msg.text;
        break;
      default:
        console.log(msg);
    }
  });

  am.on('play_previous', () => {
    new FlashIcon('step-backward');
  });
  am.on('play', () => {
    elBtnPlay.classList.remove('paused');
    new FlashIcon('play');
  });
  am.on('pause', () => {
    elBtnPlay.classList.add('paused');
    new FlashIcon('pause');
  });
  am.on('play_next', () => {
    new FlashIcon('step-forward');
  });

  am.on('recording_start', () => {
    am.pause();
    elContainerProgressRecording.classList.remove('hide');
    elContainerProgressRecording.classList.add('recording');
    elBtnStopRecording.classList.remove('hide');
    elBtnDownload.classList.add('hide');
    elBtnCloseRecording.classList.add('hide');
  });

  am.on('recording_end', () => {
    elBtnStopRecording.classList.add('hide');
    elBtnCloseRecording.classList.remove('hide');
    elContainerProgressRecording.classList.remove('recording');
    if (am._mp4) {
      elBtnDownload.classList.remove('hide');
    }
  });

  am.on('steps_reset', () => {
    elEditorSteps.value = JSON.stringify(am.getSteps(), 0, 2);
    new FlashIcon('undo');
  });
  am.on('steps_removed', () => {
    elEditorSteps.value = JSON.stringify(am.getSteps(), 0, 2);
    new FlashIcon('trash');
  });
  am.on('steps_updated', () => {
    elMsgBoxAutoSave.innerText = `Saved at ${new Date().toLocaleString()}`;
    const newSteps = am.getSteps();
    const oldSteps = elEditorSteps.value;
    /**
     * Do not update if there is only
     * formating changes.
     */
    if (am.equivObject(oldSteps, newSteps)) {
      return;
    }
    elEditorSteps.value = JSON.stringify(newSteps, 0, 2);
  });
  am.on('pre_rendered', (v)=>{
    elSliderFrame.min = 0;
    elSliderFrame.max = v.nFrames - 1;
    elSliderFrame.step = 1
  })
  am.on('render', (id)=>{
    elSliderFrame.value = id;
  })

  /**
   * Buttons
   */

  /*recording*/
  elBtnRecording.addEventListener('click', am.recordingStart);
  elBtnDownload.addEventListener('click', am.recordingDownload);
  elBtnCloseRecording.addEventListener('click', () => {
    elContainerProgressRecording.classList.add('hide');
    am.recordingEnd();
  });
  elBtnStopRecording.addEventListener('click', () => {
    am.recordingEnd();
  });

  /*playing*/
  elBtnPlay.addEventListener('click', am.toggle);
  elBtnNext.addEventListener('click', am.nextStep);
  elBtnPrevious.addEventListener('click', am.previousStep);
  elSliderFrame.addEventListener('input', ()=>{
    am.cancelRender();
    am.render(elSliderFrame.value*1 || 0);
  })
  /* edit */
  elBtnAddStep.addEventListener('click', ()=>{
    am.addStepFromHere();
    new FlashIcon('save');
  });
  elBtnDiscard.addEventListener('click', am.removeSteps);
  elBtnReset.addEventListener('click', am.resetSteps);
  elBtnEdit.addEventListener('click', () => {
    elPanel.classList.toggle('show');
  });

  elBtnCopyUrl.addEventListener('click', () => {
    am.urlCopy();
    new FlashIcon('clipboard');
  });

  elEditorSteps.addEventListener('input', () => {
    am.replaceSteps(elEditorSteps.value);
  });
  elEditorVideo.addEventListener('input', () => {
    am.setVideoConfig(elEditorVideo.value);
  });

  elSelTheme.addEventListener('change', (e) => {
    const theme = e.target.value;
    switch (theme) {
      case 'sat': {
        document.body.classList.add('sat');
        document.body.classList.remove('purple');
        map.setLayoutProperty('hillshading', 'visibility', 'none');
        map.setLayoutProperty('elevation', 'visibility', 'none');
        map.setLayoutProperty('background-purple', 'visibility', 'none');
        map.setLayoutProperty('sky-purple', 'visibility', 'none');

        map.setLayoutProperty('sat', 'visibility', 'visible');
        map.setLayoutProperty('background-sat', 'visibility', 'visible');
        map.setLayoutProperty('sky-sat', 'visibility', 'visible');
        break;
      }
      case 'purple': {
        document.body.classList.add('purple');
        document.body.classList.remove('sat');
        map.setLayoutProperty('hillshading', 'visibility', 'visible');
        map.setLayoutProperty('elevation', 'visibility', 'visible');
        map.setLayoutProperty('sat', 'visibility', 'none');
        map.setLayoutProperty('background-sat', 'visibility', 'none');
        map.setLayoutProperty('sky-sat', 'visibility', 'none');
        map.setLayoutProperty('background-purple', 'visibility', 'visible');
        map.setLayoutProperty('sky-purple', 'visibility', 'visible');
        break;
      }
    }
  });
});
