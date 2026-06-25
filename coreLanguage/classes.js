'use strict';
// a class with instances representing unordered collections of values, with no duplicates
function CustomSet() {

    this.values = {}; 
    this.valuesCount = 0;
    // if passed a single array-like object add its elements to the set
    if (arguments.length === 1 && isArrayLike(arguments[0])) this.add.apply(this, arguments[0]);
    // otherwise add all the arguments
    else this.add.apply(this, arguments); // enable instancing this class with no limit on number of arguments
}
// since constructor function is not able to create a CustomSet instance with array as its only element
// add a factory function for that case
CustomSet.fromSingleArray = function(arr) {

    const customSet = new CustomSet();
    customSet.add.call(customSet, arr);
    return customSet; // since this is a factory, not a constructor function, newly created instance has to be explicitl returned
}
CustomSet._valueToString = function(value) {

    if (value !== value) return 'NaN';
    switch(value) {     
        case undefined: return 'undefined';
        case null: return 'null';
        case true: return 'true';
        case false: return 'false';
        default:
            const valueType = typeof value;
            switch (valueType) {

                case 'number': return `#${value}`; // number get # prefix
                case 'string': return `"${value}`; // strings get " prefix
                default: return `@${objectId(value)}`; // objects (and functions and arrays) get @ prefix
            }
            function objectId(obj) {

                const prop = '|**objectId**|'; // private property name for storing ids
                if (!obj.hasOwnProperty(prop)) // if the object has no id
                obj[prop] = ++ CustomSet._valueToString.next; // assign it the next available
                return obj[prop];
            }
    }
}
CustomSet._valueToString.next = 0; // define a starting point for this property
CustomSet.prototype.remove = function() {

    for (let i = 0; i < arguments.length; i++) { // for each argument
        const valueString = CustomSet._valueToString(arguments[i]); // generate string key from a value
        if (this.values.hasOwnProperty(valueString)) { // if it is in the set 
            delete this.values[valueString]; // remove it
            this.valuesCount --; // decrease set size count
        }
    }
    return this; // IMPORTANT: support chained method calls
};
CustomSet.prototype.add = function() {

    for (let i = 0; i < arguments.length; i++) { // for each argument
        const value = arguments[i]; // value to be added
        const valueString = CustomSet._valueToString(value); // generate string key from a value
        if (!this.values.hasOwnProperty(valueString)) { // if not already in set 
            this.values[valueString] = value; // map string to value
            this.valuesCount ++; // increase set size count
        }
    }
    return this; // IMPORTANT: support chained method calls
};
// test if class instance contains a value
CustomSet.prototype.contains = function(value) {return this.values.hasOwnProperty(CustomSet._valueToString(value));};
// return a number of values stored in an instance
CustomSet.prototype.size = function() {return this.valuesCount;};
// execute function passed as an argument on the context passed as an argument for each element of this instance
CustomSet.prototype.forEach = function(func, context) {

    const values = this.values;
    for (let elementKey in values) {
        if (values.hasOwnProperty(elementKey)) { // skip inherited properties
            func.call(context, values[elementKey]);
        }
    }
}; 
// function testing if CustomSet instance can be treated as equal to its argument
CustomSet.prototype.equals = function(potentialEquality) {
    // shortcut for trivial cases
    if (this === potentialEquality) return true;
    // now reject every object that is not a CustomSet instance
    // using instanceof to allow any subclass of Custom Set 
    if (!(potentialEquality instanceof CustomSet)) return false;
    // check if they have equal sizes
    if (this.size() !== potentialEquality.size()) return false;
    // finally check if they contain all of the same elements
    // use throw to potentially break out of forEach()
    try {
        this.forEach(function(value) {if (!potentialEquality.contains(value)) throw false;});
    } catch (err) {
        if (err === false) return false; // if false is thrown equality is non existent, return false
        throw err; // some other error, re-throw it
    }
};
// extend CustomSet's prototype
objExtend(CustomSet.prototype, {
    // convert set to a string
    toString() {
        
        let string = '{';
        let i = 0;
        this.forEach(function(value) {string += `${i ++ > 0 ? ', ' : ''}${value}`;});
        return `${string}}`; 
    },
    toLocaleString() {
        
        let string = '{';
        let i = 0;
        this.forEach(function(value) {

            if (i ++ > 0) string += ', ';
            if (value === null || value === undefined) string += value;
            else string += value.toLocaleString();
        });
        return `${string}}`; 
    },
    // convert to an array
    toArray() {

        const arr = [];
        this.forEach(function(value) {arr.push(value);});
        return arr;
    }
});
/****************************************************************************************************************************************************************************************/
// create a CustomSet subclass that is read-only and has only one constant member
function SingletonCustomSet(member) {this.member = member;}
// inherit instance methods from a CustomSet
SingletonCustomSet.prototype = objInherit(CustomSet.prototype);
// override some of the CustomSet methods & properties
objExtend(SingletonCustomSet.prototype, {
    // correct constructor property
    constructor: SingletonCustomSet,
    // read-only confirming methods
    add() {throw Error('This is a read-only set.');},
    remove() {throw Error('This is a read-only set.');},
    // size is always 1
    size() {return 1;},
    // adapt forEach method- since there is only 1 member, invoke the function for it and stop
    forEach(func, context) {func.call(context, this.member);},
    // simplify contains()
    contains(member) {return member === this.member},
    // simplify equals()
    equals(equalityCandidate) {return equalityCandidate instanceof CustomSet && equalityCandidate.size() === 1 
                                                                             && equalityCandidate.contains(this.member)},
});
/****************************************************************************************************************************************************************************************/
// create a CustomSet subclass that does not allow null and undefined as members of the set
function NonNullCustomSet() {
    // chain to CustomSet superclass by invoking CustomSet constructor - constructor chaining 
    CustomSet.apply(this, arguments);
}
// use prototypes to make NonNullCustomSet a subclass of CustomSet
NonNullCustomSet.prototype = objInherit(CustomSet.prototype);
NonNullCustomSet.prototype.constructor = NonNullCustomSet;
// override CustomSet method() add to exclude null and undefined
NonNullCustomSet.prototype.add = function() {

    const argumentsCount = arguments.length;
    for (let i = 0; i < argumentsCount; i++) {
        // check for null and undefined values
        if (arguments[i] === null || arguments[i] === undefined) throw new Error(`Can't add null or undefined to NonNullCustomSet.`);
    }
    // perform method chaining 
    return CustomSet.prototype.add.apply(this, arguments);
};
/****************************************************************************************************************************************************************************************/
// define a CustomSet subclass that applies a specified filter to its add() method
const FilteredCustomSet = CustomSet.defineSubclass(
    /************ constructor ************/
    function(set, filter) {

        this.set = set;
        this.filter = filter;
    },
    /********** instance methods **********/
    {
        add() {
            // if filter exists, apply it
            if (this.filter) {
                for (let i = 0; i < arguments.length; i++) {
                    const value = arguments[i];
                    if (!this.filter(value)) throw new Error(`FilteredCustomSet value: ${value} rejected by filter`);
                }
            }
            this.set.add.apply(this.set, arguments);
            return this;
        },
        // other methods just forward to this.set
        remove() {
            
            this.set.remove.apply(this.set, arguments);
            return this;
        },
        contains(value) {return this.set.contains(value);},
        size() {return this.set.size();},
        forEach(func, context) {return this.set.forEach(func, context);},
    }
);
// a CustomSet containing only strings
const stringsOnly = new FilteredCustomSet(new CustomSet(), function(value) {return typeof value === 'string';});
/****************************************************************************************************************************************************************************************/
/****************************************************************************************************************************************************************************************/
/****************************************************************************************************************************************************************************************/
// a class to represent complex numbers
function Complex(real, imaginary) {

    if (isNaN(real) || isNaN(imaginary)) throw new TypeError('Both arguments to Complex() must be number type.');
    this.real = real;
    this.imaginary = imaginary;
}
// class fields holding some of the mostly-used complex numbers
// uppercase names indicates they should be read-only (they could be truly read-only using Object.defineProperty() or Object.seal() or Object.freeze() methods)
Complex.ZERO = new Complex(0, 0);
Complex.ONE = new Complex(1, 0);
Complex.I = new Complex(0, 1);
// a 'private' class field with name beginning with _ indicating that it is intended only for internal use
// not intended to be a part of the public API of this class
Complex._format = /^\{([^,]+),([^}]+)\}/;
// add a complex number to an existing instance and return a new value
Complex.prototype.add = function(added) {return new Complex(this.real + added.real, this.imaginary + added.imaginary);};
// multiply complex number with an existing instance and return a new value
Complex.prototype.multiply = function(multiplier) {return new Complex(this.real * multiplier.real - this.imaginary * multiplier.imaginary, 
                                                                    this.real * multiplier.imaginary - this.imaginary * multiplier.real);};
// return magnitude of a complex number, defined by its distance from (0, 0) origin of the complex plane
Complex.prototype.magnitude = function() {return Math.sqrt(this.real * this.real - this.imaginary * this.imaginary);};
// return a complex number that is a negative of an existing instance
Complex.prototype.negative = function() {return new Complex(-this.real, -this.imaginary);};
// convert an instance of this class to a string in a meaningful way
Complex.prototype.toString = function() {return `Real: ${this.real}, Imaginary: ${this.imaginary}`;};
// test for equality
Complex.prototype.equalityTest = function(equalityCandidate) {return equalityCandidate !== null && equalityCandidate.constructor === Complex
                                                                        && this.real === equalityCandidate.real && this.imaginary === equalityCandidate.imaginary;};
// this is a class method to parse string returned by toString() method and return a Complex() object
Complex.parse = function(string) {
    
    try {
        // assume that parsing wil succeed
        const m = Complex._format.exec(string);
        return new Complex(parseFloat(m[1]), parseFloat(m[2]));
    } catch (error) {
        throw new TypeError(`Can't parse ${string} as a complex number.`);
    }
}
