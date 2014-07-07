;(function(global, factory){
	if ( typeof define === 'function' && define.amd ) {
		define(['vendor/zepto.min'], factory);
	}
	else {
		global.TokenInput = factory( global.Zepto );
	}
})(this, function( $ ){

	var

	KEY = {
		BACKSPACE: 8,
		TAB: 9,
		ENTER: 13,
		ESCAPE: 27,
		SPACE: 32,
		PAGE_UP: 33,
		PAGE_DOWN: 34,
		END: 35,
		HOME: 36,
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		NUMPAD_ENTER: 108,
		COMMA: 188
	},

	DEFAULT_SETTINGS = {
		values : []
	},

	TokenInput = function( settings ) {

		runTokenInput = function() {

			// render :)
			var
			self = $(this),
			elem_container = $('<ul class="token-input"><li class="input input-ing"></li></ul>'),
			elem_autocomplete = $('<div class="autocomplete"></div>'),
			
			initialize = function() {
				
				self.attr('autocomplete', 'off');
				self.before( elem_container );
				elem_container.find('li.input-ing').append( self );
				elem_container.after( elem_autocomplete );

				// event bind
				elem_container.bind('click', function() {
					self.focus();
				});
				elem_container.on('keydown', 'input', actionKeydown);


			},
			actionKeydown = function( e ) {
				var self = this;
				switch( e.keyCode ) {
					case KEY.ENTER :
					case KEY.TAB :
					case KEY.NUMPAD_ENTER :
					case KEY.COMMA :
						
						$(this).after('<p>' + $(this).attr('readonly', 'readonly').val() + '</p>');
						$(this).next().after('<span class="close"></span>');
						$(this).parent().addClass('input-token').removeClass('input-ing');
						break;
					default :
						setTimeout(function() {
							runAutocomplete.apply( self, arguments );
						}, 0);
						break;
				}
	//			console.log( settings.values );
			},
			runAutocomplete = function( e ) {
				var
				value = $(this).val(),
				re = new RegExp(value, "i"),
				result = [];
				for( var i = settings.values.length; i--; ) {
					if ( re.test( settings.values[i]['name'] ) ) {
						result.push( settings.values[i] );
					}
				}

				//elem_autocomplete.html()
			};

			initialize();

		};

		$.each( this, function() { runTokenInput.apply( this ) });

		return {
			add : function( items ) {
				settings.values = $.extend( settings.values, items );
			},
			remove : function( item ) {

			},
			clear : function() {
				settings.values = [];
			},
			get : function() {
				return settings.values
			}
		}
	};

	// Return in Requirejs
	return {
		run : function( opt ) {
			var
			settings = $.extend({}, DEFAULT_SETTINGS),
			target;
			if ( typeof opt === "string" ) {
				target = opt;
			}
			else {
				settings = $.extend(settings, opt);
				target = settings.target;
			}
			delete settings.target;
			return TokenInput.call( document.querySelectorAll( target ), settings );
		}
	};

});