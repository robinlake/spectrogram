import {SpectralTimeSeries} from './timeseries.js';
interface CanvasConfig {
    height: number;
    width: number;
    alpha: boolean;
    minDisplayedFrequency: number;
    maxDisplayedFrequency: number;
}

interface Canvas {
    config: CanvasConfig;
    canvasElement: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    resize: () => void;
    animationFrame: number | null;
    startAnimating: (canvas: Canvas, timeSeries: SpectralTimeSeries) => void;
    stopAnimating: (animationFrame: number) => void;
    animationFunction: (canvas: Canvas, timeSeries: SpectralTimeSeries) => void;
    setAnimationRate: (canvas: Canvas, interval: number) => void;
    clearCanvas: (canvas: Canvas) => void;
}

function resize(canvas: Canvas) {
    const {canvasElement, config} = canvas;
    let width = config.width * window.innerWidth;
    let height = config.height * window.innerHeight;
    if (window.innerWidth < 768) {
        width = window.innerWidth;
    }
    // const height = window.innerHeight * config.height;
    // const height = Math.min(config.height, width * 1.2);
    canvasElement.width = width;
    canvasElement.height = height;
  }

function setParentDimensions(config: CanvasConfig, parentElement: HTMLElement) {
    parentElement.style.height = Math.max((window.innerHeight * config.height), parentElement.clientHeight).toString();
}

function createSpectrogramCanvas(config: CanvasConfig, parentElement: HTMLElement): Canvas | null {
    return createCanvas(config, parentElement, drawSpectrogramCanvasFrame, throttled(drawColumns, 250))
}

function createLegendCanvas(config: CanvasConfig, parentElement: HTMLElement): Canvas | null {
    return createCanvas(config, parentElement, drawLegendCanvasFrame, throttled(drawLegend, 1000))
}

function createOscilloscopeCanvas(config: CanvasConfig, parentElement: HTMLElement): Canvas | null {
    return createCanvas(config, parentElement, drawOscilloscopeCanvasFrame, drawOscilloscopeVisual)
}

function createFrequencyCanvas(config: CanvasConfig, parentElement: HTMLElement): Canvas | null {
    return createCanvas(config, parentElement, drawFrequencyCanvasFrame, drawBars)
}

function createCanvas(
    config: CanvasConfig, 
    parentElement: HTMLElement, 
    startAnimating: (canvas: Canvas, timeSeries: SpectralTimeSeries) => void,
    animationFunction: (canvas: Canvas, timeSeries: SpectralTimeSeries) => void,
    ): Canvas | null {
    setParentDimensions(config, parentElement);
    const canvasElement = document.createElement("canvas");
    canvasElement.setAttribute("id", "canvas");
    parentElement.appendChild(canvasElement);
    const context = canvasElement.getContext("2d", {alpha: config.alpha});
    if (context === null) {
        return null;
    }
    const canvas: Canvas = {
        config,
        canvasElement,
        context,
        resize: () => resize(canvas),
        startAnimating,
        animationFrame: null,
        stopAnimating,
        animationFunction,
        clearCanvas,
        setAnimationRate,
    }
    canvas.resize();
    window.addEventListener('resize', () => canvas.resize());
    return canvas;
}

function stopAnimating(animationFrame: number) {
    window.cancelAnimationFrame(animationFrame);
}

function setAnimationRate(canvas: Canvas, interval: number) {
    const anim = <any>canvas.animationFunction;
        anim.changeInterval?.(interval);
}

function drawColumns(canvas: Canvas,  timeSeries: SpectralTimeSeries) {
    // const {frequencyBinCount, decibelValues} = timeSeries;
    // const canvasContext = canvas.context;
    // const canvasContext = document.createElement('canvas')
    // canvasContext.clearRect(0, 0, canvas.canvasElement.width, canvas.canvasElement.height)
    const decibelValuesToDisplay = timeSeries.getDecibelValuesForFrequencyRange(canvas.config.minDisplayedFrequency, canvas.config.maxDisplayedFrequency, timeSeries);
    canvas.context.fillStyle = "hsl(255, 100%, 50%)";
    const columnWidth = canvas.canvasElement.width / decibelValuesToDisplay.length;
    const binHeight = canvas.canvasElement.height / decibelValuesToDisplay[decibelValuesToDisplay.length - 1].length;
    canvas.context.fillRect(0,0, canvas.canvasElement.width, canvas.canvasElement.height);
    
    decibelValuesToDisplay.forEach((decibels, index) => {
        drawColumn(canvas, decibels, binHeight, index, columnWidth)
    })

}

