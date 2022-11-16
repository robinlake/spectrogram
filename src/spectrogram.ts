interface Spectrogram {
    volume: HTMLInputElement;
    analyserNode: AnalyserNode;
    context: AudioContext;
    gainNode: GainNode;
    source?: MediaStreamAudioSourceNode;
    config: SpectrogramConfig;
    connectAudioDestination: (spectrogram: Spectrogram) => void;
    disconnectAudioDestination: (spectrogram: Spectrogram) => void;
    timeSeries: SpectralTimeSeries;
}

interface SpectrogramConfig {
    fftSize: number;
    sampleRate: number;
    maxSampleCount: number;
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
    spectrogram.source = source;
}

function connectAudioDestination(spectrogram: Spectrogram) {
    if (!spectrogram.source) {
        return;
    }
    spectrogram.source.connect(spectrogram.context.destination);
}

function disconnectAudioDestination(spectrogram: Spectrogram) {
    if (!spectrogram.source) {
        return;
    }
    spectrogram.source.disconnect(spectrogram.context.destination);
}

function initializeSpectrogram(config: SpectrogramConfig): Spectrogram {
    const {sampleRate, fftSize, maxSampleCount} = config;
    
    const context = new AudioContext({sampleRate});
    const analyserNode = new AnalyserNode(context, { fftSize })
    const volume = <HTMLInputElement>document.getElementById('volume')
    const gainNode = new GainNode(context, {gain: Number(volume.value)})
    const frequencyBinCount = fftSize / 2;
    const timeSeries = createSpectralTimeSeries(sampleRate, maxSampleCount, frequencyBinCount, analyserNode)
    const spectrogram = {
        analyserNode,
        context,
        volume,
        gainNode,
        config,
        connectAudioDestination,
        disconnectAudioDestination,
        timeSeries,
    }
    setupAudioContext(spectrogram);
    return spectrogram;

}

export {Spectrogram, initializeSpectrogram, SpectralTimeSeries, SpectrogramConfig}