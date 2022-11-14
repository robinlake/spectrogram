"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resize = exports.visualizer = exports.volume = void 0;
const volume = document.getElementById('volume');
exports.volume = volume;
const visualizer = document.getElementById('visualizer');
exports.visualizer = visualizer;
function resize() {
    if (visualizer === null) {
        return;
    }
    visualizer.width = visualizer.clientWidth * window.devicePixelRatio;
    visualizer.height = visualizer.clientHeight * window.devicePixelRatio;
}
exports.resize = resize;
