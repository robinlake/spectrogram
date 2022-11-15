import {resize} from './canvas.js';
interface Spectrogram {
    volume: HTMLInputElement;
    analyserNode: AnalyserNode;
    context: AudioContext;
    gainNode: GainNode;
    config: SpectrogramConfig;
}

interface SpectrogramConfig {
    fftSize: number;
    sampleRate: number;
}

interface SpectralTimeSeries {
    frequencyBinCount: number;
    maxFrequency: number;
    maxSampleCount: number;
    analyserNode: AnalyserNode;
    getFrequencies: (frequencyBinCount: number, maxFrequency: number) => number[];
    decibelValues: number[][];
    maxDecibelValue: number;
    pushDecibelValues: (decibelValues: number[][], analyserNode: AnalyserNode, maxSampleCount: number) => number[][];
    clearDecibelValues: (timeSeries: SpectralTimeSeries) => void;
}

function createSpectralTimeSeries(maxFrequency: number, maxSampleCount: number, frequencyBinCount: number, analyserNode: AnalyserNode): SpectralTimeSeries {
    const decibelValues: number[][] = [[]];
    const maxDecibelValue = 255;
    const timeSeries = {
        frequencyBinCount,
        maxFrequency,
        maxSampleCount,
        analyserNode,
        getFrequencies: () => getFrequencies(frequencyBinCount, maxFrequency),
        decibelValues,
        maxDecibelValue,
        pushDecibelValues: (decibelValues: number[][], analyserNode: AnalyserNode, maxSampleCount: number) => pushDecibelValues(decibelValues, analyserNode, maxSampleCount),
        clearDecibelValues,
    }
    return timeSeries;
}

function getFrequencies(frequencyBinCount: number, maxFrequency: number): number[] {  
    const frequencies = new Array<number>(frequencyBinCount);
    for (let i = 0; i < frequencyBinCount; i++) {
        frequencies[i] = ((i+1)/frequencyBinCount) * maxFrequency;
    }
    return frequencies;
  }

function pushDecibelValues(decibelValues: number[][], analyserNode: AnalyserNode, maxSampleCount: number): number[][] {
    const newDecibalValues = new Uint8Array(analyserNode.frequencyBinCount)
    analyserNode.getByteFrequencyData(newDecibalValues)
    decibelValues.push(new Array<number>(...newDecibalValues));
    if (decibelValues.length > maxSampleCount) {
        decibelValues.shift();
    }
    return decibelValues;
}

function clearDecibelValues(timeSeries: SpectralTimeSeries) {
    timeSeries.decibelValues = [];
}

const getUserMic = (): Promise<MediaStream> => {
    return navigator.mediaDevices.getUserMedia({
        audio: true,
    })
}

async function setupAudioContext(spectrogram: Spectrogram) {
    const {context, analyserNode, gainNode} = spectrogram;
    const mic = await getUserMic();
    if (context.state === 'suspended') {
        await context.resume()
    }
    const source = context.createMediaStreamSource(mic)
    source
    .connect(gainNode)
    .connect(analyserNode)
    // .connect(context.destination)
}

function setupEventListeners(spectrogram: Spectrogram) {
    const {volume, gainNode, context} = spectrogram;
    volume.addEventListener('input', e => {
        if (e.target != null) {
            const value = parseFloat((e.target as HTMLInputElement).value)
            gainNode.gain.setTargetAtTime(value, context.currentTime, .01)
        }
      })
  }

function initializeSpectrogram(config: SpectrogramConfig): Spectrogram {
    const {sampleRate, fftSize} = config;
    
    const context = new AudioContext({sampleRate});
    const analyserNode = new AnalyserNode(context, { fftSize })
    const volume = <HTMLInputElement>document.getElementById('volume')
    const gainNode = new GainNode(context, {gain: Number(volume.value)})

    const spectrogram = {
        analyserNode,
        context,
        volume,
        gainNode,
        config,
    }
    setupEventListeners(spectrogram);
    setupAudioContext(spectrogram);

    return spectrogram;
}

  export {Spectrogram, resize, initializeSpectrogram, getFrequencies, createSpectralTimeSeries, SpectralTimeSeries, SpectrogramConfig}