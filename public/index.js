"use strict";
import { initializeControls } from './controls.js';
window.onload = () => {
    initializeControls();
    // const fftSize = 128;
    // const sampleRate = 4000;
    // const maxSampleCount = 400;
    // const canvasConfig = {
    //     height: 500,
    //     width: 500,
    // }
    // const spectrogramConfig = {
    //     fftSize,
    //     sampleRate,
    // }
    // const canvas = <HTMLCanvasElement>document.getElementById('canvas')
    // if (canvas != null) {
    //     initializeCanvas(canvas, canvasConfig);
    //     resize(canvas);
    // }
    // // loadControlsUI();
    // const startButton = document.getElementById("startButton");
    // if (startButton != null) {
    //     startButton.addEventListener("click", () => startSpectrogram(spectrogramConfig, canvasConfig, maxSampleCount, canvas));
    // }
};
