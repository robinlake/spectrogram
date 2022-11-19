import { SpectralTimeSeries, createSpectralTimeSeries } from "./timeseries.js";

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

const getUserMic = (): Promise<MediaStream> => {
  return navigator.mediaDevices.getUserMedia({
    audio: true,
  });
};

async function setupAudioContext(spectrogram: Spectrogram) {
  const { context, analyserNode, gainNode } = spectrogram;
  const mic = await getUserMic();
  if (context.state === "suspended") {
    await context.resume();
  }
  const source = context.createMediaStreamSource(mic);
  source.connect(gainNode).connect(analyserNode);
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
  const { sampleRate, fftSize, maxSampleCount } = config;

  const context = new AudioContext({ sampleRate });
  const analyserNode = new AnalyserNode(context, { fftSize });
  const volume = <HTMLInputElement>document.getElementById("volume");
  const gainNode = new GainNode(context, { gain: Number(volume.value) });
  const frequencyBinCount = fftSize / 2;
  const maxFrequency = sampleRate / 2; // can only detect frequencies up to half the sample rate, beyond that aliasing will occur
  const timeSeries = createSpectralTimeSeries(
    maxFrequency,
    maxSampleCount,
    frequencyBinCount,
    analyserNode
  );
  const spectrogram = {
    analyserNode,
    context,
    volume,
    gainNode,
    config,
    connectAudioDestination,
    disconnectAudioDestination,
    timeSeries,
  };
  setupAudioContext(spectrogram);
  return spectrogram;
}

export { Spectrogram, initializeSpectrogram, SpectrogramConfig };