function drawColumn(canvas: Canvas, decibelValues: number[], binHeight: number, index: number, columnWidth: number) {
    for (const [i, decibelValue] of decibelValues.entries()) {
        if (decibelValue === 0) {
            continue;
        }
        const h = 255 - decibelValue;
        canvas.context.fillStyle = `hsl(${h}, 100%, 50%)`
        const yStart = canvas.canvasElement.height - (binHeight * (i + 1)) // canvas.height corresponds to bottom of the canvas
        canvas.context.fillRect(index * columnWidth, yStart, columnWidth, binHeight)
    }
}


function drawOscilloscopeVisual(canvas: Canvas,  timeSeries: SpectralTimeSeries) {
    const {timeDomainValues} = timeSeries;
    const canvasContext = canvas.context;
    canvasContext.clearRect(0, 0, canvas.canvasElement.width, canvas.canvasElement.height)
    // canvasContext.fillStyle = 'rgb(230, 20, 210)';
    // canvasContext.fillRect(0, 0, canvas.canvasElement.width, canvas.canvasElement.height);
    canvasContext.lineWidth = 2
    canvasContext.strokeStyle = 'rgb(0,0,0)';
    canvasContext.beginPath();
    const bufferLength = timeSeries.analyserNode.frequencyBinCount;
    let sliceWidth = canvas.canvasElement.width / bufferLength;
    const column = timeDomainValues[timeDomainValues.length - 1];
    let x = 0;

    for(var i = 0; i < bufferLength; i++) {
    
            var v = column[i] / 128.0;
            var y = v * canvas.canvasElement.height/2;

            if(i === 0) {
            canvasContext.moveTo(x, y);
            } else {
            canvasContext.lineTo(x, y);
            }

            x += sliceWidth;
        };
        canvasContext.lineTo(canvas.canvasElement.width, canvas.canvasElement.height/2);
        canvasContext.stroke();
}


function clearCanvas(canvas: Canvas) {
    canvas.context.clearRect(0, 0, canvas.canvasElement.width, canvas.canvasElement.height)
}


function drawBars(canvas: Canvas, timeSeries: SpectralTimeSeries) {
    // const {frequencyBinCount} = timeSeries;
    const canvasContext = canvas.context
    // const frequencies = timeSeries.getFrequencies(frequencyBinCount, timeSeries.maxFrequency);
    const frequencies = timeSeries.getDisplayedFrequencies(canvas.config.minDisplayedFrequency, canvas.config.maxDisplayedFrequency, timeSeries);
    const decibelValuesToDisplay = timeSeries.getDecibelValuesForFrequencyRange(canvas.config.minDisplayedFrequency, canvas.config.maxDisplayedFrequency, timeSeries);
    // console.log("newFrequencies: ", newFrequencies);
  
    const mostRecentDecibelValues = decibelValuesToDisplay[decibelValuesToDisplay.length - 1];
    // const mostRecentDecibelValues = decibelValues[decibelValues.length - 1];
    const copy = mostRecentDecibelValues.slice();
    const sorted = copy.sort((a, b) => a < b ? 1 : -1)
    const labelCutoffValue = sorted[20]

    const width = canvas.canvasElement.width
    const height = canvas.canvasElement.height
    // const barWidth = width / frequencyBinCount
    const barWidth = width / mostRecentDecibelValues.length
  
    canvasContext.clearRect(0, 0, width, height)

    mostRecentDecibelValues.forEach((item, index) => {
        const y = item / 255 * height / 2
        const x = barWidth * index
    
        // check if current value is the max of the 3 preceding and 3 following values, accounting for out of bound array indices
        const localMax = isLocalMaximum(item, mostRecentDecibelValues.slice(Math.max(0, index- 3), Math.min(index + 3, mostRecentDecibelValues.length - 1)))
        drawBar(x, y, height, barWidth, canvasContext)
        if (item > labelCutoffValue && localMax ) {
            canvasContext.strokeText(frequencies[index].toString(), x, height - y)
        }
    })
}

