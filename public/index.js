"use strict";
import { initializeControls } from './controls.js';
import { createCanvas } from './canvas.js';
import { initializeSpectrogram, createSpectralTimeSeries } from './spectrogram.js';
window.onload = () => {
    const fftSize = 256;
    const sampleRate = 4000;
    const maxSampleCount = 200;
    const canvasConfig = {
        height: 500,
        width: 500,
    };
    const spectrogramConfig = {
        fftSize,
        sampleRate,
    };
    const canvasContainer = document.getElementsByClassName('canvas')[0];
    const canvas = createCanvas(canvasConfig, canvasContainer);
    const spectrogram = initializeSpectrogram(spectrogramConfig);
    const timeSeries = createSpectralTimeSeries(spectrogramConfig.sampleRate, maxSampleCount, spectrogramConfig.fftSize / 2, spectrogram.analyserNode);
    timeSeries.pushDecibelValues(timeSeries.decibelValues, spectrogram.analyserNode, timeSeries.maxSampleCount);
    if (canvas === null || canvas === void 0 ? void 0 : canvas.canvasElement) {
        initializeControls(canvas, timeSeries);
    }
};
