'use strict';
// define a properties() method in Object.prototype returning an object representing the named properties of object on which it is invoked
// object defines 4 additional useful methods
(function namespace() {
    // all wrapped in a private function scope, this function becomes a method for all objects
    function properties() {
        
        let names;
        if (arguments.length === 0) names = Object.getOwnPropertyNames(this); // no arguments
        else if (arguments.length === 1 && Array.isArray(arguments[0])) names = arguments[0]; // single array argument
        else names = Array.prototype.slice.call(arguments, 0); // names in the argument list
        // return new Properties object
        return new Properties(this, names);
    }
    // make it a non-enumerable property of Object.prototype
    Object.defineProperty(Object.prototype, 'properties', {
        value: properties,
        enumerable: false,
        writable: true,
        configurable: true
    });
    // constructor function invoked by properties() function above
    function Properties(obj, names) {

        this.obj = obj; // object properties belong to
        this.names = names;
    }
    // make properties represented by an object non-enumerable
    Properties.prototype.hide = function() {

        const obj = this.obj;
        this.names.forEach(function(name) {if (obj.hasOwnProperty(name)) Object.defineProperty(obj, name, {enumerable: false});});
        return this;
    };
    // make properties represented by an object read-only and non-configurable
    Properties.prototype.freeze = function() {

        const obj = this.obj;
        this.names.forEach(function(name) {
            
            if (obj.hasOwnProperty(name)) Object.defineProperty(obj, name, {
                writable: false,
                configurable: false
            });
        });
        return this;
    };
    // return object that maps names to descriptors to those properties
    Properties.prototype.descriptors = function() {

        const obj = this.obj;
        const descriptors = {};
        this.names.forEach(function(name) {

            if (!obj.hasOwnProperty(name)) return;
            descriptors[name] = Object.getOwnPropertyDescriptor(obj, name);
        });
        return descriptors;
    };
    // return formatted list of properties, listing the name, value and attributes
    // 'permanent' means non-configurable, 'readonly' means non-writable, 'hidden means non-enumerable
    Properties.prototype.toString = function() {

        const obj = this.obj;
        const lines = this.names.map(nameToString);
        function nameToString(name) {

            let string = '';
            const descriptor = Object.getOwnPropertyDescriptor(obj, name);
            if (!descriptor) return `nonexistent ${name}: undefined`;
            if (!descriptor.configurable) string += 'permanent ';
            if ((descriptor.get && !descriptor.set) || !descriptor.writable) string += 'readonly ';
            if (!descriptor.enumerable) string += 'hidden ';
            if (descriptor.get && descriptor.set) string += `accessor ${name}`;
            else string += `${name}: ` + (typeof descriptor.value === 'function' ? 'function': descriptor.value);
            return string;
        }
        return `{\n ${lines.join(',\n')}\n}`;
    };
    // finally make instance methods of the prototype object above non-enumerable
    Properties.prototype.properties().hide();
})();
