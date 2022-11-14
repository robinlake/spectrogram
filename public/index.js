"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { resize, initializeCanvas } from './spectrogram.js';
const getUserMic = () => {
    return navigator.mediaDevices.getUserMedia({
        audio: true,
    });
};
function setupContext(spectrogram) {
    return __awaiter(this, void 0, void 0, function* () {
        const { context, analyserNode, volume, gainNode } = spectrogram;
        const mic = yield getUserMic();
        if (context.state === 'suspended') {
            yield context.resume();
        }
        const source = context.createMediaStreamSource(mic);
        source
            .connect(gainNode)
            .connect(analyserNode)
            .connect(context.destination);
    });
}
function setupEventListeners(spectrogram) {
    const { canvas, volume, gainNode, context } = spectrogram;
    window.addEventListener('resize', () => resize(canvas));
    volume.addEventListener('input', e => {
        if (e.target != null) {
            console.log("target != null");
            const value = parseFloat(e.target.value);
            gainNode.gain.setTargetAtTime(value, context.currentTime, .01);
        }
    });
}
function drawVisualizer(spectrogram) {
    requestAnimationFrame(() => drawVisualizer(spectrogram));
    const { analyserNode, context, canvas } = spectrogram;
    const bufferLength = analyserNode.frequencyBinCount;
    const maxFrequency = context.sampleRate;
    const frequencyArray = new Array(bufferLength);
    for (let i = 0; i < bufferLength; i++) {
        frequencyArray[i] = ((i + 1) / bufferLength) * maxFrequency;
    }
    const dataArray = new Uint8Array(bufferLength);
    analyserNode.getByteFrequencyData(dataArray);
    const frequencyStrengthMap = new Map();
    for (let i = 0; i < bufferLength; i++) {
        frequencyStrengthMap.set(frequencyArray[i], dataArray[i]);
    }
    let sortedStrengths = new Map([...frequencyStrengthMap.entries()].sort((a, b) => b[1] - a[1]));
    // if (dataArray[0] > 40) {
    //     console.log("bufferLength: ", bufferLength);
    //     console.log("frequencyArray: ", frequencyArray);
    //     console.log("frequencyStrengthMap: ", frequencyStrengthMap);
    //     console.log("sortedStrengths: ", sortedStrengths);
    //     console.log(dataArray);
    // } else {
    //     console.log("dataArray: ", dataArray)
    // }
    // const timeDomainArray = new Uint8Array(bufferLength)
    // analyserNode.getByteTimeDomainData(timeDomainArray)
    // console.log(timeDomainArray);
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / bufferLength;
    const canvasContext = canvas.getContext('2d');
    if (canvasContext != null) {
        canvasContext.clearRect(0, 0, width, height);
        dataArray.forEach((item, index) => {
            const y = item / 255 * height / 2;
            const x = barWidth * index;
            canvasContext.fillStyle = `hsl(${y / height * 400}, 100%, 50%)`;
            canvasContext.fillRect(x, height - y, barWidth, y);
            if (item > 10) {
                canvasContext.strokeText(frequencyArray[index], x, height - y);
            }
        });
    }
}
window.onload = () => {
    const startButton = document.getElementById("startButton");
    if (startButton != null) {
        startButton.addEventListener("click", initializeSpectrogram);
    }
};
function initializeSpectrogram() {
    const fftSize = 128;
    const sampleRate = 4000;
    const context = new AudioContext({ sampleRate });
    const analyserNode = new AnalyserNode(context, { fftSize });
    const canvas = document.getElementById('canvas');
    const volume = document.getElementById('volume');
    const gainNode = new GainNode(context, { gain: Number(volume.value) });
    if (canvas != null) {
        const spectrogram = {
            canvas,
            resize,
            analyserNode,
            context,
            initializeCanvas,
            volume,
            gainNode,
        };
        spectrogram.initializeCanvas(spectrogram.canvas);
        setupEventListeners(spectrogram);
        setupContext(spectrogram);
        resize(spectrogram.canvas);
        drawVisualizer(spectrogram);
    }
}
