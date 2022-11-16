function createSpectralTimeSeries(maxFrequency, maxSampleCount, frequencyBinCount, analyserNode) {
    const column = new Array(frequencyBinCount).fill(0);
    const decibelValues = [column];
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
    };
    return timeSeries;
}
function getFrequencies(frequencyBinCount, maxFrequency) {
    const frequencies = new Array(frequencyBinCount);
    for (let i = 0; i < frequencyBinCount; i++) {
        frequencies[i] = ((i + 1) / frequencyBinCount) * maxFrequency;
    }
    return frequencies;
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
    timeSeries.decibelValues = [];
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
