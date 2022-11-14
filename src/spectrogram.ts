// const canvas = <HTMLCanvasElement>document.getElementById('canvas')

interface Spectrogram {
    canvas: HTMLCanvasElement;
    volume: HTMLInputElement;
    resize: (canvas: HTMLCanvasElement) => void;
    initializeCanvas: (canvas: HTMLCanvasElement) => void;
    analyserNode: AnalyserNode;
    context: AudioContext;
    gainNode: GainNode;
}
  
function resize(canvas: HTMLCanvasElement) {
    if (canvas === null) {
        return
    }
    canvas.width = canvas.clientWidth * window.devicePixelRatio
    canvas.height = canvas.clientHeight * window.devicePixelRatio
  }

function initializeCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (ctx != null) {
        ctx.fillStyle = "green";
        ctx.fillRect(10, 10, 150, 100);
    }
}

  export {Spectrogram, resize, initializeCanvas}