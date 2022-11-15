import { drawCanvasFrame } from './canvas.js';
function stopSpectrogram() {
}
function initializeControls(canvas, timeSeries) {
    const startButton = document.getElementById("startButton");
    if (startButton != null) {
        startButton.addEventListener("click", () => {
            if (canvas != null) {
                drawCanvasFrame(timeSeries, canvas);
            }
        });
    }
}
export { initializeControls };
// function loadControlsUI() {
//     // const fragment = document.createDocumentFragment();
//     const controls = document.createElement("div");
//     controls.className = "controls";
//     const controlHeader = document.createElement("h2");
//     controlHeader.textContent = "Controls";
//     controls.appendChild(controlHeader);
//     const volumeLabel = document.createElement("label")
//     volumeLabel.innerHTML = "Volume"
//     volumeLabel.setAttribute("for", "volume")
//     controls.appendChild(volumeLabel);
//     document.body.insertAdjacentElement("beforeend", controls);
// }
// export {loadControlsUI};