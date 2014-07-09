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

		// 중복값 사용가능 (O)
		use_duplicate : false,

		// 결과를 몇개까지 찾을 것인가.
		max_result : 4
	},

	TokenInput = function( settings ) {

		var
		runTokenInput = function() {

			// render :)
			var
			self = $(this),

			elem_container = $('<ul class="token-input"></ul>'),

			elem_text = $('<li class="input input-ing"></li>'),
			elem_text_input = $('<input type="text" autocomplete="off" />'),

			elem_autocomplete = $('<div class="autocomplete"></div>'),
			
			elem_token = $('<li class="input input-token"></li>'),
			elem_token_input = $('<input type="hidden" name="' + self[0].name +'" />'), // self.clone(),

			// use in autocomplete, timeout.
			is_ing_autocomplete = false,
			st_id = 0,

			bs_status = 0,
			
			initialize = function() {

				// create Element :)				
				self.before( elem_container );

				elem_container.append( elem_text );
				elem_container.after( elem_autocomplete );

				elem_text.append(elem_text_input);

				self.remove();

				// event bind
				elem_container.bind('click', actionFocusInput);

				elem_text_input.bind('keydown', actionKeydown);

				elem_autocomplete.on('mouseenter', 'div', actionEnterACItem);
				elem_autocomplete.on('click', 'div', actionClickACItem);

				elem_container.on('mouseenter', 'li.input-token', actionEnterToken);
				elem_container.on('click', 'li.input-token', actionClickToken);

			},
			actionEnterToken = function() {
				$(this).siblings().removeClass('hover');
			},
			actionClickToken = function( e ) {
				e.preventDefault();
				$(this).addClass('hover');
				removeToken();
			},
			removeToken = function() {
				elem_container.find('li.input-token.hover').remove();
			},
			insertToken = function() {
				var
				autocomplete_hover = elem_autocomplete.find('div.hover');

				if ( autocomplete_hover.length === 0 ) {
					return;
				}

				var
				new_elem_token = elem_token.clone(),
				new_elem_token_input = elem_token_input.clone();

				new_elem_token.append( new_elem_token_input );
				new_elem_token.append('<p>' + autocomplete_hover.text() + '</p><span class="close"></span>');

				new_elem_token_input.val( autocomplete_hover.data('value') );

				elem_text.before( new_elem_token );
				elem_text_input.val('');

				hideAutocomplete();
				actionFocusInput();
			},
			actionKeydown = function( e ) {
				var
				self = this,
				value = $(this).val();

				switch( e.keyCode ) {
					case KEY.ENTER :
					//case KEY.TAB :
					case KEY.NUMPAD_ENTER :
					case KEY.COMMA :
						e.preventDefault();
						if ( value === "" ) return;
						insertToken();
						break;
					case KEY.DOWN :
						e.preventDefault();
						if ( elem_autocomplete.hasClass('active') ) nextAutocomplete.apply( self, arguments );
						break;
					case KEY.UP :
						e.preventDefault();
						if ( elem_autocomplete.hasClass('active') ) prevAutocomplete.apply( self, arguments );
						break;
					case KEY.LEFT :
					case KEY.RIGHT : 
						e.preventDefault();
						var hover_token = elem_container.find('li.input-token.hover');
						
						if ( hover_token.length !== 0 ) {
							var hover_next_token;
							if ( e.keyCode === KEY.LEFT ) {
								hover_next_token = hover_token.prev();
							}
							else {
								hover_next_token = hover_token.next();
							}
							if ( hover_next_token.length !== 0 ) {
								hover_next_token.addClass('hover').siblings().removeClass('hover');
								if ( hover_next_token.hasClass('input-token') ) {
									hover_next_token.addClass('hover');
								}
								hover_next_token.siblings().removeClass('hover');
							}
						
						}
						else if ( e.keyCode === KEY.LEFT ) {
							elem_container.find('li.input-token').eq(-1).addClass('hover');
						}
						break;
					case KEY.ESCAPE :
						e.preventDefault();
						hideAutocomplete();
						break;
					case KEY.BACKSPACE :
						// 이때만 작동해야하고 그 이외에는 정상적으로 현재 폼에있는 글씨 지우는걸로.
						if ( value === "" ) {
							e.preventDefault();
							var hover_token = elem_container.find('li.input-token.hover');
							if ( hover_token.length === 0 ) {
								var last_token = elem_container.find('li.input-token').eq(-1);
								if( ! last_token.hasClass('hover') ) {
									last_token.addClass('hover');
								}
							}
							else {
								removeToken();
							}
							break;
						}
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
				result = [],
				current_values = [];

				if ( ! settings.use_duplicate ) {
					elem_container.find('li.input-token > input').each(function(i, item) {
						if ( typeof item.value !== "undefined" ) {
							current_values.push( parseInt(item.value) );							
						} 
					});

				}

				if ( value === "" ) {
					hideAutocomplete();
					return;
				}

				for( var i = settings.values.length; i--; ) {
					if ( re.test( settings.values[i]['name'] ) &&
								$.inArray( settings.values[i]['id'], current_values ) === -1 ) {

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
			nextAutocomplete = function() {
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
			prevAutocomplete = function() {
				var
				current = elem_autocomplete.find('div.hover'),
				prev = current.prev();

				if ( prev.length === 0 ) {
					return;
				}

				current.removeClass('hover');
				prev.addClass('hover');
			},
			actionEnterACItem = function( e ) {
				$(this).addClass('hover').siblings().removeClass('hover');
			},
			actionClickACItem = function( e ) {
				e.preventDefault();
				insertToken();
			},
			actionFocusInput = function() {
				elem_text_input.focus();
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