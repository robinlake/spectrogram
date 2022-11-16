
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
    getMaxRowValues: (matrix2d: number[][]) => number[];
    timeDomainValues: number[][];
    pushTimeDomainValues: (decibelValues: number[][], analyserNode: AnalyserNode, maxSampleCount: number) => number[][];
    clearTimeDomainValues: (timeSeries: SpectralTimeSeries) => void;
}

function createSpectralTimeSeries(maxFrequency: number, maxSampleCount: number, frequencyBinCount: number, analyserNode: AnalyserNode): SpectralTimeSeries {
    const column = new Array(frequencyBinCount).fill(0);
    const decibelValues: number[][] = [column];
    const timeDomainValues: number[][] = [column];
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
        getMaxRowValues,
        timeDomainValues,
        pushTimeDomainValues,
        clearTimeDomainValues,
    }
    return timeSeries;
}

function getFrequencies(frequencyBinCount: number, maxFrequency: number): number[] {  
    const frequencies = new Array<number>(frequencyBinCount);
    for (let i = 0; i < frequencyBinCount; i++) {
        frequencies[i] = Math.round(((i+1)/frequencyBinCount) * maxFrequency);
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
    timeSeries.decibelValues = new Array(timeSeries.frequencyBinCount).fill(0);
}

function pushTimeDomainValues(timeDomainValues: number[][], analyserNode: AnalyserNode, maxSampleCount: number): number[][] {
    const newTimeDomainValues = new Uint8Array(analyserNode.frequencyBinCount)
    // analyserNode.getByteFrequencyData(newTimeDomainValues)
    analyserNode.getByteTimeDomainData(newTimeDomainValues)
    timeDomainValues.push(new Array<number>(...newTimeDomainValues));
    if (timeDomainValues.length > maxSampleCount) {
        timeDomainValues.shift();
    }
    return timeDomainValues;
}

function clearTimeDomainValues(timeSeries: SpectralTimeSeries) {
    timeSeries.timeDomainValues = new Array(timeSeries.frequencyBinCount).fill(0);
}

function getMaxRowValues(matrix2d: number[][]) :number[] {
    const maxRowValues = new Array(matrix2d[0].length).fill(0);
    // const isGreater = (x: number, y: number) => x > y;
    for (const column of matrix2d) {
        for (const [index, value] of column.entries() ) {
            if (value > maxRowValues[index]) {
                maxRowValues[index] = value;
            }
        }
    }
    return maxRowValues;
}

export {SpectralTimeSeries, createSpectralTimeSeries, getMaxRowValues}