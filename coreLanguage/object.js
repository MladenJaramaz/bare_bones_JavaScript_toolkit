'use strict';
// POSSIBLE IMPROVMENTS: add check if arguments are true objects for all of the functions below

// use protoObj as a prototype for a newly created object
function objInherit(protoObj) {
    // protoObj must be a non-null object
    if (protoObj === null) throw TypeError();
    // check if Object.create exists in this JS implementation
    if (Object.create) return Object.create(protoObj);
    // protoObj must be a non-null object
    let typeOfProto = typeof protoObj;
    if (typeOfProto !== 'object' && typeOfProto !== 'function') throw TypeError();
    // if not, use a dummy constructor function
    function func() {}
    func.prototype = protoObj;
    return new func();
}
// return class of any object passe o it, numbers, strings and booleans behave like objects when toString() is invoked on them
function classOfObj(obj) {

    if (obj === null) return 'Null';
    if (obj === undefined) return 'Undefined';
    return Object.prototype.toString.call(obj).slice(8, -1);
}
// not in the book
function copyOfObj(obj) {

    const objStingified = JSON.stringify(obj);
    return JSON.parse(objStingified);
}
// if extendedObj and extenderObj have property by the same name, extendedObj's property is overwritten
function objExtend(extendedObj, extenderObj) {

    for (let prop in extenderObj) {
        extendedObj[prop] = extenderObj[prop];
    }
    return extendedObj;
}
// if extendedObj and extenderObj have property by the same name, extendedObj's property is not overwritten
function objExtendPartially(extendedObj, extenderObj) {

    for (let prop in extenderObj) {
        if (prop in extendedObj) continue;
        extendedObj[prop] = extenderObj[prop];
    }
    return extendedObj;
}
// adding a non-enumerable objExtendPartially() to Object.prototype
// use protoObj as a prototype for a newly created object, all property attributes are copied, not just property values
// all protoObj's own properties are copied (even non-enumerable ones) unless a target object already has a property with the same name
Object.defineProperty(Object.prototype, 'objExtendPartially',
    {
        writable: true,
        enumerable: false,
        configurable: true,
        value: function(extenderObj) {

            const propertyNames = Object.getOwnPropertyNames(extenderObj);
            for (let i = 0; i < propertyNames.length; i++) {
                const propertyName = propertyNames[i];
                if (propertyName in this) continue;
                const propertyDesc = Object.getOwnPropertyDescriptor(extenderObj, propertyName);
                Object.defineProperty(this, propertyName, propertyDesc);
            }
        }
    }
)
// remove properties from resctrictedObj, if there is not a property with that name in resctricterObj
function objRestrict(resctrictedObj, resctricterObj) {

    for (let prop in resctrictedObj) {
        if (prop in resctricterObj) continue;
        delete resctrictedObj[prop];
    }
    return resctrictedObj;
}
// remove properties from substractionAffectedObj, if there is a property with that name in substractionDefiningObj
function objSubstract(substractionAffectedObj, substractionDefiningObj) {

    for (let prop in substractionAffectedObj) {
        if (prop in substractionDefiningObj) delete substractionAffectedObj[prop];
    }
    return substractionAffectedObj;
}
// NOTE: seems like return values od my version and book version are the same object (objects can not be tested for equallity)
// return a new object representing an union of 2 objects passed to it
function objUnionBook (obj1, obj2) {
    // if obj1 and obj2 have properties by the same name, values from obj2 are used
    return objExtend(objExtend({}, obj1), obj2);
}
function objUnion (obj1, obj2) {
    // if obj1 and obj2 have properties by the same name, values from obj2 are used
    return objExtend(obj1, obj2);
}
// NOTE: seems like return values od my version and book version are the same object (objects can not be tested for equallity)
// return a new object representing an intersection of 2 objects passed to it
function objIntersectionBook (obj1, obj2) {
    // if obj1 and obj2 have properties by the same name, values from obj1 are used
    return objRestrict(objExtend({}, obj1), obj2);

}
function objIntersection (obj1, obj2) {
    // if obj1 and obj2 have properties by the same name, values from obj1 are used
    return objRestrict(obj1, obj2);
}
// check if object is array-like so that it can be used as an array, included in a for loop, for example
function isArrayLike(obj) {
    
    const length = obj.length;
    // check essentialts
    if (!(obj && typeof obj === 'object' && !isNaN(length) && length >= 0 && length === Math.floor(length) && length < 4294967295)) return false;
    // check if all of the object's keys are numeric
    for (let key in obj) {
        // jump over length property
        if (key === 'length') continue;
        if (isNaN(Number(key))) return false;
    }
    return true;
}
// convert an array-like object to a true array
function convertArrayLikeObjects(obj) {
    // check if argument is an array-like object
    if (!isArrayLike(obj)) throw Error(`${obj} is not an array-like object.`);
    return Array.from(obj);
}
// create a private property for an object using closuers, create property accessor methods for it
// property is not stored in the object itself, but in its accessor methods scope chain
// only way to access that property is through object's  property accessor methods 
function addPrivateProperty(obj, propertyName, setterCheckFunction) {

    let privateProperty;
    o[`get${propertyName}`] = function() {return privateProperty;};
    o[`set${propertyName}`] = function(newValue) {
        
        if (typeof setterCheckFunction !== 'function') throw Error('No valid setter checking function provided.');
        if (!setterCheckFunction(privateProperty)) throw new Error(`set${propertyName} recognized value ${newValue} as an invalid value`);
        else privateProperty = newValue;
    };
}
