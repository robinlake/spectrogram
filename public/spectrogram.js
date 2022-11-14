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
function getFrequencies(spectrogram) {
    const { analyserNode, context } = spectrogram;
    const frequencyBinCount = analyserNode.frequencyBinCount;
    const maxFrequency = context.sampleRate;
    const frequencies = new Array(frequencyBinCount);
    for (let i = 0; i < frequencyBinCount; i++) {
        frequencies[i] = ((i + 1) / frequencyBinCount) * maxFrequency;
    }
    return frequencies;
}
function drawVisualizer(spectrogram) {
    requestAnimationFrame(() => drawVisualizer(spectrogram));
    const { analyserNode, context, canvas } = spectrogram;
    const frequencyBinCount = analyserNode.frequencyBinCount;
    const frequencies = getFrequencies(spectrogram);
    const decibelValues = new Uint8Array(frequencyBinCount);
    analyserNode.getByteFrequencyData(decibelValues);
    const canvasContext = canvas.getContext('2d');
    // if (canvasContext != null) {
    //     drawBars(canvas, canvasContext, frequencyBinCount, decibelValues, frequencies)
    // }
    drawColumn(canvas, frequencyBinCount, decibelValues, frequencies);
}
function drawColumn(canvas, frequencyBinCount, decibelValues, frequencies) {
    const canvasContext = canvas.getContext('2d');
    if (canvasContext === null) {
        return;
    }
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    const columnWidth = 20;
    const binHeight = canvas.height / frequencyBinCount;
    decibelValues.forEach((decibelValue, index) => {
        canvasContext.fillStyle = `hsl(${decibelValue}, 100%, 50%)`;
        const yStart = canvas.height - (binHeight * (index + 1)); // canvas.height corresponds to bottom of the canvas
        canvasContext.fillRect(0, yStart, columnWidth, binHeight);
    });
}
function drawBars(canvas, canvasContext, frequencyBinCount, decibelValues, frequencies) {
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / frequencyBinCount;
    canvasContext.clearRect(0, 0, width, height);
    decibelValues.forEach((item, index) => {
        const y = item / 255 * height / 2;
        const x = barWidth * index;
        drawBar(x, y, height, barWidth, canvasContext);
        if (item > 10) {
            canvasContext.strokeText(frequencies[index].toString(), x, height - y);
            canvasContext.strokeText(decibelValues[index].toString(), x, height - (y + 30));
        }
    });
}
function drawBar(x, y, height, barWidth, canvasContext) {
    canvasContext.fillStyle = `hsl(${y / height * 400}, 100%, 50%)`;
    canvasContext.fillRect(x, height - y, barWidth, y);
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
