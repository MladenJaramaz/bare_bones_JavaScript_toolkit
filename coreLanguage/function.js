'use strict';

// check if value provided as an argument is a function
function isFunction(value) {return Object.prototype.toString.call(value) === '[object Function]';}
// higher-order function returning a logical negation of the return value from a function passed as an argument to a higher-order function
function not(func) {return function() {return !func.apply(this, arguments);}}
// higher-order function returning a new function that computes f(g(...))
function compose(f, g) {return function() {return f.call(this, g.apply(this, arguments))};}
// partially apply arguments to the beggining of the argument list
function leftPartialApplication(f) {

    const argumentsArray = convertArrayLikeObjects(arguments);
    // remove function argument
    argumentsArray.shift();
    return function() {
        
        const finalArgumentsArray = argumentsArray.concat(convertArrayLikeObjects(arguments));
        return f.apply(this, finalArgumentsArray); 
    }
}
// partially apply arguments to the end of the argument list
function rightPartialApplication(f) {

    const argumentsArray = convertArrayLikeObjects(arguments);
    // remove function argument
    argumentsArray.shift();
    return function() {
        
        const finalArgumentsArray = convertArrayLikeObjects(arguments).concat(argumentsArray);
        return f.apply(this, finalArgumentsArray); 
    }
}
// return a memoized function that returns cached result if executed with argument list that was previously passed to it
function memoizedFunction() {
    // easy to write for arguments that are primitive types
    // implement for getFactorial and greatestCommonDivisor
    const cache = {};
    return function() {}
}
// define function for creating subclasses
function defineSubclass(superclass /* parent class */, constructor /* subclass constructor */, instanceMethods, staticMethods) {
    // set up subclass prototype
    constructor.prototype = objInherit(superclass.prototype);
    constructor.prototype.constructor = constructor;
    // apply instanceMethods and staticMethods, if provided
    if (instanceMethods) objExtend(constructor.prototype, instanceMethods);
    if (staticMethods) objExtend(constructor, staticMethods);
    // return the subclass
    return constructor;
}
// generate subclass of a class
Function.prototype.defineSubclass = function(constructor /* subclass constructor */, instanceMethods, staticMethods) {
    
    return defineSubclass(this, constructor, instanceMethods, staticMethods);
}; 
// return the name of a function (may be '') or null for non-functions
Function.prototype.getName = function() {

    if ('name' in this) return this.name; // operator in is used beause this.name may return inherited property 'name'
    return this.name.toString().match(/function\s*([^(]*)\(/)[1];
};