"use strict";
import { initializeControls } from './controls.js';
import { initializeCanvas } from './canvas.js';
import { resize, initializeSpectrogram, createSpectralTimeSeries } from './spectrogram.js';
window.onload = () => {
    const fftSize = 128;
    const sampleRate = 4000;
    const maxSampleCount = 400;
    const canvasConfig = {
        height: 500,
        width: 500,
    };
    const spectrogramConfig = {
        fftSize,
        sampleRate,
    };
    const canvas = document.getElementById('canvas');
    if (canvas != null) {
        initializeCanvas(canvas, canvasConfig);
        resize(canvas);
    }
    const spectrogram = initializeSpectrogram(spectrogramConfig);
    const timeSeries = createSpectralTimeSeries(spectrogramConfig.sampleRate, maxSampleCount, spectrogramConfig.fftSize / 2, spectrogram.analyserNode);
    timeSeries.pushDecibelValues(timeSeries.decibelValues, spectrogram.analyserNode, timeSeries.maxSampleCount);
    initializeControls(canvas, timeSeries);
};
