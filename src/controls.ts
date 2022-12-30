import { Spectrogram } from "./spectrogram.js";
import { Canvas } from "./canvas.js";
import { initializePitchDetect } from "./pitch-detect-foo.js";

function initializeControls(
  spectrogramCanvas: Canvas,
  spectrogram: Spectrogram,
  legendCanvas: Canvas,
  oscilloscopeCanvas: Canvas,
  frequencyCanvas: Canvas
) {
  const { volume, gainNode, context, timeSeries } = spectrogram;
  volume.addEventListener("input", (e) => {
    if (e.target != null) {
      const value = parseFloat((e.target as HTMLInputElement).value);
      gainNode.gain.setTargetAtTime(value, context.currentTime, 0.01);
      const label = volume.nextElementSibling;
      label && (label.innerHTML = Math.round(value * 100).toString() + " %");
    }
  });

  const spectrogramRefresh = document.getElementById("spectrogramRefresh");
  if (spectrogramRefresh != null) {
    spectrogramRefresh.addEventListener("input", (e) => {
      if (e.target != null) {
        const value = parseFloat((e.target as HTMLInputElement).value);
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
      if (
        spectrogramCanvas != null &&
        spectrogramCanvas.animationFrame != null
      ) {
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
  const hearAudio = <HTMLInputElement>document.getElementById("hearAudio");
  if (hearAudio != null) {
    hearAudio.addEventListener("change", function () {
      if (this.checked) {
        spectrogram.connectAudioDestination(spectrogram);
      } else {
        spectrogram.disconnectAudioDestination(spectrogram);
      }
    });
  }
  const legend = <HTMLInputElement>document.getElementById("legend");
  if (legend != null) {
    legend.addEventListener("change", function () {
      if (this.checked) {
        legendCanvas.startAnimating(legendCanvas, timeSeries);
      } else {
        if (legendCanvas.animationFrame) {
          legendCanvas.stopAnimating(legendCanvas.animationFrame);
          legendCanvas.clearCanvas(legendCanvas);
        }
      }
    });
  }

  const oscilloscope = <HTMLInputElement>(
    document.getElementById("oscilloscope")
  );
  if (oscilloscope != null) {
    oscilloscope.addEventListener("change", function () {
      if (this.checked) {
        oscilloscopeCanvas.startAnimating(oscilloscopeCanvas, timeSeries);
      } else {
        if (oscilloscopeCanvas?.animationFrame) {
          oscilloscopeCanvas.stopAnimating(oscilloscopeCanvas.animationFrame);
          oscilloscopeCanvas.clearCanvas(oscilloscopeCanvas);
        }
      }
    });
  }

  const frequency = <HTMLInputElement>document.getElementById("frequency");
  if (frequency != null) {
    frequency.addEventListener("change", function () {
      if (this.checked) {
        frequencyCanvas.startAnimating(frequencyCanvas, timeSeries);
      } else {
        if (frequencyCanvas?.animationFrame) {
          frequencyCanvas.stopAnimating(frequencyCanvas.animationFrame);
          frequencyCanvas.clearCanvas(frequencyCanvas);
        }
      }
    });
  }

  const pitch = document.getElementById("pitch-detect");
  const detector = document.getElementById("detector");
  if (pitch != null && detector != null) {
    let initialized = false;
    let active = false;
    pitch.addEventListener("click", () => {
          if(!initialized) {
            initializePitchDetect();
            initialized = true;
            active = true;
            pitch.innerHTML = "Hide Pitch"
            detector.classList.remove('hidden');
            return;
          }
          if (!active) {
            active = true;
            pitch.innerHTML = "Hide Pitch"
            detector.classList.remove('hidden');
          } else {
            active = false;
            pitch.innerHTML = "Show Pitch"
            detector.classList.add('hidden');
          }
    });
  }

}

export { initializeControls };
