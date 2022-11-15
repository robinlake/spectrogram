"use strict";
import {initializeControls} from './controls.js';
import {createCanvas} from './canvas.js';
import {Spectrogram, resize, initializeSpectrogram, createSpectralTimeSeries, SpectrogramConfig} from './spectrogram.js'

window.onload = () => {
    const fftSize = 128;
    const sampleRate = 4000;
    const maxSampleCount = 400;
    const canvasConfig = {
        height: 500,
        width: 500,
    }

    const spectrogramConfig = {
        fftSize,
        sampleRate,
    }
    const canvasContainer = <HTMLElement>document.getElementsByClassName('canvas')[0];
    const canvas = createCanvas(canvasConfig, canvasContainer);
    const spectrogram = initializeSpectrogram(spectrogramConfig);
    const timeSeries = createSpectralTimeSeries(spectrogramConfig.sampleRate, maxSampleCount, spectrogramConfig.fftSize / 2, spectrogram.analyserNode);
    timeSeries.pushDecibelValues(timeSeries.decibelValues, spectrogram.analyserNode, timeSeries.maxSampleCount);

    if (canvas?.canvasElement) {
        initializeControls(canvas, timeSeries);
    }
}

