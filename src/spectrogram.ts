// const canvas = <HTMLCanvasElement>document.getElementById('canvas')

interface Spectrogram {
    canvas: HTMLCanvasElement;
    volume: HTMLInputElement;
    resize: (canvas: HTMLCanvasElement) => void;
    initializeCanvas: (canvas: HTMLCanvasElement, config: CanvasConfig) => void;
    analyserNode: AnalyserNode;
    context: AudioContext;
    gainNode: GainNode;
    config: SpectrogramConfig;
}

interface CanvasConfig {
    height: number;
    width: number;
}

interface SpectrogramConfig {
    canvasConfig: CanvasConfig;
    fftSize: number;
    sampleRate: number;
}
  
function resize(canvas: HTMLCanvasElement) {
    if (canvas === null) {
        return
    }
    canvas.width = canvas.clientWidth * window.devicePixelRatio
    canvas.height = canvas.clientHeight * window.devicePixelRatio
  }

function initializeCanvas(canvas: HTMLCanvasElement, config: CanvasConfig) {
    canvas.width = config.width;
    canvas.height = config.height;
    const ctx = canvas.getContext("2d");
    if (ctx != null) {
        ctx.fillStyle = "green";
        ctx.fillRect(10, 10, 150, 100);
    }
}

const getUserMic = (): Promise<MediaStream> => {
    return navigator.mediaDevices.getUserMedia({
        audio: true,
    })
}

async function setupContext(spectrogram: Spectrogram) {
    const {context, analyserNode, volume, gainNode} = spectrogram;
    const mic = await getUserMic();
    if (context.state === 'suspended') {
        await context.resume()
    }
    const source = context.createMediaStreamSource(mic)
    source
    .connect(gainNode)
    .connect(analyserNode)
    .connect(context.destination)
}

function setupEventListeners(spectrogram: Spectrogram) {
    const {canvas, volume, gainNode, context} = spectrogram;
    window.addEventListener('resize', () => resize(canvas))
    volume.addEventListener('input', e => {
        if (e.target != null) {
            const value = parseFloat((e.target as HTMLInputElement).value)
            gainNode.gain.setTargetAtTime(value, context.currentTime, .01)
        }
      })
  }

  function getFrequencies(spectrogram: Spectrogram): number[] {
    const {analyserNode, context} = spectrogram;
    const frequencyBinCount = analyserNode.frequencyBinCount
  
    const maxFrequency = context.sampleRate;
    const frequencies = new Array<number>(frequencyBinCount);
    for (let i = 0; i < frequencyBinCount; i++) {
        frequencies[i] = ((i+1)/frequencyBinCount) * maxFrequency;
    }
    return frequencies;
  }

  function drawVisualizer(spectrogram: Spectrogram) {
    requestAnimationFrame(() => drawVisualizer(spectrogram))
    const {analyserNode, context, canvas} = spectrogram;
  
  
    const frequencyBinCount = analyserNode.frequencyBinCount
  
    const frequencies = getFrequencies(spectrogram);
  
    const decibelValues = new Uint8Array(frequencyBinCount)
    analyserNode.getByteFrequencyData(decibelValues)

    const canvasContext = canvas.getContext('2d')

    if (canvasContext != null) {
        drawBars(canvas, canvasContext, frequencyBinCount, decibelValues, frequencies)
    }
  }

function drawBars(canvas: HTMLCanvasElement, canvasContext: CanvasRenderingContext2D, frequencyBinCount: number, decibelValues: Uint8Array, frequencies: number[]) {
    const width = canvas.width
    const height = canvas.height
    const barWidth = width / frequencyBinCount
  
    canvasContext.clearRect(0, 0, width, height)
  
    decibelValues.forEach((item, index) => {
        const y = item / 255 * height / 2
        const x = barWidth * index
    
        drawBar(x, y, height, barWidth, canvasContext)
        if (item > 10) {
            canvasContext.strokeText(frequencies[index].toString(), x, height - y)
            canvasContext.strokeText(decibelValues[index].toString(), x, height - (y + 30))
        }
    })
}
  
function drawBar(x: number, y: number, height: number, barWidth: number, canvasContext: CanvasRenderingContext2D) {
    canvasContext.fillStyle = `hsl(${y / height * 400}, 100%, 50%)`
    canvasContext.fillRect(x, height - y, barWidth, y)

}


function initializeSpectrogram(config: SpectrogramConfig) {
    const {sampleRate, fftSize, canvasConfig} = config;
    
    const context = new AudioContext({sampleRate});
    const analyserNode = new AnalyserNode(context, { fftSize })
    const canvas = <HTMLCanvasElement>document.getElementById('canvas')
    const volume = <HTMLInputElement>document.getElementById('volume')
    const gainNode = new GainNode(context, {gain: Number(volume.value)})


    if (canvas != null) {
        const spectrogram = {
            canvas,
            resize,
            analyserNode,
            context,
            initializeCanvas,
            volume,
            gainNode,
            config,
        }
        spectrogram.initializeCanvas(spectrogram.canvas, spectrogram.config.canvasConfig);
        setupEventListeners(spectrogram);
        setupContext(spectrogram);
        resize(spectrogram.canvas);
        drawVisualizer(spectrogram);
    }
}

  export {Spectrogram, resize, initializeCanvas, initializeSpectrogram}