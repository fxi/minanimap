// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = ".github-corner {\n  z-index: 1;\n  position: absolute;\n  top: 0;\n  right: 0;\n}\n\n.github-corner:hover .octo-arm {\n  animation: octocat-wave 560ms ease-in-out;\n}\n@keyframes octocat-wave {\n  0%,\n  100% {\n    transform: rotate(0);\n  }\n  20%,\n  60% {\n    transform: rotate(-25deg);\n  }\n  40%,\n  80% {\n    transform: rotate(10deg);\n  }\n}\n@media (max-width: 500px) {\n  .github-corner:hover .octo-arm {\n    animation: none;\n  }\n  .github-corner .octo-arm {\n    animation: octocat-wave 560ms ease-in-out;\n  }\n}\n";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}