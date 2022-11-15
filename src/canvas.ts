import {SpectralTimeSeries} from './spectrogram.js';
interface CanvasConfig {
    height: number;
    width: number;
}

interface Canvas {
    config: CanvasConfig;
    canvasElement: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    resize: () => void;
    animationFrame: number | null;
    startAnimating: (timeSeries: SpectralTimeSeries, canvas: Canvas) => void;
    stopAnimating: (animationFrame: number) => void;
}

function resize(canvasElement: HTMLCanvasElement, config: CanvasConfig) {
    canvasElement.width = config.width;
    canvasElement.height = config.height;
  }

function createCanvas(config: CanvasConfig, parentElement: HTMLElement): Canvas | null {
    const canvasElement = document.createElement("canvas");
    canvasElement.setAttribute("id", "canvas");
    parentElement.appendChild(canvasElement);
    const context = canvasElement.getContext("2d");
    if (context === null) {
        return null;
    }
    const canvas: Canvas = {
        config,
        canvasElement,
        context,
        resize: () => resize(canvasElement, config),
        startAnimating: drawCanvasFrame,
        animationFrame: null,
        stopAnimating,
    }
    canvas.resize();
    window.addEventListener('resize', () => canvas.resize());
    return canvas;
}

function stopAnimating(animationFrame: number) {
    window.cancelAnimationFrame(animationFrame);
}

function drawColumns(canvas: HTMLCanvasElement,  frequencyBinCount: number, decibelValues: number[][]) {
    const canvasContext = canvas.getContext('2d')
    if (canvasContext === null) {
        return
    }
    canvasContext.clearRect(0, 0, canvas.width, canvas.height)
    const columnWidth = canvas.width / decibelValues.length;
    const binHeight = canvas.height / frequencyBinCount;
    decibelValues.forEach((decibels, index) => {
        drawColumn(canvas, canvasContext, decibels, binHeight, index, columnWidth)
    })

}

function drawColumn(canvas: HTMLCanvasElement, canvasContext: CanvasRenderingContext2D, decibelValues: number[], binHeight: number, index: number, columnWidth: number) {
    decibelValues.forEach((decibelValue, i) => {
        canvasContext.fillStyle = `hsl(${decibelValue}, 100%, 50%)`
        const yStart = canvas.height - (binHeight * (i + 1)) // canvas.height corresponds to bottom of the canvas
        canvasContext.fillRect(index * columnWidth, yStart, columnWidth, binHeight)
    })
}

// function drawBars(canvas: HTMLCanvasElement, frequencyBinCount: number, decibelValues: Uint8Array, frequencies: number[]) {
//     const canvasContext = canvas.getContext('2d')
//     if (canvasContext === null) {
//         return
//     }
//     const width = canvas.width
//     const height = canvas.height
//     const barWidth = width / frequencyBinCount
  
//     canvasContext.clearRect(0, 0, width, height)
  
//     decibelValues.forEach((item, index) => {
//         const y = item / 255 * height / 2
//         const x = barWidth * index
    
//         drawBar(x, y, height, barWidth, canvasContext)
//         if (item > 10) {
//             canvasContext.strokeText(frequencies[index].toString(), x, height - y)
//             canvasContext.strokeText(decibelValues[index].toString(), x, height - (y + 30))
//         }
//     })
// }
  
// function drawBar(x: number, y: number, height: number, barWidth: number, canvasContext: CanvasRenderingContext2D) {
//     canvasContext.fillStyle = `hsl(${y / height * 400}, 100%, 50%)`
//     canvasContext.fillRect(x, height - y, barWidth, y)

// }

function drawCanvasFrame(timeSeries: SpectralTimeSeries, canvas: Canvas) {
    canvas.animationFrame = requestAnimationFrame(() => drawCanvasFrame(timeSeries, canvas))
    timeSeries.pushDecibelValues(timeSeries.decibelValues, timeSeries.analyserNode, timeSeries.maxSampleCount);
  
    const frequencyBinCount = timeSeries.frequencyBinCount
    drawColumns(canvas.canvasElement, frequencyBinCount, timeSeries.decibelValues);
}

export {resize, drawColumn, CanvasConfig, drawCanvasFrame, createCanvas, Canvas};