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
    startAnimating: (canvas: Canvas, timeSeries: SpectralTimeSeries) => void;
    stopAnimating: (animationFrame: number) => void;
    drawLegend: (canvas: Canvas, timeSeries: SpectralTimeSeries) => void;
}

function resize(canvasElement: HTMLCanvasElement, config: CanvasConfig) {
    const width = window.innerWidth * config.width;
    const height = Math.min(window.innerHeight * config.height, width);
    canvasElement.width = width;
    canvasElement.height = height;
  }

function createSpectrogramCanvas(config: CanvasConfig, parentElement: HTMLElement): Canvas | null {
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
        drawLegend,
    }
    canvas.resize();
    window.addEventListener('resize', () => canvas.resize());
    return canvas;
}

function createLegendCanvas(config: CanvasConfig, parentElement: HTMLElement): Canvas | null {
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
        drawLegend,
    }
    canvas.resize();
    window.addEventListener('resize', () => canvas.resize());
    return canvas;
}

function stopAnimating(animationFrame: number) {
    window.cancelAnimationFrame(animationFrame);
}

function drawColumns(canvas: Canvas,  timeSeries: SpectralTimeSeries) {
    const {frequencyBinCount, decibelValues} = timeSeries;
    const canvasContext = canvas.context;
    canvasContext.clearRect(0, 0, canvas.canvasElement.width, canvas.canvasElement.height)
    const columnWidth = canvas.canvasElement.width / decibelValues.length;
    const binHeight = canvas.canvasElement.height / frequencyBinCount;
    
    // const maxActualValue = getMax(timeSeries.decibelValues)
    decibelValues.forEach((decibels, index) => {
        // drawColumn(canvas, decibels, binHeight, index, columnWidth, maxActualValue)
        drawColumn(canvas, decibels, binHeight, index, columnWidth)
    })

}

// function getMax(a: number[][]): number{
//     return Math.max(...a.map(e => Array.isArray(e) ? getMax(e) : e));
//   }

// function drawColumn(canvas: Canvas, decibelValues: number[], binHeight: number, index: number, columnWidth: number, maxActualValue: number) {
function drawColumn(canvas: Canvas, decibelValues: number[], binHeight: number, index: number, columnWidth: number) {
    decibelValues.forEach((decibelValue, i) => {
        // console.log(maxActualValue)
        const h = 255 - decibelValue;
        canvas.context.fillStyle = `hsl(${h}, 100%, 50%)`
        // canvas.context.fillStyle = `rgb(${(decibelValue / maxActualValue) * 255}, 0, 0)`
        const yStart = canvas.canvasElement.height - (binHeight * (i + 1)) // canvas.height corresponds to bottom of the canvas
        canvas.context.fillRect(index * columnWidth, yStart, columnWidth, binHeight)
    })
}

function drawLegend(canvas: Canvas, timeSeries: SpectralTimeSeries) {
    const frequencies = timeSeries.getFrequencies(timeSeries.frequencyBinCount, timeSeries.maxFrequency);
    frequencies.forEach((frequency, i) => {
        const height = (canvas.canvasElement.height / timeSeries.frequencyBinCount) * i;
        canvas.context.strokeText(frequency.toString(), 0, height)
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

function drawCanvasFrame(canvas: Canvas, timeSeries: SpectralTimeSeries) {
    canvas.animationFrame = requestAnimationFrame(() => drawCanvasFrame(canvas, timeSeries))
    timeSeries.pushDecibelValues(timeSeries.decibelValues, timeSeries.analyserNode, timeSeries.maxSampleCount);
  
    drawColumns(canvas, timeSeries);
}

export {resize, drawColumn, CanvasConfig, drawCanvasFrame, createSpectrogramCanvas, Canvas, createLegendCanvas};