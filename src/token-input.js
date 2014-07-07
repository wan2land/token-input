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
		//SPACE: 32,
		//PAGE_UP: 33,
		//PAGE_DOWN: 34,
		//END: 35,
		//HOME: 36,
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		NUMPAD_ENTER: 108,
		COMMA: 188
	},

	DEFAULT_SETTINGS = {
		values : [],

		// 이 옵션은 반드시 해당 데이터안에서만 사용을 할 수 있도록 합니다.
		use_data_only : false,

		// 결과를 몇개까지 찾을 것인가.
		max_result : 4
	},

	TokenInput = function( settings ) {

		var
		runTokenInput = function() {

			// render :)
			var
			self = $(this),
			elem_container = $('<ul class="token-input"><li class="input input-ing"></li></ul>'),
			elem_autocomplete = $('<div class="autocomplete"></div>'),
			origin_input = null,

			is_ing_autocomplete = false,
			st_id = 0,
			
			initialize = function() {
				
				self.attr('autocomplete', 'off');
				self.before( elem_container );
				elem_container.find('li.input-ing').append( self );
				elem_container.after( elem_autocomplete );

				origin_input = self.clone();

				// event bind
				elem_container.bind('click', actionFocusInput);

				elem_container.on('keydown', 'input', actionKeydown);

				elem_autocomplete.on('mouseenter', 'div', actionenterAutocomplete);
				elem_autocomplete.on('click', 'div', function(e) {
					e.preventDefault();
					actionInsertToken();
				});

				elem_container.parents('form').bind('submit', function() {
					elem_container.find('li.input-ing > input').remove();
				});

			},

			actionInsertToken = function() {
				var
				current_li = elem_container.find('li.input-ing'),
				autocomplete_hover = elem_autocomplete.find('div.hover');

				if ( autocomplete_hover.length === 0 ) {
					return;
				}

				current_li.find('input').val( autocomplete_hover.data('value') );
				current_li.append('<p>' + autocomplete_hover.text() + '</p>');
				current_li.append('<span class="close"></span>');

				current_li.addClass('input-token').removeClass('input-ing');

				hideAutocomplete();
				actionFocusInput();
			},
			actionKeydown = function( e ) {
				var
				self = this,
				value = $(this).val();

				switch( e.keyCode ) {
					case KEY.ENTER :
					case KEY.TAB :
					case KEY.NUMPAD_ENTER :
					case KEY.COMMA :
						e.preventDefault();
						if ( value === "" ) return;
						actionInsertToken();
						break;
					case KEY.DOWN :
						e.preventDefault();
						if ( elem_autocomplete.hasClass('active') ) actionNextAutocomplete.apply( self, arguments );
						break;
					case KEY.UP :
						e.preventDefault();
						if ( elem_autocomplete.hasClass('active') ) actionPrevAutocomplete.apply( self, arguments );
						break;
					case KEY.LEFT :
						e.preventDefault();
						break;
					case KEY.RIGHT :
						e.preventDefault();

						break;

					case KEY.ESCAPE :
						e.preventDefault();


						break;
					case KEY.BACKSPACE :
						//e.preventDefault();

						//break;
					default :
						//is_run = false;
						if ( st_id && ! is_ing_autocomplete ) {
							clearTimeout( st_id );
						}

						is_ing_autocomplete = false;
						st_id = setTimeout(function() {
							is_ing_autocomplete = true;
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

				if ( value === "" ) {
					hideAutocomplete();
					return;
				}

				for( var i = settings.values.length; i--; ) {
					if ( re.test( settings.values[i]['name'] ) ) {
						result.push( settings.values[i] );
						if ( result.length >= settings.max_result ) {
							break;
						}
					}
				}

				if ( result.length ) {
					elem_autocomplete.addClass('active');
					var html = '';
					for( var i = result.length ; i--; ) {
						html += '<div data-value="'+ result[i].id+ '">' + result[i].name + '</div>';
					}
					elem_autocomplete.html( html );
					elem_autocomplete.children().eq(0).addClass('hover');

				}
				else {
					hideAutocomplete();
				}

			},
			hideAutocomplete = function() {
				elem_autocomplete.removeClass('active');
				elem_autocomplete.empty();
			},
			// 키보드로 아래 눌렀을 때.
			actionNextAutocomplete = function() {
				var
				current = elem_autocomplete.find('div.hover'),
				next = current.next();

				if ( next.length === 0 ) {
					return;
				}

				current.removeClass('hover');
				next.addClass('hover');
			},
			// 키보드로 위 눌렀을 때.
			actionPrevAutocomplete = function() {
				var
				current = elem_autocomplete.find('div.hover'),
				prev = current.prev();

				if ( prev.length === 0 ) {
					return;
				}

				current.removeClass('hover');
				prev.addClass('hover');
			},
			actionenterAutocomplete = function( e ) {
				$(this).siblings().removeClass('hover');
				$(this).addClass('hover');
			},
			actionFocusInput = function() {
				var input = elem_container.find('li.input-ing');
				if ( input.length === 0 ) {
					input = $('<li class="input input-ing"></li>');
					input.append( origin_input.clone() );
					elem_container.append( input );
				}
				input.find('input').focus();
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