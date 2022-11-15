import {Spectrogram, resize, initializeCanvas, initializeSpectrogram, createSpectralTimeSeries, SpectrogramConfig} from './spectrogram.js'
import {drawCanvasFrame, CanvasConfig} from './canvas.js';

function startSpectrogram(spectrogramConfig: SpectrogramConfig, canvasConfig: CanvasConfig, maxSampleCount: number, canvas: HTMLCanvasElement) {
    const spectrogram = initializeSpectrogram(spectrogramConfig, canvasConfig);
    const timeSeries = createSpectralTimeSeries(spectrogramConfig.sampleRate, maxSampleCount, spectrogramConfig.fftSize / 2, spectrogram.analyserNode);
    timeSeries.pushDecibelValues(timeSeries.decibelValues, spectrogram.analyserNode, timeSeries.maxSampleCount);

    if (canvas != null) {
        drawCanvasFrame(timeSeries, canvas);
    }
}

function stopSpectrogram() {

}

function initializeControls() {
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
    const canvas = <HTMLCanvasElement>document.getElementById('canvas')
    if (canvas != null) {
        initializeCanvas(canvas, canvasConfig);
        resize(canvas);
    }
    const startButton = document.getElementById("startButton");
    if (startButton != null) {
        startButton.addEventListener("click", () => startSpectrogram(spectrogramConfig, canvasConfig, maxSampleCount, canvas));
    }
}

export {initializeControls}

// function loadControlsUI() {
//     // const fragment = document.createDocumentFragment();
//     const controls = document.createElement("div");
//     controls.className = "controls";
//     const controlHeader = document.createElement("h2");
//     controlHeader.textContent = "Controls";
//     controls.appendChild(controlHeader);

//     const volumeLabel = document.createElement("label")
//     volumeLabel.innerHTML = "Volume"
//     volumeLabel.setAttribute("for", "volume")
//     controls.appendChild(volumeLabel);

//     document.body.insertAdjacentElement("beforeend", controls);
// }

// export {loadControlsUI};