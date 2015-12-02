/*jshint node:true*/
/**
* Find all on events listeners that don't null event variable in callback
*/

require('../lib/grasp')(function(ast) {
	"use strict";
	//equery.query('__.on(_str, function(__){ _$ })', ast);
	ast.query("call[callee=member[prop=#on]].args:last:matches(func-exp)").log(function(funcAst) {
		if (funcAst.params.length) { // at least one params is required
			var e = funcAst.params[0].name; // name of alias for event object in cb
			return !funcAst.query("assign[left=#" + e + "][right=null]").length;
		}
	});
});
