/* jshint esversion: 6 */

/**
 * constructs an XPath based on the provided arguments
 *
 * @param {string} SCHEMA_PREFIX   Used when constructing Xpath queries
 * @param {string} elementName     The name of the element to be searched for
 * @param {int} index              The instance of the named element to be searched for (if specified)
 * @returns {string} the XPath selector
 */
 module.exports.xPath = function (SCHEMA_PREFIX, elementName, index=null) {
	return `${SCHEMA_PREFIX}:${elementName}${index?`[${index}]`:""}`;
};


/**
 * constructs an XPath based on the provided arguments
 * 
 * @param {string} SCHEMA_PREFIX Used when constructing Xpath queries
 * @param {array} elementNames the name of the element to be searched for
 * @returns {string} the XPath selector
 */
module.exports.xPathM = function (SCHEMA_PREFIX, elementNames) {
	let t="";
	elementNames.forEach(elementName => {
		if (t.length) { t+="/"; first=false;}
		t+=`${SCHEMA_PREFIX}:${elementName}`;
	});
	return t;
};


/**
 * determines if a value is in a set of values - simular to 
 *
 * @param {String or Array} values The set of values to check existance in
 * @param {String} value           The value to check for existance
 * @returns {boolean} true if value is in the set of values
 */
module.exports.isIn = function (values, value, dbg=false) {
    if (dbg) console.log(`checking ${value} against ${values.length} choices`);
    if (typeof values=="string" || values instanceof String)
        return values==value;
   
    if (Array.isArray(values)) 	
		return values.includes(value);
    
    return false;
};
