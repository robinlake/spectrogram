function resize(canvasElement, config) {
    canvasElement.width = config.width;
    canvasElement.height = config.height;
}
function createCanvas(config, parentElement) {
    const canvasElement = document.createElement("canvas");
    canvasElement.setAttribute("id", "canvas");
    parentElement.appendChild(canvasElement);
    const context = canvasElement.getContext("2d");
    if (context === null) {
        return null;
    }
    const canvas = {
        config,
        canvasElement,
        context,
        resize: () => resize(canvasElement, config),
        startAnimating: drawCanvasFrame,
        animationFrame: null,
        stopAnimating,
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
    const canvasContext = canvas.context;
    canvasContext.clearRect(0, 0, canvas.canvasElement.width, canvas.canvasElement.height);
    const columnWidth = canvas.canvasElement.width / decibelValues.length;
    const binHeight = canvas.canvasElement.height / frequencyBinCount;
    decibelValues.forEach((decibels, index) => {
        drawColumn(canvas, decibels, binHeight, index, columnWidth);
    });
}
function drawColumn(canvas, decibelValues, binHeight, index, columnWidth) {
    decibelValues.forEach((decibelValue, i) => {
        canvas.context.fillStyle = `hsl(${decibelValue}, 100%, 50%)`;
        const yStart = canvas.canvasElement.height - (binHeight * (i + 1)); // canvas.height corresponds to bottom of the canvas
        canvas.context.fillRect(index * columnWidth, yStart, columnWidth, binHeight);
    });
}
// function getLightnessPercent(value: number, maxValue: number): number {
//     return Math.round((value/maxValue) * 100)
// }
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
function drawCanvasFrame(timeSeries, canvas) {
    canvas.animationFrame = requestAnimationFrame(() => drawCanvasFrame(timeSeries, canvas));
    timeSeries.pushDecibelValues(timeSeries.decibelValues, timeSeries.analyserNode, timeSeries.maxSampleCount);
    drawColumns(canvas, timeSeries);
}
export { resize, drawColumn, drawCanvasFrame, createCanvas };
