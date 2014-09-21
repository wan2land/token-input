require([
	'src/token-input'
], function( TokenInput ) {

	var token = TokenInput.run({
		target : "input.token-input",
		use_data_only : false
	});

	//setTimeout(function() {
	//	token.clear();
	//}, 3000);

});