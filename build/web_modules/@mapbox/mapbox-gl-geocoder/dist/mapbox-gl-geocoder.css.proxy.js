// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = "/* Basics */\n.mapboxgl-ctrl-geocoder,\n.mapboxgl-ctrl-geocoder *,\n.mapboxgl-ctrl-geocoder *:after,\n.mapboxgl-ctrl-geocoder *:before {\n  box-sizing: border-box;\n}\n\n.mapboxgl-ctrl-geocoder {\n  font-size: 18px;\n  line-height: 24px;\n  font-family: \"Open Sans\", \"Helvetica Neue\", Arial, Helvetica, sans-serif;\n  position: relative;\n  background-color: #fff;\n  width: 100%;\n  min-width: 240px;\n  z-index: 1;\n  border-radius: 4px;\n  transition: width .25s, min-width .25s;\n}\n\n.mapboxgl-ctrl-geocoder--input {\n  font: inherit;\n  width: 100%;\n  border: 0;\n  background-color: transparent;\n  margin: 0;\n  height: 50px;\n  color: #404040; /* fallback */\n  color: rgba(0, 0, 0, 0.75);\n  padding: 6px 45px;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n}\n\n.mapboxgl-ctrl-geocoder--input::-ms-clear {\n  display: none; /* hide input clear button in IE */\n}\n\n.mapboxgl-ctrl-geocoder--input:focus {\n  color: #404040; /* fallback */\n  color: rgba(0, 0, 0, 0.75);\n  outline: 0;\n  box-shadow: none;\n  outline: thin dotted;\n}\n\n.mapboxgl-ctrl-geocoder .mapboxgl-ctrl-geocoder--pin-right > * {\n  z-index: 2;\n  position: absolute;\n  right: 8px;\n  top: 7px;\n  display: none;\n}\n\n.mapboxgl-ctrl-geocoder,\n.mapboxgl-ctrl-geocoder .suggestions {\n  box-shadow: 0 0 10px 2px rgba(0,0,0,.1);\n}\n\n/* Collapsed */\n.mapboxgl-ctrl-geocoder.mapboxgl-ctrl-geocoder--collapsed {\n  width: 50px;\n  min-width: 50px;\n  transition: width .25s, min-width .25s;\n}\n\n/* Suggestions */\n.mapboxgl-ctrl-geocoder .suggestions {\n  background-color: #fff;\n  border-radius: 4px;\n  left: 0;\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  position: absolute;\n  width: 100%;\n  top: 110%; /* fallback */\n  top: calc(100% + 6px);\n  z-index: 1000;\n  overflow: hidden;\n  font-size: 15px;\n}\n\n.mapboxgl-ctrl-bottom-left .suggestions,\n.mapboxgl-ctrl-bottom-right .suggestions {\n  top: auto;\n  bottom: 100%;\n}\n\n.mapboxgl-ctrl-geocoder .suggestions > li > a {\n  cursor: default;\n  display: block;\n  padding: 6px 12px;\n  color: #404040;\n}\n\n.mapboxgl-ctrl-geocoder .suggestions > .active > a,\n.mapboxgl-ctrl-geocoder .suggestions > li > a:hover {\n  color: #404040;\n  background-color: #f3f3f3;\n  text-decoration: none;\n  cursor: pointer;\n}\n\n.mapboxgl-ctrl-geocoder--suggestion-title {\n  font-weight: bold;\n}\n\n.mapboxgl-ctrl-geocoder--suggestion-title,\n.mapboxgl-ctrl-geocoder--suggestion-address {\n  text-overflow: ellipsis;\n  overflow: hidden;\n  white-space: nowrap;\n}\n\n/* Icons */\n.mapboxgl-ctrl-geocoder--icon {\n  display: inline-block;\n  vertical-align: middle;\n  speak: none;\n  fill: #757575;\n  top: 15px;\n}\n\n.mapboxgl-ctrl-geocoder--icon-search {\n  position: absolute;\n  top: 13px;\n  left: 12px;\n  width: 23px;\n  height: 23px;\n}\n\n.mapboxgl-ctrl-geocoder--button {\n  padding: 0;\n  margin: 0;\n  border: none;\n  cursor: pointer;\n  background: #fff;\n  line-height: 1;\n}\n\n.mapboxgl-ctrl-geocoder--icon-close {\n  width: 20px;\n  height: 20px;\n  margin-top: 8px;\n  margin-right: 3px;\n}\n\n.mapboxgl-ctrl-geocoder--button:hover .mapboxgl-ctrl-geocoder--icon-close {\n  fill: #909090;\n}\n\n.mapboxgl-ctrl-geocoder--icon-loading {\n  width: 26px;\n  height: 26px;\n  margin-top: 5px;\n  margin-right: 0px;\n  -moz-animation: rotate 0.8s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95);\n  -webkit-animation: rotate 0.8s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95);\n  animation: rotate 0.8s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95);\n}\n\n/* Animation */\n@-webkit-keyframes rotate {\n  from {\n    -webkit-transform: rotate(0);\n    transform: rotate(0);\n  }\n  to {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n\n@keyframes rotate {\n  from {\n    -webkit-transform: rotate(0);\n    transform: rotate(0);\n  }\n  to {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n\n/* Media queries*/\n@media screen and (min-width: 640px) {\n\n  .mapboxgl-ctrl-geocoder.mapboxgl-ctrl-geocoder--collapsed {\n    width: 36px;\n    min-width: 36px;\n  }\n\n  .mapboxgl-ctrl-geocoder {\n    width: 33.3333%;\n    font-size: 15px;\n    line-height: 20px;\n    max-width: 360px;\n  }\n  .mapboxgl-ctrl-geocoder .suggestions {\n    font-size: 13px;\n  }\n\n  .mapboxgl-ctrl-geocoder--icon {\n    top: 8px;\n  }\n\n  .mapboxgl-ctrl-geocoder--icon-close {\n    width: 16px;\n    height: 16px;\n    margin-top: 3px;\n    margin-right: 0;\n  }\n\n  .mapboxgl-ctrl-geocoder--icon-search {\n    left: 7px;\n    width: 20px;\n    height: 20px;\n  }\n\n  .mapboxgl-ctrl-geocoder--input {\n    height: 36px;\n    padding: 6px 35px;\n  }\n\n  .mapboxgl-ctrl-geocoder--icon-loading {\n    width: 26px;\n    height: 26px;\n    margin-top: -2px;\n    margin-right: -5px;\n  }\n\n  .mapbox-gl-geocoder--error{\n    color:#909090;\n    padding: 6px 12px;\n    font-size: 16px;\n    text-align: center\n  }\n\n}\n";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}