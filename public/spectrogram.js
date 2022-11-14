// const canvas = <HTMLCanvasElement>document.getElementById('canvas')
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function resize(canvas) {
    if (canvas === null) {
        return;
    }
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
}
function initializeCanvas(canvas, config) {
    canvas.width = config.width;
    canvas.height = config.height;
    const ctx = canvas.getContext("2d");
    if (ctx != null) {
        ctx.fillStyle = "green";
        ctx.fillRect(10, 10, 150, 100);
    }
}
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
function initializeSpectrogram(config) {
    const { sampleRate, fftSize, canvasConfig } = config;
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
            config,
        };
        spectrogram.initializeCanvas(spectrogram.canvas, spectrogram.config.canvasConfig);
        setupEventListeners(spectrogram);
        setupContext(spectrogram);
        resize(spectrogram.canvas);
        drawVisualizer(spectrogram);
    }
}
export { resize, initializeCanvas, initializeSpectrogram };
