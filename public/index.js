"use strict";
import { initializeControls } from './controls.js';
import { createSpectrogramCanvas, createLegendCanvas, createOscilloscopeCanvas, createFrequencyCanvas } from './canvas.js';
import { initializeSpectrogram } from './spectrogram.js';
window.onload = () => {
    const fftSize = 2048;
    const sampleRate = 44100;
    // const sampleRate = 4000;
    const minDisplayedFrequency = 32;
    const maxDisplayedFrequency = 4096;
    const maxSampleCount = 200;
    const width = .8;
    const height = width;
    const spectrogramCanvasConfig = {
        height,
        width,
        alpha: true,
        maxDisplayedFrequency,
        minDisplayedFrequency,
    };
    const oscilloscopeCanvasConfig = {
        height,
        width,
        alpha: true,
        maxDisplayedFrequency,
        minDisplayedFrequency,
    };
    const legendCanvasConfig = {
        height,
        width,
        // width: width * 1.2,
        alpha: true,
        maxDisplayedFrequency,
        minDisplayedFrequency,
    };
    const spectrogramConfig = {
        fftSize,
        sampleRate,
        maxSampleCount,
    };
    const canvasContainer = document.getElementsByClassName('canvas')[0];
    const spectrogramCanvas = createSpectrogramCanvas(spectrogramCanvasConfig, canvasContainer);
    const legendCanvas = createLegendCanvas(legendCanvasConfig, canvasContainer);
    const oscilloscopeCanvas = createOscilloscopeCanvas(oscilloscopeCanvasConfig, canvasContainer);
    const frequencyCanvas = createFrequencyCanvas(spectrogramCanvasConfig, canvasContainer);
    const spectrogram = initializeSpectrogram(spectrogramConfig);
    if (spectrogramCanvas && legendCanvas && oscilloscopeCanvas && frequencyCanvas) {
        initializeControls(spectrogramCanvas, spectrogram, legendCanvas, oscilloscopeCanvas, frequencyCanvas);
    }
};
