/*jshint node:true*/
module.exports = {
	requireOrDefine : {
		call : function(ast) {
			return ast.query('call[callee=(#require,#define)]');
		},
		args : function(ast) {
			return ast.query('call[callee=(#require,#define)].args:matches(arr).elements');
		},
		aliases : function(ast) {
			return ast.query('call[callee=(#require,#define)].args:last:matches(func-exp)');
		}
	}
};