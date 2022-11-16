"use strict";
import { initializeControls } from './controls.js';
import { createSpectrogramCanvas } from './canvas.js';
import { initializeSpectrogram } from './spectrogram.js';
window.onload = () => {
    const fftSize = 256;
    const sampleRate = 4000;
    const maxSampleCount = 200;
    const width = .8;
    const height = .7;
    const canvasConfig = {
        height: height,
        width: width,
    };
    const spectrogramConfig = {
        fftSize,
        sampleRate,
        maxSampleCount,
    };
    const canvasContainer = document.getElementsByClassName('canvas')[0];
    const canvas = createSpectrogramCanvas(canvasConfig, canvasContainer);
    const spectrogram = initializeSpectrogram(spectrogramConfig);
    // canvas?.drawLegend(canvas, timeSeries);
    if (canvas === null || canvas === void 0 ? void 0 : canvas.canvasElement) {
        initializeControls(canvas, spectrogram);
    }
};
