var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { resize, initializeCanvas } from './canvas.js';
function createSpectralTimeSeries(maxFrequency, maxSampleCount, frequencyBinCount, analyserNode) {
    const decibelValues = [[]];
    const timeSeries = {
        frequencyBinCount,
        maxFrequency,
        maxSampleCount,
        analyserNode,
        getFrequencies: () => getFrequencies(frequencyBinCount, maxFrequency),
        decibelValues,
        pushDecibelValues: (decibelValues, analyserNode, maxSampleCount) => pushDecibelValues(decibelValues, analyserNode, maxSampleCount),
    };
    return timeSeries;
}
function getFrequencies(frequencyBinCount, maxFrequency) {
    const frequencies = new Array(frequencyBinCount);
    for (let i = 0; i < frequencyBinCount; i++) {
        frequencies[i] = ((i + 1) / frequencyBinCount) * maxFrequency;
    }
    return frequencies;
}
function pushDecibelValues(decibelValues, analyserNode, maxSampleCount) {
    const newDecibalValues = new Uint8Array(analyserNode.frequencyBinCount);
    analyserNode.getByteFrequencyData(newDecibalValues);
    decibelValues.push(new Array(...newDecibalValues));
    if (decibelValues.length > maxSampleCount) {
        decibelValues.shift();
    }
    return decibelValues;
}
const getUserMic = () => {
    return navigator.mediaDevices.getUserMedia({
        audio: true,
    });
};
function setupAudioContext(spectrogram) {
    return __awaiter(this, void 0, void 0, function* () {
        const { context, analyserNode, volume, gainNode } = spectrogram;
        const mic = yield getUserMic();
        if (context.state === 'suspended') {
            yield context.resume();
        }
        const source = context.createMediaStreamSource(mic);
        source
            .connect(gainNode)
            .connect(analyserNode);
        // .connect(context.destination)
    });
}
function setupEventListeners(spectrogram) {
    const { volume, gainNode, context } = spectrogram;
    volume.addEventListener('input', e => {
        if (e.target != null) {
            const value = parseFloat(e.target.value);
            gainNode.gain.setTargetAtTime(value, context.currentTime, .01);
        }
    });
}
function initializeSpectrogram(config, canvasConfig) {
    const { sampleRate, fftSize } = config;
    const context = new AudioContext({ sampleRate });
    const analyserNode = new AnalyserNode(context, { fftSize });
    const volume = document.getElementById('volume');
    const gainNode = new GainNode(context, { gain: Number(volume.value) });
    const spectrogram = {
        analyserNode,
        context,
        volume,
        gainNode,
        config,
    };
    setupEventListeners(spectrogram);
    setupAudioContext(spectrogram);
    return spectrogram;
}
export { resize, initializeCanvas, initializeSpectrogram, getFrequencies, createSpectralTimeSeries };
