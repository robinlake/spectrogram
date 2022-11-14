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
Object.defineProperty(exports, "__esModule", { value: true });
const visualizer_js_1 = require("./visualizer.js");
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
    window.addEventListener('resize', visualizer_js_1.resize);
}
function drawVisualizer(analyserNode, context) {
    requestAnimationFrame(() => drawVisualizer(analyserNode, context));
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
    if (dataArray[0] > 40) {
        console.log("bufferLength: ", bufferLength);
        console.log("frequencyArray: ", frequencyArray);
        console.log("frequencyStrengthMap: ", frequencyStrengthMap);
        console.log("sortedStrengths: ", sortedStrengths);
        console.log(dataArray);
    }
    // const timeDomainArray = new Uint8Array(bufferLength)
    // analyserNode.getByteTimeDomainData(timeDomainArray)
    // console.log(timeDomainArray);
    const width = visualizer_js_1.visualizer.width;
    const height = visualizer_js_1.visualizer.height;
    const barWidth = width / bufferLength;
    const canvasContext = visualizer_js_1.visualizer.getContext('2d');
    if (canvasContext === null) {
        return;
    }
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
window.onload = () => {
    const fftSize = 128;
    const sampleRate = 4000;
    const context = new AudioContext({ sampleRate });
    const analyserNode = new AnalyserNode(context, { fftSize });
    console.log("analyserNode: ", analyserNode);
    connectStreamSourceToNodes(getUserMic, context);
    (0, visualizer_js_1.resize)();
    drawVisualizer(analyserNode, context);
};
