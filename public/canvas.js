import { getFrequencies } from './spectrogram.js';
function resize(canvas) {
    if (canvas === null) {
        return;
    }
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    // canvas.width = canvas.clientWidth * window.devicePixelRatio
    // canvas.height = canvas.clientHeight * window.devicePixelRatio
}
function initializeCanvas(canvas, config) {
    canvas.width = config.width;
    canvas.height = config.height;
    const ctx = canvas.getContext("2d");
    window.addEventListener('resize', () => resize(canvas));
}
function drawColumns(canvas, frequencyBinCount, decibelValues, frequencies) {
    const canvasContext = canvas.getContext('2d');
    if (canvasContext === null) {
        return;
    }
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    const columnWidth = canvas.width / decibelValues.length;
    const binHeight = canvas.height / frequencyBinCount;
    decibelValues.forEach((decibels, index) => {
        drawColumn(canvas, canvasContext, frequencyBinCount, decibels, binHeight, index, columnWidth);
    });
}
function drawColumn(canvas, canvasContext, frequencyBinCount, decibelValues, binHeight, index, columnWidth) {
    decibelValues.forEach((decibelValue, i) => {
        canvasContext.fillStyle = `hsl(${decibelValue}, 100%, 50%)`;
        const yStart = canvas.height - (binHeight * (i + 1)); // canvas.height corresponds to bottom of the canvas
        canvasContext.fillRect(index * columnWidth, yStart, columnWidth, binHeight);
    });
}
function drawBars(canvas, frequencyBinCount, decibelValues, frequencies) {
    const canvasContext = canvas.getContext('2d');
    if (canvasContext === null) {
        return;
    }
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
function drawCanvasFrame(timeSeries, canvas) {
    requestAnimationFrame(() => drawCanvasFrame(timeSeries, canvas));
    timeSeries.pushDecibelValues(timeSeries.decibelValues, timeSeries.analyserNode, timeSeries.maxSampleCount);
    const frequencyBinCount = timeSeries.frequencyBinCount;
    const maxFrequency = timeSeries.maxFrequency;
    const frequencies = getFrequencies(frequencyBinCount, maxFrequency);
    const canvasContext = canvas.getContext('2d');
    // if (canvasContext != null) {
    //     drawBars(canvas, canvasContext, frequencyBinCount, decibelValues, frequencies)
    // }
    drawColumns(canvas, frequencyBinCount, timeSeries.decibelValues, frequencies);
}
export { resize, initializeCanvas, drawColumn, drawCanvasFrame };
