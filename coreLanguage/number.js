'use strict';

function getFactorial(x) {

    if (x <= 0) throw new Error('x must be a positive, non-zero number.')
    let factorial = x;
    for (let i = 1; i < x; i++) factorial *= i;
    return factorial;    
}
// compute factorials and cache results as properties of the function itself
function getFactorialCachedOrComputed(x) {

    if (isFinite(x) && x > 0 && x === Math.round(x)) { // finite, positive integers only
        if (!(x in getFactorialCachedOrComputed)) {
            let factorial = x;
            for (let i = 1; i < x; i++) factorial *= i;
            getFactorialCachedOrComputed[x] = factorial;
            return factorial;
        } else return getFactorialCachedOrComputed[x]; 
    } else return NaN;
}
// initialize the cache to hold this base case
getFactorialCachedOrComputed[1] = 1;
// generate greatest common divisor of 2 integers using Euclidean algorithm
function greatestCommonDivisor(num1, num2) {

    let temp; // temporary variable for swapping values
    if (num1 < num2) {
        temp = num2;
        num2 = num1;
        num1 = temp;
    }
    while (num2 !== 0) {
        temp = num2;
        num2 = num1 % num2;
        num1 = temp;
    }
    return num1;
}
// test if even number
function isEvenNumber(x) {return x % 2 === 0;}
// test if odd number
function isOddNumber(x) {return !(x % 2 === 0);}
// basic mathematical operations
const operations = {
    add (x, y) {return x + y;},
    subtract (x, y) {return x - y;},
    multiply (x, y) {return x * y;},
    divide (x, y) {return x / y;},
    square(x) {return Math.pow(x, 2);}
};
function operate(operation, operand1, operand2) {

    if (typeof operations[operation] === 'function') return operations[operation](operand1, operand2);
    throw Error('Unknown operation.');
}
// invoke function as many times as value of a number dictates, by invoking it on a variable holding the number itself
Number.prototype.invokeTimes = function(func, context) {

    const num = this.valueOf();
    for (let i = 0; i < num; i++) {
        func.call(context, i); 
    }
};
