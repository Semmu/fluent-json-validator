'use strict';

const is = {
    __validationUnit: function() {
        this.__type = undefined;
        this.__required = true;
        this.__functionalValidators = [];
        this.__validateType = (value) => {
            return false; // FIXME should this actually throw an exception?
        }

        this.validate = (value) => {
            if (typeof value === "undefined" && this.__type !== "array" && this.__type !== "various") {
                return !this.__required;
            } else {
                return this.__validateType(value) && 
                       this.__functionalValidators.filter(functionalValidator => !functionalValidator(value)).length == 0;
                       // ^ == there is no functional validator lambda which does not validate the value
            };
        };

        this.optional = function() {
            this.__required = false;
            return this;
        };

        this.Which = function(functionalValidator) {
            this.__functionalValidators.push(functionalValidator);
            return this;
        }

        this.String = function() {
            this.__type = "string";
            this.__validateType = (value) => (
                typeof value === "string"
            );
            return this;
        };

        this.Boolean = function() {
            this.__type = "boolean";
            this.__validateType = (value) => (
                typeof value === "boolean"
            );
            return this;
        }

        this.Number = function() {
            this.__type = "number";
            this.__validateType = (value) => (
                typeof value === "number"
            );
            return this;
        };

        this.Object = function(schemaObj) {
            this.__type = "object";
            this.__schemaObj = schemaObj || {};
            this.__validateType = (value) => {
                if (typeof value !== "object") {
                    return false;
                };
                for (const schemaKey in this.__schemaObj) {
                    // here we iterate over the keys of the schema
                    // and validate the corresponding properties of the value object.
                    if (!schemaObj[schemaKey].validate(value[schemaKey])) {
                        return false;
                    };
                };
                return true;
            };
            return this;
        };

        this.ArrayOf = function(schema) {
            this.__type = "array";
            this.__schema = schema;
            this.__validateType = (value) => {
                if (Array.isArray(value)) {
                    return value.filter(e => !this.__schema.validate(e)).length == 0;
                    // ^ == there is no item in the array which is not validated by the schema
                } else {
                    return (!this.__required && typeof value === "undefined");
                };
            };
            return this;
        };

        this.OneOf = function(schemaArray) {
            this.__type = "various";
            this.__schemaArray = schemaArray;
            this.__validateType = (value) => {
                if (!this.__required && typeof value === "undefined") {
                    return true;
                } else {
                    return this.__schemaArray.filter(schema => schema.validate(value)).length > 0;
                    // ^ == there is at least one schema which validates the value
                };
            };
            return this;
        }

        return this;
    }
};

is.optional = () => (new is.__validationUnit().optional());

is.Which = (functionalValidator) => (new is.__validationUnit().Which(functionalValidator));

is.String = () => (new is.__validationUnit().String());
is.Boolean = () => (new is.__validationUnit().Boolean());
is.Number = () => (new is.__validationUnit().Number());

is.Object = (schemaObj) => (new is.__validationUnit().Object(schemaObj));

is.ArrayOf = (schema) => (new is.__validationUnit().ArrayOf(schema));
is.OneOf = (schemaArray) => (new is.__validationUnit().OneOf(schemaArray));

export { is };