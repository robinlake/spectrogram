var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createSpectralTimeSeries } from './timeseries.js';
const getUserMic = () => {
    return navigator.mediaDevices.getUserMedia({
        audio: true,
    });
};
function setupAudioContext(spectrogram) {
    return __awaiter(this, void 0, void 0, function* () {
        const { context, analyserNode, gainNode } = spectrogram;
        const mic = yield getUserMic();
        if (context.state === 'suspended') {
            yield context.resume();
        }
        const source = context.createMediaStreamSource(mic);
        source
            .connect(gainNode)
            .connect(analyserNode);
        spectrogram.source = source;
    });
}
function connectAudioDestination(spectrogram) {
    if (!spectrogram.source) {
        return;
    }
    spectrogram.source.connect(spectrogram.context.destination);
}
function disconnectAudioDestination(spectrogram) {
    if (!spectrogram.source) {
        return;
    }
    spectrogram.source.disconnect(spectrogram.context.destination);
}
function initializeSpectrogram(config) {
    const { sampleRate, fftSize, maxSampleCount } = config;
    const context = new AudioContext({ sampleRate });
    const analyserNode = new AnalyserNode(context, { fftSize });
    const volume = document.getElementById('volume');
    const gainNode = new GainNode(context, { gain: Number(volume.value) });
    const frequencyBinCount = fftSize / 2;
    const timeSeries = createSpectralTimeSeries(sampleRate, maxSampleCount, frequencyBinCount, analyserNode);
    const spectrogram = {
        analyserNode,
        context,
        volume,
        gainNode,
        config,
        connectAudioDestination,
        disconnectAudioDestination,
        timeSeries,
    };
    setupAudioContext(spectrogram);
    return spectrogram;
}
export { initializeSpectrogram };
