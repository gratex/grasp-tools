/*jshint node:true*/
/**
* Find all functions with more than 1 returns
*/

require('../lib/grasp')(function(ast) {
	"use strict";
	ast.query('(func-exp, func-dec)').log(function(func) {
		return func.query('return').length > 1;
	});
});
