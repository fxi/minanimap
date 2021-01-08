import mapboxgl from 'mapbox-gl';
import {MinAniMap} from './minanimap.js';
import './style.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import {steps} from './steps.js';


mapboxgl.accessToken =
  'pk.eyJ1IjoiZnJlZGZ4aSIsImEiOiJja2psOTE5YWgwNm1jMnJxcDhmY25qc2gwIn0.VM7P6iTelL_rFnxTkO7LBQ';
window.mapboxgl = mapboxgl;

const map = new mapboxgl.Map({
  container: 'map',
  style: {
    version: 8,
    name: 'studio_is_for_kiddo',
    center: [6.486133305217123, 46.02544605076176],
    zoom: 10.84,
    bearing: 112.79,
    pitch: 78.5,
    light: {
      intensity: 1,
      color: 'hsl(59, 0%, 100%)',
      position: [0.9, 0, 0],
      anchor: 'viewport'
    },
    sources: {
      'mapbox-sat': {
        url: 'mapbox://mapbox.satellite',
        type: 'raster',
        tileSize: 256
      },
      'mapbox-dem': {
        url: 'mapbox://mapbox.terrain-rgb',
        type: 'raster-dem',
        tileSize: 256
      },
      composite: {
        url: 'mapbox://mapbox.mapbox-streets-v8,mapbox.mapbox-terrain-v2',
        type: 'vector'
      }
    },
    sprite:
      'mapbox://sprites/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y/4snix0v8fnkivnb584t41dzcl',
    glyphs: 'mapbox://fonts/mapbox-map-design/{fontstack}/{range}.pbf',
    layers: [
      {
        id: 'background-purple',
        type: 'background',
        layout: {
           visibility:'none'
        },
        paint: {
          'background-color': 'hsla(308, 60%, 31%, 0.95)'
        }
      },
      {
        id: 'background-sat',
        type: 'background',
        layout: {
          visibility: 'visible'
        },
        paint: {
          'background-color': '#ddd'
        }
      },
      {
        id: 'sat',
        type: 'raster',
        source: 'mapbox-sat',
        layout: {visibility: 'visible'},
        paint: {}
      },
      {
        id: 'elevation',
        type: 'fill',
        source: 'composite',
        'source-layer': 'contour',
        layout : {
          visibility:'none'
        },
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'ele'],
            0,
            'hsla(312, 0%, 0%, 0.25)',
            200,
            'hsla(312, 0%, 0%, 0.25)',
            1250,
            'hsla(308, 60%, 31%, 0.95)',
            4500,
            'hsla(308, 65%, 55%, 0.95)'
          ]
        }
      },
      {
        id: 'hillshading',
        type: 'fill',
        source: 'composite',
        'source-layer': 'hillshade',
        layout: {
          visibility: 'none'
        },
        paint: {
          'fill-color': [
            'match',
            ['get', 'class'],
            'highlight',
            'rgba(255,255,255,0.1)',
            'shadow',
            'rgba(12,12,12,0.2)',
            'hsla(0, 0%, 0%, 0)'
          ],
          'fill-outline-color': 'hsla(0,0,0,0)'
        }
      },
      {
        id: 'sky-purple',
        type: 'sky',
layout: {
          visibility: 'none'
        },
        paint: {
          'sky-type': 'gradient',
          'sky-gradient': [
            'interpolate',
            ['linear'],
            ['sky-radial-progress'],
            0.8,
            'hsla(308, 76%, 10%, 0.95)',
            1,
            'hsla(308, 76%, 31%, 0.95)'
          ],
          'sky-gradient-center': [0, 0],
          'sky-gradient-radius': 90,
          'sky-opacity': [
            'interpolate',
            ['exponential', 0.1],
            ['zoom'],
            5,
            0,
            22,
            1
          ]
        }
      },
      {
        id: 'sky-sat',
        type: 'sky',
        layout: {visibility: 'visible'},
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 15
        }
      }
    ]
  }
});

map.on('load', function () {
  map.setTerrain({
    source: 'mapbox-dem',
    exaggeration: 1.5
  });
});

/**
 * Elements
 */
const elBtnPlay = document.getElementById('btnPlay');
const elBtnRecord = document.getElementById('btnRecord');
const elBtnDownload = document.getElementById('btnDownload');
const elBtnEdit = document.getElementById('btnEdit');
const elBtnDiscard = document.getElementById('btnDiscard');
const elBtnReset = document.getElementById('btnReset');
const elBtnAddStep = document.getElementById('btnAddStep');
const elBtnSave = document.getElementById('btnSave');
const elEditPanel = document.getElementById('panelEdit');
const elEditorSteps = document.getElementById('editorSteps');
const elMsgBox = document.getElementById('msgBox');
const elSelTheme = document.getElementById('selTheme');

/**
 * Add Logic
 */
new MinAniMap(map, steps).then((am) => {
  top.am = am;

  elEditorSteps.value = JSON.stringify(am.getSteps(), 0, 2);

  /**
   * MinAniMap Events
   */
  am.on('message', (msg) => {
    elMsgBox.innerHTML = msg;
  });

  am.on('play', () => {
    elBtnPlay.classList.remove('paused');
    elBtnEdit.classList.add('hide');
    elEditPanel.classList.remove('show');
  });
  am.on('pause', () => {
    elBtnPlay.classList.add('paused');
    elBtnEdit.classList.remove('hide');
  });
 
  am.on('record_start', () => {
    elBtnRecord.classList.remove('stopped');
    elBtnDownload.classList.add('hide');
  });
  
  am.on('record_end', () => {
    elBtnRecord.classList.add('stopped');
    if(am._mp4){
      elBtnDownload.classList.remove('hide');
    }
  });

  am.on('reset_steps', () => {
    elEditorSteps.value = JSON.stringify(am.getSteps(), 0, 2);
  });

  
  /**
   * Buttons
   */

  elBtnPlay.addEventListener('click', () => {
    am.toggle();
  });

  elBtnRecord.addEventListener('click', () => {
    am.recordStartStop();
  });
elBtnDownload.addEventListener('click', () => {
    am.recordDownload();
  });

  elBtnEdit.addEventListener('click', () => {
    elEditPanel.classList.toggle('show');
  });

  elBtnAddStep.addEventListener('click', () => {
    const step = am.getCamPos();
    const steps = am.toSteps(elEditorSteps.value);
    steps.push(step);
    elEditorSteps.value = JSON.stringify(steps, 0, 2);
    elEditorSteps.scrollTop = elEditorSteps.scrollHeight;
    elEditorSteps.dispatchEvent(new Event('input'));
  });

  elBtnSave.addEventListener('click', () => {
    am.replaceSteps(elEditorSteps.value);
  });

  elBtnDiscard.addEventListener('click', () => {
    am.removeSteps();
  });

 elBtnReset.addEventListener('click', () => {
    am.resetSteps();
  });

  elEditorSteps.addEventListener('input', () => {
    const valid = am.validateSteps(elEditorSteps.value);
    if (valid) {
      elBtnSave.classList.remove('disabled');
      /**
       * Autosave
       */
      am.replaceSteps(elEditorSteps.value);
    } else {
      elBtnSave.classList.add('disabled');
    }
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
