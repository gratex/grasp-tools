/*jshint node:true*/
var tabularDelimiter = "|";
module.exports = {
	tabularPrinter : function() {
		return {
			header : function(fields) {
				console.log(tabularDelimiter, fields.join(" " + tabularDelimiter + " "), tabularDelimiter);
				var dashs = fields.map(function(f) {
					return Array(f.length + 1).join("-"); // string.pad
				});
				console.log(tabularDelimiter, dashs.join(" " + tabularDelimiter + " "), tabularDelimiter);
			},
			append : function(fields) {
				console.log(tabularDelimiter, fields.join(" " + tabularDelimiter + " "), tabularDelimiter);
			},
			flush : function() {
			}
		};
	},
	jsonPrinter : function() {
		return {
			o : null,
			fields : null,
			header : function(fields) {
				this.o = [];
				this.fields = fields.map(function(f) {
					return f.replace(/[\s]/g, "").replace(/^[A-Z]/, function(s) {
						return s.toLowerCase();
					});
				});
			},
			append : function(arr) {
				var o = {};
				for ( var i = 0; i < arr.length; i++) {
					o[this.fields[i]] = arr[i];
				}
				this.o.push(o);
			},
			flush : function() {
				console.log(JSON.stringify(this.o, null, ""));
				this.o = [];
			}
		};
	}
};