/*jshint node:true*/
var rql = require("rql/js-array");

module.exports = {
	queryByIdentifier : function(astBody) {
		return function(name) {
			// TODO: create this functions as custom operators for rql engine
			return rql.query("recurse()&eq(type,Identifier)&eq(name,$1)&distinct()", {
				parameters : [
					name
				]
			}, astBody).length;
		};
	}
};