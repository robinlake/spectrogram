"use strict";
import {Spectrogram, resize, initializeCanvas, initializeSpectrogram} from './spectrogram.js'

window.onload = () => {
    const fftSize = 128;
    const sampleRate = 4000;
    const canvasConfig = {
        height: 500,
        width: 500,
    }

    const spectrogramConfig = {
        fftSize,
        sampleRate,
        canvasConfig,
    }
    const startButton = document.getElementById("startButton");
    if (startButton != null) {
        startButton.addEventListener("click", () => initializeSpectrogram(spectrogramConfig));
    }
}

