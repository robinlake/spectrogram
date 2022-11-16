"use strict";
import {initializeControls} from './controls.js';
import {createCanvas} from './canvas.js';
import {initializeSpectrogram, createSpectralTimeSeries} from './spectrogram.js'

window.onload = () => {
    const fftSize = 256;
    const sampleRate = 4000;
    const maxSampleCount = 200;
    const width = .8;
    const height = .7;
    const canvasConfig = {
        height: height,
        width: width,
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
        initializeControls(canvas, timeSeries, spectrogram);
    }
}

