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
import { canvas, resize } from './spectrogram.js';
const getUserMic = () => {
    return navigator.mediaDevices.getUserMedia({
        audio: true,
    });
};
const connectStreamSourceToNodes = (getStream, context, ...nodes) => __awaiter(void 0, void 0, void 0, function* () {
    const stream = yield getStream();
    const source = context.createMediaStreamSource(stream);
    console.log("source: ", source);
});
function setupEventListeners() {
    window.addEventListener('resize', () => resize(canvas));
}
window.onload = () => {
    const fftSize = 128;
    const sampleRate = 4000;
    const context = new AudioContext({ sampleRate });
    const analyserNode = new AnalyserNode(context, { fftSize });
    connectStreamSourceToNodes(getUserMic, context);
    resize(canvas);
};
