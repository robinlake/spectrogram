function createSpectralTimeSeries(maxFrequency, maxSampleCount, frequencyBinCount, analyserNode) {
    const column = new Array(frequencyBinCount).fill(0);
    const decibelValues = [column];
    const timeDomainValues = [column];
    const maxDecibelValue = 255;
    const timeSeries = {
        frequencyBinCount,
        maxFrequency,
        maxSampleCount,
        analyserNode,
        getFrequencies: () => getFrequencies(frequencyBinCount, maxFrequency),
        decibelValues,
        maxDecibelValue,
        pushDecibelValues: (decibelValues, analyserNode, maxSampleCount) => pushDecibelValues(decibelValues, analyserNode, maxSampleCount),
        clearDecibelValues,
        getMaxRowValues,
        timeDomainValues,
        pushTimeDomainValues,
        clearTimeDomainValues,
        getDisplayedFrequencies,
        getDecibelValuesForFrequencyRange,
    };
    return timeSeries;
}
function getFrequencies(frequencyBinCount, maxFrequency) {
    const frequencies = new Array(frequencyBinCount);
    for (let i = 0; i < frequencyBinCount; i++) {
        frequencies[i] = Math.round(((i + 1) / frequencyBinCount) * maxFrequency);
    }
    return frequencies;
}
function getDisplayedFrequencies(min, max, timeSeries) {
    const frequencies = timeSeries.getFrequencies(timeSeries.frequencyBinCount, timeSeries.maxFrequency);
    const displayedFrequencies = frequencies.filter(x => x >= min && x <= max);
    return displayedFrequencies;
}
function getDecibelValuesForFrequencyRange(minFrequency, maxFrequency, timeSeries) {
    const frequencies = getFrequencies(timeSeries.frequencyBinCount, timeSeries.maxFrequency);
    let outputValues = [];
    // for (const [index, frequency] of frequencies.entries()) {
    for (const [_, column] of timeSeries.decibelValues.entries()) {
        let outputColumn = [];
        for (const [innerIndex, cell] of column.entries()) {
            if (frequencies[innerIndex] >= minFrequency && frequencies[innerIndex] <= maxFrequency) {
                outputColumn.push(cell);
            }
        }
        outputColumn.length > 0 && outputValues.push(outputColumn);
    }
    // }
    return outputValues;
}
function pushDecibelValues(decibelValues, analyserNode, maxSampleCount) {
    const newDecibalValues = new Uint8Array(analyserNode.frequencyBinCount);
    analyserNode.getByteFrequencyData(newDecibalValues);
    decibelValues.push(new Array(...newDecibalValues));
    if (decibelValues.length > maxSampleCount) {
        decibelValues.shift();
    }
    return decibelValues;
}
function clearDecibelValues(timeSeries) {
    timeSeries.decibelValues = new Array(timeSeries.frequencyBinCount).fill(0);
}
function pushTimeDomainValues(timeDomainValues, analyserNode, maxSampleCount) {
    const newTimeDomainValues = new Uint8Array(analyserNode.frequencyBinCount);
    // analyserNode.getByteFrequencyData(newTimeDomainValues)
    analyserNode.getByteTimeDomainData(newTimeDomainValues);
    timeDomainValues.push(new Array(...newTimeDomainValues));
    if (timeDomainValues.length > maxSampleCount) {
        timeDomainValues.shift();
    }
    return timeDomainValues;
}
function clearTimeDomainValues(timeSeries) {
    timeSeries.timeDomainValues = new Array(timeSeries.frequencyBinCount).fill(0);
}
function getMaxRowValues(matrix2d) {
    const maxRowValues = new Array(matrix2d[0].length).fill(0);
    // const isGreater = (x: number, y: number) => x > y;
    for (const column of matrix2d) {
        for (const [index, value] of column.entries()) {
            if (value > maxRowValues[index]) {
                maxRowValues[index] = value;
            }
        }
    }
    return maxRowValues;
}
export { createSpectralTimeSeries, getMaxRowValues };
