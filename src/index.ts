"use strict";
import {initializeControls} from './controls.js';
import {createSpectrogramCanvas, createLegendCanvas, createOscilloscopeCanvas} from './canvas.js';
import {initializeSpectrogram} from './spectrogram.js'

window.onload = () => {
    const fftSize = 256;
    const sampleRate = 4000;
    const maxSampleCount = 200;
    const width = .5;
    const height = .5;
    const spectrogramCanvasConfig = {
        height: height,
        width: width,
    }
    const legendCanvasConfig = {
        height: height,
        width: width * 1.2,
    }

    const spectrogramConfig = {
        fftSize,
        sampleRate,
        maxSampleCount,
    }
    const canvasContainer = <HTMLElement>document.getElementsByClassName('canvas')[0];
    const spectrogramCanvas = createSpectrogramCanvas(spectrogramCanvasConfig, canvasContainer);
    const legendCanvas = createLegendCanvas(legendCanvasConfig, canvasContainer);
    const oscilloscopeCanvas = createOscilloscopeCanvas(spectrogramCanvasConfig, canvasContainer);
    const spectrogram = initializeSpectrogram(spectrogramConfig);
    // canvas?.drawLegend(canvas, timeSeries);
    if (spectrogramCanvas && legendCanvas && oscilloscopeCanvas) {
        initializeControls(spectrogramCanvas, spectrogram, legendCanvas, oscilloscopeCanvas);
    }
}

