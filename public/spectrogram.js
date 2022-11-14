// const canvas = <HTMLCanvasElement>document.getElementById('canvas')
function resize(canvas) {
    if (canvas === null) {
        return;
    }
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
}
function initializeCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    if (ctx != null) {
        ctx.fillStyle = "green";
        ctx.fillRect(10, 10, 150, 100);
    }
}
export { resize, initializeCanvas };
