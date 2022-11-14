"use strict";
import {spectrogram, resize} from './spectrogram.js'

const getUserMic = (): Promise<MediaStream> => {
    return navigator.mediaDevices.getUserMedia({
        audio: true,
    })
}

const connectStreamSourceToNodes = async (getStream: () => Promise<MediaStream>, context: AudioContext, ...nodes: AudioNode[]) => {
    const stream = await getStream();
    const source = context.createMediaStreamSource(stream);
    console.log("source: ", source);
}

function setupEventListeners() {
    window.addEventListener('resize', resize)

  }

window.onload = () => {
    const fftSize = 128;
    const sampleRate = 4000;
    const context = new AudioContext({sampleRate});
    const analyserNode = new AnalyserNode(context, { fftSize })
    connectStreamSourceToNodes(getUserMic, context);
    resize();
}