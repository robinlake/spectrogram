function resize(canvas) {
    const { canvasElement, config } = canvas;
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
function setParentDimensions(config, parentElement) {
    parentElement.style.height = Math.max((window.innerHeight * config.height), parentElement.clientHeight).toString();
}
function createSpectrogramCanvas(config, parentElement) {
    // return createCanvas(config, parentElement, throttled(drawSpectrogramCanvasFrame, 100))
    return createCanvas(config, parentElement, drawSpectrogramCanvasFrame);
}
function createLegendCanvas(config, parentElement) {
    return createCanvas(config, parentElement, drawLegendCanvasFrame);
}
function createOscilloscopeCanvas(config, parentElement) {
    return createCanvas(config, parentElement, drawOscilloscopeCanvasFrame);
}
function createFrequencyCanvas(config, parentElement) {
    return createCanvas(config, parentElement, drawFrequencyCanvasFrame);
}
function createCanvas(config, parentElement, startAnimating) {
    setParentDimensions(config, parentElement);
    const canvasElement = document.createElement("canvas");
    canvasElement.setAttribute("id", "canvas");
    parentElement.appendChild(canvasElement);
    const context = canvasElement.getContext("2d", { alpha: config.alpha });
    if (context === null) {
        return null;
    }
    const canvas = {
        config,
        canvasElement,
        context,
        resize: () => resize(canvas),
        startAnimating,
        animationFrame: null,
        stopAnimating,
        clearCanvas,
    };
    canvas.resize();
    window.addEventListener('resize', () => canvas.resize());
    return canvas;
}
function stopAnimating(animationFrame) {
    window.cancelAnimationFrame(animationFrame);
}
function drawColumns(canvas, timeSeries) {
    const { frequencyBinCount, decibelValues } = timeSeries;
    // const canvasContext = canvas.context;
    // const canvasContext = document.createElement('canvas')
    // canvasContext.clearRect(0, 0, canvas.canvasElement.width, canvas.canvasElement.height)
    canvas.context.fillStyle = "hsl(255, 100%, 50%)";
    const columnWidth = canvas.canvasElement.width / decibelValues.length;
    const binHeight = canvas.canvasElement.height / frequencyBinCount;
    canvas.context.fillRect(0, 0, canvas.canvasElement.width, canvas.canvasElement.height);
    decibelValues.forEach((decibels, index) => {
        drawColumn(canvas, decibels, binHeight, index, columnWidth);
    });
}
function drawColumn(canvas, decibelValues, binHeight, index, columnWidth) {
    for (const [i, decibelValue] of decibelValues.entries()) {
        if (decibelValue === 0) {
            continue;
        }
        const h = 255 - decibelValue;
        canvas.context.fillStyle = `hsl(${h}, 100%, 50%)`;
        const yStart = canvas.canvasElement.height - (binHeight * (i + 1)); // canvas.height corresponds to bottom of the canvas
        canvas.context.fillRect(index * columnWidth, yStart, columnWidth, binHeight);
    }
}
function drawOscilloscopeVisual(canvas, timeSeries) {
    const { timeDomainValues } = timeSeries;
    const canvasContext = canvas.context;
    canvasContext.clearRect(0, 0, canvas.canvasElement.width, canvas.canvasElement.height);
    // canvasContext.fillStyle = 'rgb(230, 20, 210)';
    // canvasContext.fillRect(0, 0, canvas.canvasElement.width, canvas.canvasElement.height);
    canvasContext.lineWidth = 2;
    canvasContext.strokeStyle = 'rgb(0,0,0)';
    canvasContext.beginPath();
    const bufferLength = timeSeries.analyserNode.frequencyBinCount;
    let sliceWidth = canvas.canvasElement.width / bufferLength;
    const column = timeDomainValues[timeDomainValues.length - 1];
    let x = 0;
    for (var i = 0; i < bufferLength; i++) {
        var v = column[i] / 128.0;
        var y = v * canvas.canvasElement.height / 2;
        if (i === 0) {
            canvasContext.moveTo(x, y);
        }
        else {
            canvasContext.lineTo(x, y);
        }
        x += sliceWidth;
    }
    ;
    canvasContext.lineTo(canvas.canvasElement.width, canvas.canvasElement.height / 2);
    canvasContext.stroke();
}
function clearCanvas(canvas) {
    canvas.context.clearRect(0, 0, canvas.canvasElement.width, canvas.canvasElement.height);
}
function drawBars(canvas, timeSeries) {
    const { frequencyBinCount, decibelValues } = timeSeries;
    const canvasContext = canvas.context;
    const frequencies = timeSeries.getFrequencies(frequencyBinCount, timeSeries.maxFrequency);
    const width = canvas.canvasElement.width;
    const height = canvas.canvasElement.height;
    const barWidth = width / frequencyBinCount;
    canvasContext.clearRect(0, 0, width, height);
    const mostRecentDecibelValues = decibelValues[decibelValues.length - 1];
    const copy = mostRecentDecibelValues.slice();
    const sorted = copy.sort((a, b) => a < b ? 1 : -1);
    const labelCutoffValue = sorted[20];
    mostRecentDecibelValues.forEach((item, index) => {
        const y = item / 255 * height / 2;
        const x = barWidth * index;
        // check if current value is the max of the 3 preceding and 3 following values, accounting for out of bound array indices
        const localMax = isLocalMaximum(item, mostRecentDecibelValues.slice(Math.max(0, index - 3), Math.min(index + 3, mostRecentDecibelValues.length - 1)));
        drawBar(x, y, height, barWidth, canvasContext);
        if (item > labelCutoffValue && localMax) {
            canvasContext.strokeText(frequencies[index].toString(), x, height - y);
            // canvasContext.strokeText(decibelValues[index].toString(), x, height - (y + 30))
        }
    });
}
function isLocalMaximum(value, range) {
    return value >= range.reduce((x, y) => x > y ? x : y);
}
function drawBar(x, y, height, barWidth, canvasContext) {
    canvasContext.fillStyle = `hsl(${y / height * 400}, 100%, 50%)`;
    canvasContext.fillRect(x, height - y, barWidth, y);
}
const throttled = (callback, interval) => {
    let allowed = true;
    return (...params) => {
        if (allowed) {
            callback(...params);
            allowed = false;
            setTimeout(() => allowed = true, interval);
        }
        else {
            console.log("not enough time has passed");
        }
    };
};
const throttledDrawColumns = throttled(drawColumns, 50);
const throttledDrawLegend = throttled(drawLegend, 1000);
function drawLegend(canvas, timeSeries) {
    const frequencies = timeSeries.getFrequencies(timeSeries.frequencyBinCount, timeSeries.maxFrequency);
    const iterationHeight = canvas.canvasElement.height / timeSeries.frequencyBinCount;
    const minRowHeight = 30;
    let currentRowHeight = 10;
    canvas.context.fillStyle = "rgb(255, 255, 255)";
    canvas.context.fillRect(0, 0, 60, canvas.canvasElement.height);
    canvas.context.font = "16px bold";
    frequencies.forEach((frequency, i) => {
        currentRowHeight += iterationHeight;
        if (currentRowHeight >= minRowHeight) {
            const height = (iterationHeight) * i;
            canvas.context.strokeText(Math.round(frequency).toString() + " hz", 0, canvas.canvasElement.height - height);
            currentRowHeight = 0;
        }
    });
}
function drawLegendCanvasFrame(canvas, timeSeries) {
    canvas.animationFrame = requestAnimationFrame(() => drawLegendCanvasFrame(canvas, timeSeries));
    throttledDrawLegend(canvas, timeSeries);
}
function drawSpectrogramCanvasFrame(canvas, timeSeries) {
    canvas.animationFrame = requestAnimationFrame(() => drawSpectrogramCanvasFrame(canvas, timeSeries));
    timeSeries.pushDecibelValues(timeSeries.decibelValues, timeSeries.analyserNode, timeSeries.maxSampleCount);
    // drawColumns(canvas, timeSeries);
    throttledDrawColumns(canvas, timeSeries);
}
function drawOscilloscopeCanvasFrame(canvas, timeSeries) {
    canvas.animationFrame = requestAnimationFrame(() => drawOscilloscopeCanvasFrame(canvas, timeSeries));
    timeSeries.pushTimeDomainValues(timeSeries.timeDomainValues, timeSeries.analyserNode, timeSeries.maxSampleCount);
    drawOscilloscopeVisual(canvas, timeSeries);
}
function drawFrequencyCanvasFrame(canvas, timeSeries) {
    canvas.animationFrame = requestAnimationFrame(() => drawFrequencyCanvasFrame(canvas, timeSeries));
    timeSeries.pushDecibelValues(timeSeries.decibelValues, timeSeries.analyserNode, timeSeries.maxSampleCount);
    drawBars(canvas, timeSeries);
}
export { resize, drawColumn, createSpectrogramCanvas, createLegendCanvas, createOscilloscopeCanvas, createFrequencyCanvas };
