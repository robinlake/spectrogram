"use strict";
import { resize, initializeCanvas, initializeSpectrogram } from './spectrogram.js';
import { drawVisualizer } from './canvas.js';
window.onload = () => {
    const fftSize = 128;
    const sampleRate = 4000;
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
    const startButton = document.getElementById("startButton");
    if (startButton != null) {
        startButton.addEventListener("click", () => {
            const spectrogram = initializeSpectrogram(spectrogramConfig, canvasConfig);
            if (canvas != null) {
                drawVisualizer(spectrogram, canvas);
            }
        });
    }
};
