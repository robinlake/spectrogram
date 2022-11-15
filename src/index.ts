"use strict";
import {Spectrogram, resize, initializeCanvas, initializeSpectrogram, createSpectralTimeSeries} from './spectrogram.js'
import {drawVisualizer} from './canvas.js';

window.onload = () => {
    const fftSize = 128;
    const sampleRate = 4000;
    const maxSampleCount = 25;
    const canvasConfig = {
        height: 500,
        width: 500,
    }

    const spectrogramConfig = {
        fftSize,
        sampleRate,
    }
    const canvas = <HTMLCanvasElement>document.getElementById('canvas')
    if (canvas != null) {
        initializeCanvas(canvas, canvasConfig);
        resize(canvas);
    }
    const startButton = document.getElementById("startButton");
    if (startButton != null) {
        startButton.addEventListener("click", () => {
            const spectrogram = initializeSpectrogram(spectrogramConfig, canvasConfig);
            const timeSeries = createSpectralTimeSeries(sampleRate, maxSampleCount, fftSize / 2, spectrogram.analyserNode);
            timeSeries.pushDecibelValues(timeSeries.decibelValues, spectrogram.analyserNode, timeSeries.maxSampleCount);
        
            if (canvas != null) {
                // drawVisualizer(spectrogram, canvas);
                drawVisualizer(timeSeries, canvas);
            }
        });
    }
}

