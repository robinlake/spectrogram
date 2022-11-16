function initializeControls(canvas, timeSeries, spectrogram) {
    const { volume, gainNode, context } = spectrogram;
    volume.addEventListener('input', e => {
        if (e.target != null) {
            const value = parseFloat(e.target.value);
            gainNode.gain.setTargetAtTime(value, context.currentTime, .01);
        }
    });
    const startButton = document.getElementById("startButton");
    if (startButton != null) {
        startButton.addEventListener("click", () => {
            if (canvas != null) {
                canvas.startAnimating(timeSeries, canvas);
            }
        });
    }
    const stopButton = document.getElementById("stopButton");
    if (stopButton != null) {
        stopButton.addEventListener("click", () => {
            if (canvas != null && canvas.animationFrame != null) {
                canvas.stopAnimating(canvas.animationFrame);
            }
        });
    }
    const resetButton = document.getElementById("resetButton");
    if (resetButton != null) {
        resetButton.addEventListener("click", () => {
            timeSeries.clearDecibelValues(timeSeries);
        });
    }
    const hearAudio = document.getElementById("hearAudio");
    if (hearAudio != null) {
        hearAudio.addEventListener("change", function () {
            if (this.checked) {
                spectrogram.connectAudioDestination(spectrogram);
            }
            else {
                spectrogram.disconnectAudioDestination(spectrogram);
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
