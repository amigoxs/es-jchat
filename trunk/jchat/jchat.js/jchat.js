/**
 *
 * class:   jChat v1.0.0
 * extends: jQuery v1.3.2
 * coder:   Even Simon even.simon@gmail.com | www.evensimon.com
 *
 * Copyright (c) Even Simon 2009
 * under MIT license 
 *
 **/ 

var jChatConfig = {
	TITLE:            'jChat - Click to Chat',
	DIR_JCHAT:        'jchat/',
	DIR_IMAGES:       'jchat/jchat.images/',
	URL_SERVER:       'jchat.php',
	REFRESH_INTERVAL: 5 // seconds
};

(function($){
	$.jChat = function(_config)
	{
		if('undefined' != typeof _config)
		{
			$.jChat.CONFIG = _config;
		}
		else if('undefined' != typeof jChatConfig)
		{
			$.jChat.CONFIG = jChatConfig;
		}
		else if('undefined' == typeof jChatConfig)
		{
			throw new Error('jChat Error::configuration is undefined');
			return;
		}

		$.jChat.nickname = 'User'+Math.floor(Math.random()*1000);
		$.jChat.icon_unisex = 'icon_unisex.gif';
		$.jChat.icon_man = 'icon_man.gif';
		$.jChat.icon_woman = 'icon_woman.gif';
		$.jChat.icon = $.jChat.icon_unisex;

		$.jChat.visible = false;

		$.jChat.FUNC_REFRESH = 'REFRESH';
		$.jChat.FUNC_SAY = 'SAY';

		$.jChat.timeoutInterval = window.setInterval(
			function()
			{
				$.jChat.refresh();
			},
			($.jChat.CONFIG.REFRESH_INTERVAL*1000)
		);

		$.jChat.show = function(_callback)
		{
			if('undefined' == typeof _callback)
			{
				_callback = function(){};
			}
			if($.jChat.visible)
			{
				$('#jChatBox').fadeOut(
					'slow',
					function()
					{
						$('#jChatBar').animate(
							{
								'height':'30px'
							},
							1000
						);
					}
				);
				$.jChat.visible = false;
			}
			else
			{
				$('#jChatBar').animate(
					{
						'height':'279px'
					},
					1000,
					function()
					{
						$('#jChatBox').fadeIn(
							'fast',
							function()
							{
								_callback();
							}
						);
					}
				);
				$.jChat.visible = true;
			}
		}

		$.jChat.request = function(_params,_callback)
		{
			if('unefined' == typeof(_params))
			{
				return;
			}
			if('undefined' == typeof(_callback))
			{
				_callback = function(){};
			}

			var url = $.jChat.CONFIG.DIR_JCHAT + $.jChat.CONFIG.URL_SERVER + '?Function=' + _params.func;
 
			$.each(
				_params,
				function(param,_params)
				{
					url += (param != 'func') ? '&' + param + '=' + encodeURIComponent(_params) : '';
				}
			);
			$.getJSON(url,_callback);
		}

		$.jChat.refresh = function()
		{
			$.jChat.request(
				{
					func: $.jChat.FUNC_REFRESH
				},
				function(data)
				{
					if(data.Error)
					{
						throw new Error(data.Error);
						return;
					}
					$('#jChatTextbox').html(data.Data);
				}
			);
		}

		$.jChat.event = function()
		{
			$('#jChatInput').attr({'disabled':true});
			var message = $('#jChatInput').val();
			$('#jChatInput').val('Sending...');

			message = message.replace(/\<.*?\>/gi,'');
			message = message.replace(/\<\/.*?\>/gi,'');

			if(message.substr(0,1) == '/')
			{
				if(message.substr(1,4) == 'nick')
				{
					$.jChat.nickname = message.substring(6);
				}
				else if(message.substr(1,3) == 'man')
				{
					$.jChat.icon = $.jChat.icon_man;
				}
				else if(message.substr(1,5) == 'woman')
				{
					$.jChat.icon = $.jChat.icon_woman;
				}
				$('#jChatInput').val('');
				$('#jChatInput').attr({'disabled':false});
				return;
			}

			message = '<img src="'+$.jChat.CONFIG.DIR_IMAGES+$.jChat.icon+'" border="0">'+
				'<b>'+$.jChat.nickname+':</b> '+message+'<br>'; 

			$.jChat.request(
				{
					func: $.jChat.FUNC_SAY,
					Message: message
				},
				function(data)
				{
					$('#jChatInput').val('');
					$('#jChatInput').attr({'disabled':false});
				}
			);
		}

		$.jChat.helpClick = function()
		{
			if(!$.jChat.visible)
			{
				$.jChat.show(
					function()
					{
						$.jChat.helpMouseOver();
					}
				);
			}
		}

		$.jChat.helpMouseOver = function()
		{
			if($.jChat.visible)
			{
				$('#jChatTooltip').fadeIn('fast');
			}
		}

		$.jChat.helpMouseOut = function()
		{
			$('#jChatTooltip').fadeOut('fast');
		}

		$('body').append(
			'<div id="jChatBar">'+
				'<div id="jChatButton" onclick="$.jChat.show();">'+
					$.jChat.CONFIG.TITLE+
				'</div>'+
				'<div id="jChatHelp" onclick="$.jChat.helpClick();" onmouseover="$.jChat.helpMouseOver()" onmouseout="$.jChat.helpMouseOut()">'+
					'<img src="'+$.jChat.CONFIG.DIR_IMAGES+'icon_help.gif" border="0">'+
				'</div>'+
				'<div id="jChatBox">'+
					'<div id="jChatTextbox"></div>'+
					'<input type="text" id="jChatInput">'+
				'</div>'+
				'<div id="jChatTooltip">'+
					'<div id="jChatTooltipText">'+
						'<center><b>jChat v1.0.0</b></center><br>'+
						'<b>Commands:</b><br>'+
						'<b>/nick</b> change nickname<br>'+
						'<b>/man</b> set icon to man<br>'+
						'<b>/woman</b> set icon to woman<br><br>'+
						'<center><u>Bad language and HTML are forbidden!</u><br><br>'+
						'Copyright &copy; <a href="http://www.evensimon.com/" target="_blank">Even Simon</a> 2009<br>'+
						'under <a href="http://www.opensource.org/licenses/mit-license.php" target="_blank">MIT</a> license</center>'+
					'</div>'+
				'</div>'+
			'</div>'
		);

		$('#jChatInput').keyup(
			function(e)
			{
				if(e.keyCode == 13)
				{
					$.jChat.event();
				}
			}
		);

		$(window).scroll(
			function()
			{
				$('#jChatBar').stop().animate(
					{
						'right': '0px',
						'top': ($(window).scrollTop()+30)+'px'
					},
					'slow'
				);
			}
		);

		if(document.all)
		{
			$('#jChatInput').css({'width':'219px'});
		}
	}
})(jQuery);