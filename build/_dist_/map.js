import mapboxgl from '../web_modules/mapbox-gl.js';
import '../web_modules/mapbox-gl/dist/mapbox-gl.css.proxy.js';
/*
* For initial style position.
* ( Is needed before map loading as default position need it. )
*/
import {state} from './minanimap/settings.js';

const initStep = state.steps[0];

/**
* MapBox Token. I will regret this.
*/
mapboxgl.accessToken =
  'pk.eyJ1IjoiZnJlZGZ4aSIsImEiOiJja2psOTE5YWgwNm1jMnJxcDhmY25qc2gwIn0.VM7P6iTelL_rFnxTkO7LBQ';

window.mapboxgl = mapboxgl;

const map = new mapboxgl.Map({
  container: 'map',
  style: {
    version: 8,
    name: 'studio_is_for_kiddo',
    center: initStep.center,
    zoom: 10.84, // gnn
    bearing: initStep.bearing,
    pitch: initStep.pitch,
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
          visibility: 'none'
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
        layout: {
          visibility: 'none'
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
  // firfox glitch : resize not triggered and wrong center
  map.resize();
  map.setTerrain({
    source: 'mapbox-dem',
    exaggeration: 1.5
  });
});

export {map};
