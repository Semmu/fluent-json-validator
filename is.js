'use strict';

/**
 * Global constant & API entry point for Fluent JSON validator.
 *
 * @namespace  is
 * @type       {Object}
 */
const is = {

    /**
     * Function to return a new configurable validator. You don't need to call this directly!
     *
     * @class   is.__validationUnit
     * @return  {Object}  The new, unconfigured validator.
     */
    __validationUnit: function() {

        this.__type = undefined;
        this.__required = true;
        this.__functionalValidators = [];
        this.__validateType = (subject) => {
            return false; // FIXME should this actually throw an exception?
        }

        /**
         * Validate the subject against the set schema.
         *
         * @param      {any}      subject   The subject to validate.
         * @return     {Boolean}            Validation result: true if the subject matches the schema, false otherwise.
         */
        this.validate = (subject) => {
            if (typeof subject === "undefined" && this.__type !== "array" && this.__type !== "various") {
                return !this.__required;
            } else {
                return this.__validateType(subject) &&
                       this.__functionalValidators.filter(functionalValidator => !functionalValidator(subject)).length == 0;
                       // ^ == there is no functional validator lambda which does not validate the subject.
            };
        };

        /**
         * Set the validator to optional, so it accepts missing values.
         *
         * @return     {is.__validationUnit}  The validator itself.
         */
        this.optional = function() {
            this.__required = false;
            return this;
        };

        /**
         * Add a new functional validation lambda to the validator.
         *
         * @param      {lambda}               lambda  The functional validator, which accesses the subject and returns true or false.
         * @return     {is.__validationUnit}          The validator itself.
         */
        this.Which = function(lambda) {
            this.__functionalValidators.push(lambda);
            return this;
        }

        /**
         * Set the validator to validate strings.
         *
         * @return     {is.__validationUnit}  The validator itself.
         */
        this.String = function() {
            this.__type = "string";
            this.__validateType = (value) => (
                typeof value === "string"
            );
            return this;
        };

        /**
         * Set the validator to validate booleans.
         *
         * @return     {is.__validationUnit}  The validator itself.
         */
        this.Boolean = function() {
            this.__type = "boolean";
            this.__validateType = (value) => (
                typeof value === "boolean"
            );
            return this;
        }

        /**
         * Set the validator to validate numbers.
         *
         * @return     {is.__validationUnit}  The validator itself.
         */
        this.Number = function() {
            this.__type = "number";
            this.__validateType = (value) => (
                typeof value === "number"
            );
            return this;
        };

        /**
         * Set the validator to validate objects.
         *
         * @param      {Object}               schemaObj  The schema of the object to validate, made up of other validators.
         * @return     {is.__validationUnit}             The validator itself.
         */
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

        /**
         * Set the validator to validate arrays.
         *
         * @param      {is.__validationUnit}  schema  The validator which must validate every element of the array.
         * @return     {is.__validationUnit}          The validator itself.
         */
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

        /**
         * Set the validator to validate a variable type.
         *
         * @param      {is.__validationUnit}  schemaArray  An array of other validators.
         * @return     {is.__validationUnit}               The validator itself.
         */
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
    },
};

/**
 * Create a new validator object that is optional.
 *
 * @return     {is.__validationUnit}  A new optional validator object.
 */
is.optional = () => (new is.__validationUnit().optional());

/**
 * Create a new functional validator.
 *
 * @param      {Function}             functionalValidator  The functional validator which checks the subject for functional requirements.
 * @return     {is.__validationUnit}                       The new functional validator.
 */
is.Which = (functionalValidator) => (new is.__validationUnit().Which(functionalValidator));

/**
 * Create a new string validator.
 *
 * @return     {is.__validationUnit}  The new string validator.
 */
is.String = () => (new is.__validationUnit().String());

/**
 * Create a new boolean validator.
 *
 * @return     {is.__validationUnit}  The new boolean validator.
 */
is.Boolean = () => (new is.__validationUnit().Boolean());

/**
 * Create a new number validator.
 *
 * @return     {is.__validationUnit}  The new number validator.
 */
is.Number = () => (new is.__validationUnit().Number());

/**
 * Create an object validator.
 *
 * @param      {Object}               schemaObj  The schema object, made up of other validators.
 * @return     {is.__validationUnit}             The new object validator.
 */
is.Object = (schemaObj) => (new is.__validationUnit().Object(schemaObj));

/**
 * Create an array validator.
 *
 * @param      {is.__validationUnit}  schema  Any validator that the array elements must validate against.
 * @return     {is.__validationUnit}          The new array validator.
 */
is.ArrayOf = (schema) => (new is.__validationUnit().ArrayOf(schema));

/**
 * Create a variable type validator.
 *
 * @param      {is.__validationUnit[]}  schemaArray  Array of validator objects the subject must match against (at least one of them).
 * @return     {is.__validationUnit}                 The new variable type validator.
 */
is.OneOf = (schemaArray) => (new is.__validationUnit().OneOf(schemaArray));

export { is };
