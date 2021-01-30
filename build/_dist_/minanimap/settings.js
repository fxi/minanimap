import storyTenke from './stories/tenke_001.json.proxy.js';
import storyAlpine from './stories/alpine_001.json.proxy.js';
import storySarychev from './stories/sarychev_001.json.proxy.js';

/**
 * Default state
 */
const step_config = {
  duration_anim: 5000,
  duration_pause: 0,
  easing: 'linear'
};

const video_config = {
  preset: '720p',
  orientation: 'landscape'
};

const step_id = 0;
const init = false;
const steps = storySarychev.steps;
const state = {init, steps, step_id, video_config, step_config};

/**
 * Demo stories
 */
const stories = [storyTenke, storyAlpine];

/**
 * Video and step config
 */
const presets = [
  {id: '2160p', dim: [3840, 2160], kbps: 53e3},
  {id: '1440p', dim: [2560, 1440], kbps: 24e3},
  {id: '1080p', dim: [1920, 1080], kbps: 12e3},
  {id: '720p', dim: [1280, 720], kbps: 7.5e3},
  {id: '480p', dim: [854, 480], kbps: 4e3},
  {id: '360p', dim: [640, 360], kbps: 1.5e3}
];

export {state, presets, stories};
