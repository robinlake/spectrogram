const canvas = <HTMLCanvasElement>document.getElementById('canvas')

interface Spectrogram {
    canvas: HTMLCanvasElement;
    resize: (canvas: HTMLCanvasElement) => void;
}
  
function resize(canvas: HTMLCanvasElement) {
    if (canvas === null) {
        return
    }
    canvas.width = canvas.clientWidth * window.devicePixelRatio
    canvas.height = canvas.clientHeight * window.devicePixelRatio
  }

  export {canvas, resize}