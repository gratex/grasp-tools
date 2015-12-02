/*jshint node:true*/
/**
* find:   __.replace(__,__,__)
* except: domClass.replace(__,__,__)
*/

require('../lib/grasp')(function(ast) {
	"use strict";
	ast.query('call[callee=member[prop=#replace][obj=:not(#domClass)]]').log(function(ast) {
		return (ast["arguments"].length === 3);
	});
});