function isLocalMaximum(value: number, range: number[]) {
    return value >= range.reduce((x, y) => x > y ? x : y)
}
  
function drawBar(x: number, y: number, height: number, barWidth: number, canvasContext: CanvasRenderingContext2D) {
    canvasContext.fillStyle = `hsl(${y / height * 400}, 100%, 50%)`
    canvasContext.fillRect(x, height - y, barWidth, y)

}

const throttled = (callback: Function, interval: number) => {
    let allowed = true;
    let currentInterval = interval;
    const throttledFunc = (...params: any[]) => {
        if (allowed) {
            callback(...params);
            allowed = false
            setTimeout(() => allowed = true, currentInterval)
        } 
        }
    throttledFunc.changeInterval = (newInterval: number) => currentInterval = newInterval;
    return throttledFunc;
}

function drawLegend(canvas: Canvas, timeSeries: SpectralTimeSeries) {
    const {minDisplayedFrequency, maxDisplayedFrequency} = canvas.config;
    const displayedFrequencies = timeSeries.getDisplayedFrequencies(minDisplayedFrequency, maxDisplayedFrequency, timeSeries);
    // const frequencies = timeSeries.getFrequencies(timeSeries.frequencyBinCount, timeSeries.maxFrequency);
    // const iterationHeight = canvas.canvasElement.height / timeSeries.frequencyBinCount
    const iterationHeight = canvas.canvasElement.height / displayedFrequencies.length;
    const minRowHeight = 30;
    let currentRowHeight = 10;
    canvas.context.fillStyle = "rgb(255, 255, 255)";
    canvas.context.fillRect(0,0, 60, canvas.canvasElement.height);
    canvas.context.font = "16px bold";
    for (const [index, frequency] of displayedFrequencies.entries()) {
    // for (const [index, frequency] of frequencies.entries()) {
        currentRowHeight += iterationHeight;
        if (currentRowHeight >= minRowHeight) {
            const height = (iterationHeight) * index;
            canvas.context.strokeText(Math.round(frequency).toString() + " hz", 0, canvas.canvasElement.height - height);
            currentRowHeight = 0;
        }
    }
}

function drawLegendCanvasFrame(canvas: Canvas, timeSeries: SpectralTimeSeries) {
    canvas.animationFrame = requestAnimationFrame(() => drawLegendCanvasFrame(canvas, timeSeries))
    canvas.animationFunction(canvas, timeSeries);

}
function drawSpectrogramCanvasFrame(canvas: Canvas, timeSeries: SpectralTimeSeries) {
    canvas.animationFrame = requestAnimationFrame(() => drawSpectrogramCanvasFrame(canvas, timeSeries))
    timeSeries.pushDecibelValues(timeSeries.decibelValues, timeSeries.analyserNode, timeSeries.maxSampleCount);
    canvas.animationFunction(canvas, timeSeries);

}

function drawOscilloscopeCanvasFrame(canvas: Canvas, timeSeries: SpectralTimeSeries) {
    canvas.animationFrame = requestAnimationFrame(() => drawOscilloscopeCanvasFrame(canvas, timeSeries))
    timeSeries.pushTimeDomainValues(timeSeries.timeDomainValues, timeSeries.analyserNode, timeSeries.maxSampleCount);
  
    canvas.animationFunction(canvas, timeSeries);
}

function drawFrequencyCanvasFrame(canvas: Canvas, timeSeries: SpectralTimeSeries) {
    canvas.animationFrame = requestAnimationFrame(() => drawFrequencyCanvasFrame(canvas, timeSeries))
    timeSeries.pushDecibelValues(timeSeries.decibelValues, timeSeries.analyserNode, timeSeries.maxSampleCount);
    canvas.animationFunction(canvas, timeSeries);
}

export {resize, drawColumn, CanvasConfig, createSpectrogramCanvas, Canvas, createLegendCanvas, createOscilloscopeCanvas, createFrequencyCanvas};