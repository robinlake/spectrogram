function initializeControls(spectrogramCanvas, spectrogram, legendCanvas, oscilloscopeCanvas, frequencyCanvas) {
    const { volume, gainNode, context, timeSeries } = spectrogram;
    volume.addEventListener("input", (e) => {
        if (e.target != null) {
            const value = parseFloat(e.target.value);
            gainNode.gain.setTargetAtTime(value, context.currentTime, 0.01);
            const label = volume.nextElementSibling;
            label && (label.innerHTML = Math.round(value * 100).toString() + " %");
        }
    });
    const spectrogramRefresh = document.getElementById("spectrogramRefresh");
    if (spectrogramRefresh != null) {
        spectrogramRefresh.addEventListener("input", (e) => {
            if (e.target != null) {
                const value = parseFloat(e.target.value);
                spectrogramCanvas.setAnimationRate(spectrogramCanvas, value);
                const label = spectrogramRefresh.nextElementSibling;
                label && (label.innerHTML = value.toString() + " ms");
            }
        });
    }
    const startButton = document.getElementById("startButton");
    if (startButton != null) {
        startButton.addEventListener("click", () => {
            if (spectrogramCanvas != null) {
                spectrogramCanvas.startAnimating(spectrogramCanvas, timeSeries);
            }
        });
    }
    const stopButton = document.getElementById("stopButton");
    if (stopButton != null) {
        stopButton.addEventListener("click", () => {
            if (spectrogramCanvas != null &&
                spectrogramCanvas.animationFrame != null) {
                spectrogramCanvas.stopAnimating(spectrogramCanvas.animationFrame);
            }
        });
    }
    const resetButton = document.getElementById("resetButton");
    if (resetButton != null) {
        resetButton.addEventListener("click", () => {
            timeSeries.clearDecibelValues(timeSeries);
            spectrogramCanvas.clearCanvas(spectrogramCanvas);
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
    const legend = document.getElementById("legend");
    if (legend != null) {
        legend.addEventListener("change", function () {
            if (this.checked) {
                legendCanvas.startAnimating(legendCanvas, timeSeries);
            }
            else {
                if (legendCanvas.animationFrame) {
                    legendCanvas.stopAnimating(legendCanvas.animationFrame);
                    legendCanvas.clearCanvas(legendCanvas);
                }
            }
        });
    }
    const oscilloscope = (document.getElementById("oscilloscope"));
    if (oscilloscope != null) {
        oscilloscope.addEventListener("change", function () {
            if (this.checked) {
                oscilloscopeCanvas.startAnimating(oscilloscopeCanvas, timeSeries);
            }
            else {
                if (oscilloscopeCanvas === null || oscilloscopeCanvas === void 0 ? void 0 : oscilloscopeCanvas.animationFrame) {
                    oscilloscopeCanvas.stopAnimating(oscilloscopeCanvas.animationFrame);
                    oscilloscopeCanvas.clearCanvas(oscilloscopeCanvas);
                }
            }
        });
    }
    const frequency = document.getElementById("frequency");
    if (frequency != null) {
        frequency.addEventListener("change", function () {
            if (this.checked) {
                frequencyCanvas.startAnimating(frequencyCanvas, timeSeries);
            }
            else {
                if (frequencyCanvas === null || frequencyCanvas === void 0 ? void 0 : frequencyCanvas.animationFrame) {
                    frequencyCanvas.stopAnimating(frequencyCanvas.animationFrame);
                    frequencyCanvas.clearCanvas(frequencyCanvas);
                }
            }
        });
    }
}
export { initializeControls };
