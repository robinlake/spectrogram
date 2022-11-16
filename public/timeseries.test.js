import { getMaxRowValues } from "./timeseries";
describe("getMaxRowValues", () => {
    test('should get [1,3,4]', () => {
        const filledMatrix = [[1, 2, 3], [1, 2, 4], [1, 3, 3]];
        const result = [1, 3, 4];
        expect(getMaxRowValues(filledMatrix)).toStrictEqual(result);
    });
});
