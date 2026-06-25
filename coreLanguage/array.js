'use strict';

// mathematical operations applied to the entirety of the array (assuming array contains only numeric values)
function arrSum(arr) {return arr.reduce((x, y) => {return (x + y);})}
function arrProduct(arr) {return arr.reduce((x, y) => {return (x * y);})}
function arrMax(arr) {return Math.max.apply(Math, arr);}
function arrMin(arr) {return Math.min.apply(Math, arr);}
function arrMeanValue(arr) {return arrSum(arr) / arr.length;}
function arrStandardDeviation(arr) {
    
    const mean = arrMeanValue(arr);
    const squaredDeviations = arr.map((value) => {return Math.pow((value - mean), 2);}); // irrelevant if deviation is positive or negative value, it will be squared anyway
    return Math.sqrt((squaredDeviations.reduce((x, y) => {return (x + y)})) / arr.length);
}
// make a potentially sparse array dense (close the gaps) and remove null and undefined values
function arrCleansing(arr) {return arr.filter((arrElement) => {return (arrElement !== undefined && arrElement !== null);})}
// find every occurrence of a value in an array and return an array of matching indexes
function arrValueIndexFinder(arr, value) {

    const arrLength = arr.length;
    const arrValueIndexesFound = [];
    for (let i = 0; i < arrLength; i++) {
        const valuePosition = arr.indexOf(value, i);
        if (valuePosition === -1) break;
        if (arrValueIndexesFound.indexOf(valuePosition) !== -1) continue;
        arrValueIndexesFound.push(valuePosition);
    }
    return arrValueIndexesFound;
}

