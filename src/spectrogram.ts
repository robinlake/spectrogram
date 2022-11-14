const spectrogram = <HTMLCanvasElement>document.getElementById('spectrogram')

  
function resize() {
    if (spectrogram === null) {
        return
    }
    spectrogram.width = spectrogram.clientWidth * window.devicePixelRatio
    spectrogram.height = spectrogram.clientHeight * window.devicePixelRatio
  }

  export {spectrogram, resize}