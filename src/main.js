require.config({
	baseUrl : '/'
});
require([
	'src/token-input'
], function( TokenInput ) {

	var token = TokenInput.run("form.style-inline input.token-input");
	token.add([
		{id: 7, name: "Ruby"},
		{id: 11, name: "Python"},
		{id: 13, name: "JavaScript"},
		{id: 17, name: "ActionScript"},
		{id: 19, name: "Scheme"},
		{id: 23, name: "Lisp"},
		{id: 29, name: "C#"},
		{id: 31, name: "Fortran"},
		{id: 37, name: "Visual Basic"},
		{id: 41, name: "C"},
		{id: 43, name: "C++"},
		{id: 47, name: "Java"}
	]);
	setTimeout(function() {
		token.clear();
	}, 3000);

});