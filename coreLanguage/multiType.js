'use strict';

// return the class of an object
function determineClass(value) {return Object.prototype.toString.call(value).slice(8, -1);}
// determine type of a value
// for 2 special cases, null and NaN, return 'null' and 'NaN'
// if typeof operator returns anything other than 'object', return that value
// if class of object is anything other than 'Object', return that
// if object has a constructor with a name, return that
// otherwise, return 'Object'
function determineType(value) {

    if (value === null) return null;
    if (value !== value) return 'NaN'; // NaN is the only value not equal to itself
    const valueType = typeof value;
    if (valueType !== 'object') return valueType;
    const valueClass = determineClass(value);
    if (valueClass !== 'Object') return valueClass;
    const objectConstructor = value.constructor;
    return typeof objectConstructor === 'function' ? objectConstructor.getName() : 'Object';
}
// this function does not work with built-in classes like Array, because their method are non-enumerable
// furthermore, this function only confirms existence of matching methods, but does not give informations on what those methods do, or what arguments they expect
// this way API user is entrusted to use API in a correct way, in contrast to writting API  with stronger type-checking
function duckTypingAPI(obj1, obj2) {
    // if obj1 and ob1 2 are not an objects, throw TypeError()
    const arg1Type = determineType(obj1);
    if (arg1Type === null || arg1Type === 'NaN' || arg1Type === 'undefined' || arg1Type === 'boolean' || arg1Type === 'string' || arg1Type === 'number') {
        throw TypeError('Both arguments to duckTypingAPI() must be of object type');
    } 
    const arg2Type = determineType(obj2);
    if (arg2Type === null || arg2Type === 'NaN' || arg2Type === 'undefined' || arg2Type === 'boolean' || arg2Type === 'string' || arg2Type === 'number') {
        throw TypeError('Both arguments to duckTypingAPI() must be of object type');
    } 
    // if code reaches this point both arguments are objects (this includes also arrays and functions)
    for (let prop in obj2) {
        if (typeof obj2[prop] !== 'function') continue; // skip non-mehods properties
        if (typeof obj1[prop] !== 'function') return false; 
    }
    return true;
}
