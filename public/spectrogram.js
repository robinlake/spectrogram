const canvas = document.getElementById('canvas');
function resize(canvas) {
    if (canvas === null) {
        return;
    }
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
}
export { canvas, resize };
