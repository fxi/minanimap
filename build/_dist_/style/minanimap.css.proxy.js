// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = "@import \"https://fonts.googleapis.com/css2?family=Space+Mono&display=swap\";\n@import \"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css\";\n\n/** NOTE:Style built with less, but snowpack had issues importing it. Compiled css version..   */\n\n/* Base and themes  */\nbody.purple * {\n  --ui_bg_color: hsla(308, 60%, 20%, 0.95);\n  --ui_bg_color_transparent: hsla(308, 60%, 20%, 0.4);\n  --ui_fg_color: hsla(308, 60%, 80%, 0.95);\n  --ui_editor_fg_color: hsla(308, 60%, 80%, 0.95);\n  --ui_editor_bg_color: hsl(308, 46%, 37%, 1);\n  --ui_outline: hsla(308, 60%, 90%, 0.95);\n  --ui_border_color: hsl(308deg 45% 35% / 91%);\n  --ui_button_color: hsl(308deg 67% 33% / 53%);\n}\nbody.sat * {\n  --ui_bg_color: hsl(174deg 4% 46%);\n  --ui_bg_color_transparent: hsla(174, 4%, 46%, 0.4);\n  --ui_fg_color: hsl(308deg 21% 91% / 95%);\n  --ui_editor_fg_color: hsl(0deg 0% 94% / 95%);\n  --ui_editor_bg_color: hsla(0, 0%, 60%, 1);\n  --ui_outline: hsl(0deg 0% 45% / 36%);\n  --ui_border_color: hsl(308deg 1% 29% / 91%);\n  --ui_button_color: hsl(308deg 12% 14% / 53%);\n}\n\n* {\n  font-family: 'Space Mono', monospace;\n  color: var(--ui_fg_color);\n  outline: var(--ui_outline);\n}\n\nhtml,\nbody {\n  position: absolute;\n  top: 0;\n  left: 0;\n  height: 100%;\n  width: 100%;\n  margin: 0;\n  padding: 0;\n  max-height: 100%;\n  overflow: hidden;\n}\n\n/* Gridded / checkker baord background  */\nbody {\n  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAANJwAADScBQwZj3AAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAmSURBVBiVY2TAAp49e/YfXYwJm0JsYAAVMmJzuJSUFCPtraa+QgDLYwfEbRLGHgAAAABJRU5ErkJggg==');\n  background-size: 10px 10px;\n  background-position: 0 0, 5px 0, 5px -5px, 0px 5px;\n}\n\n/* Generic hide / show stuff  */\n.hide {\n  display: none !important;\n  pointer-events: none !important;\n}\n.show {\n  display: flex !important;\n  pointer-events: auto !important;\n}\n\n/* Buttons */\n.btns {\n  display: flex;\n  flex-grow: 0;\n  z-index: 10;\n  pointer-events: none;\n  justify-content: center;\n  padding: 10px;\n  flex-wrap: wrap;\n}\n.btns-config {\n  justify-content: flex-start;\n}\n.group-top {\n  padding: 10px;\n  position: absolute;\n  top: 0;\n  justify-content: flex-start;\n  pointer-events: none;\n  z-index: 1;\n}\n.group-bottom {\n  padding: 10px;\n  bottom: 18px;\n  position: absolute;\n  width: calc(100% - 20px);\n  z-index: 2;\n  pointer-events: none;\n  display: flex;\n  justify-content: center;\n}\n\n@media only screen and (max-width: 800px) {\n  .group-bottom {\n    flex-direction: column;\n  }\n}\n#btns-ctrl {\n  justify-content: center;\n}\n.btn-circle {\n  margin: 5px;\n  cursor: pointer;\n  pointer-events: auto;\n  width: 50px;\n  height: 50px;\n  color: var(--ui_fg_color);\n  border: 1px solid var(--ui_border_color);\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background-color: var(--ui_button_color);\n}\n.btn-circle:hover {\n  transform: scale(1.1);\n}\n.btn-circle.disabled {\n  opacity: 0.3;\n  pointer-events: none;\n  cursor: not-allowed;\n}\n#btnPlay.btn-circle:not(.paused) > i.fa-play {\n  display: none;\n}\n#btnPlay.btn-circle.paused > i.fa-pause {\n  display: none;\n}\n#btnRecord.btn-circle:not(.stopped) > i.fa-video {\n  display: none;\n}\n#btnRecord.btn-circle.stopped > i.fa-stop {\n  display: none;\n}\n\n/* Main edition panel  */\n.panel-container {\n  position: absolute;\n  top: 0;\n  left: 0;\n  height: 100%;\n  width: 100%;\n  margin: 0;\n  padding: 40px;\n  overflow: hidden;\n  display: flex;\n  justify-content: flex-start;\n  pointer-events: none;\n  box-sizing: border-box;\n  z-index: 10;\n}\n.panel-container > .panel {\n  transform-origin: top left;\n  width: 400px;\n  height: fit-content;\n  max-height: 100%;\n  overflow-x: hidden;\n  overflow-y: auto;\n  background-color: var(--ui_bg_color);\n  padding: 3px;\n  margin: 3px;\n  display: flex;\n  flex-direction: column;\n  opacity: 0.4;\n  box-sizing: border-box;\n  touch-action: none;\n  border: 1px solid var(--ui_border_color);\n  border-radius: 5px;\n  transition: transform ease-in-out 200ms, opacity ease-in-out 200ms;\n}\n.panel-container > .panel:hover {\n  opacity: 1;\n}\n.panel-container > .panel .code {\n  background-color: var(--ui_editor_bg_color);\n  border: none;\n  border-radius: 3px;\n  color: var(--ui_editor_fg_color);\n  font-family: 'Space Mono', monospace;\n  margin: 5px;\n  width: 100%;\n  max-height: 400px;\n  resize: vertical;\n  overflow-y: auto;\n  overflow-x: hidden;\n}\n.panel-container > .panel .config {\n  padding: 10px;\n}\n.panel-container > .panel .config summary {\n  cursor: pointer;\n}\n.panel-container > .panel .editor-container {\n  display: flex;\n  flex-direction: column;\n}\n.panel-container > .panel .editor-group {\n  display: flex;\n  flex-direction: column;\n  padding: 5px;\n  margin: 5px;\n  border-bottom: 1px solid var(--ui_border_color);\n}\n/*@media only screen and (max-width: 800px) {*/\n/*.panel .editor-container {*/\n/*flex-wrap: wrap-reverse;*/\n/*}*/\n/*.panel .editor-group {*/\n/*width: 100%;*/\n/*}*/\n/*}*/\n\n/* Recording panel */\n\n.progress-recording--container {\n  position: absolute;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  top: 0px;\n  left: 0px;\n  width: 100% !important;\n  height: 100% !important;\n  z-index: 1000;\n  backdrop-filter: blur(10px);\n  transition: backdrop-filter ease-in-out 200ms;\n}\n.progress-recording--container.recording {\n  backdrop-filter: blur(20px);\n  background-color: var(--ui_bg_color_transparent);\n}\n.progress-recording--container.hide {\n  display: none;\n}\n.progress-recording--container > .progress-recording--content {\n  display: flex;\n  align-items: center;\n  flex-direction: column;\n  border-radius: 10px;\n  background-color: var(--ui_bg_color_transparent);\n  padding: 40px;\n}\n\n/*Forms  */\n\n.form-group {\n  display: flex;\n  flex-direction: column;\n  margin-left: 10px;\n  padding: 5px;\n}\n.form-group select {\n  background: var(--ui_button_color);\n  color: var(--ui_fg_color);\n  border-color: var(--ui_border_color);\n  padding: 5px;\n}\n.msg-box {\n  font-size: small;\n  padding-left: 10px;\n  padding-right: 10px;\n  overflow-wrap: anywhere;\n}\n\n/* Map and mpabox gl */\n\n.form-group .mapboxgl-ctrl-geocoder {\n  background-color: inherit;\n  box-shadow: none;\n  width: 100%;\n  font-size: 1em!important;\n  line-height: 1em!important;\n  max-width: 100%;\n  min-width: 30px;\n}\n\n.form-group .mapboxgl-ctrl-geocoder .mapboxgl-ctrl-geocoder--input {\n  background-color: var(--ui_button_color);\n  color: var(--ui_fg_color);\n  border: none;\n  border-radius: 0px;\n}\n.form-group\n  .mapboxgl-ctrl-geocoder\n  .mapboxgl-ctrl-geocoder--input::placeholder {\n  color: var(--ui_fg_color);\n  opacity: 0.5;\n}\n\n.form-group .mapboxgl-ctrl-geocoder .mapboxgl-ctrl-geocoder--input:focus {\n  outline: inherit;\n}\n\n.form-group .mapboxgl-ctrl-geocoder svg.mapboxgl-ctrl-geocoder--icon {\n  fill: var(--ui_fg_color);\n  padding: 3px;\n  padding: 0px;\n  margin: 0px;\n  transform: scale(0.7);\n}\n\n.form-group .mapboxgl-ctrl-geocoder--button {\n  border-radius: 50%;\n}\n\n.form-group .mapboxgl-ctrl-geocoder ul.suggestions {\n  position: static;\n  background-color: var(--ui_bg_color);\n  border-radius: 0px;\n}\n\n.form-group .mapboxgl-ctrl-geocoder .suggestions > .active > a,\n.form-group .mapboxgl-ctrl-geocoder .suggestions > li > a:hover {\n  color: var(--ui_fg_color);\n  background-color: var(--ui_button_color);\n  border-radius: 0;\n}\n\n.form-group .form-group .mapboxgl-ctrl-geocoder {\n  width: 100%;\n  background-color: var(--ui_bg_color);\n}\n.am .mapboxgl-ctrl-logo {\n  filter: opacity(0.5);\n}\n.am .mapboxgl-ctrl.mapboxgl-ctrl-attrib {\n  background-color: var(--ui_border_color);\n}\n#map {\n  position: absolute;\n  top: 0;\n  left: 0;\n  height: 100%;\n  width: 100%;\n  margin: 0;\n  padding: 0;\n  max-height: 100%;\n  overflow: hidden;\n}\n\n/** \n* Input range\n* Initial css done with http://danielstern.ca/range.css/#/\n*/\n\ninput[type='range'] {\n  margin: 5.15px 0;\n  flex-grow: 1;\n  background-color: transparent;\n  -webkit-appearance: none;\n  pointer-events: auto;\n}\ninput[type='range']:focus {\n  outline: none;\n}\ninput[type='range']::-webkit-slider-runnable-track {\n  background: var(--ui_button_color);\n  border: 2px solid var(--ui_border_color);\n  border-radius: 13px;\n  width: 100%;\n  height: 25.7px;\n  cursor: pointer;\n}\ninput[type='range']::-webkit-slider-thumb {\n  margin-top: -7.15px;\n  width: 36px;\n  height: 36px;\n  background: var(--ui_fg_color);\n  border: 2px solid var(--ui_border_color);\n  border-radius: 43px;\n  cursor: pointer;\n  -webkit-appearance: none;\n}\ninput[type='range']:focus::-webkit-slider-runnable-track {\n  background: var(--ui_button_color);\n}\ninput[type='range']::-moz-range-track {\n  background: rgba(169, 170, 169, 0.78);\n  border: 2px solid var(--ui_border_color);\n  border-radius: 13px;\n  width: 100%;\n  height: 25.7px;\n  cursor: pointer;\n}\ninput[type='range']::-moz-range-thumb {\n  width: 36px;\n  height: 36px;\n  background: var(--ui_fg_color);\n  border: 2px solid var(--ui_border_color);\n  border-radius: 43px;\n  cursor: pointer;\n}\n";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}