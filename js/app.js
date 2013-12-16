$(function(){
	$('.splash .makeYourHoliday').fitText(1.25);
	$('.splash .beautiful').fitText(0.8);
		
	if (Modernizr.canvas) {
		selectLanguage();
		initLanguage();

		fitWindow();
	
		if(window.location.href.indexOf('board') > -1){
			initCarousel();
		}
	
		
	}
	else {
		$('.splash').html('<p>This site is not supported by your browser. Please download <a href="https://www.google.com/intl/en/chrome/browser/" target="_blank">Chrome</a>.</p>');
	
	}
	//Keyboards in mobile mess with this:
	
	/*portraitCheck();
	$(window).resize(function(){
		portraitCheck();
	});*/
});

function detectLegacyBrowser(){
	

}

function initLanguage(){
	var languages = ['eng','jpn','man','por','spa','ger'];
	if(window.location.hash.length > 1){
		var language = window.location.hash.split('#');
		if($.inArray(language[1], languages) > -1){
			$('span.lang').hide();
			$('span.'+language[1]).show();
		}
	}
}

function selectLanguage(){
	$('.selectLanguage').on('click','a',function(event){
	
		$('.selectLanguage a').removeClass('active');
		$(this).addClass('active');
		
		var language = $(this).attr('id');
		var searchVal = window.location.search;
		window.location.href = 'board.html'+searchVal+'#'+language;
		
		event.preventDefault();
		
	});
}

function initCarousel(){
	window.carousel = new Swipe(document.getElementById('carousel'), {
		auto: 8000,
		callback: function(i) {
			$('#carouselNav li.on').removeClass('on');
			$('#carouselNav li:eq(' + i + ')').addClass('on');
		}
	});
	
	//WHY?
	$('#carousel div[data-index=2]').remove();
	$('#carousel div[data-index=3]').remove();
	
	
	$('.howToPlay').append('<a class="next">&#x25b6;</a><a class="prev">&#x25c0;</a>');
	$('.howToPlay > .next').on('click',function(event){
		window.carousel.next();
		event.preventDefault()
	});
	$('.howToPlay > .prev').on('click',function(event){
		window.carousel.prev();
		event.preventDefault()
	});
	
	//GALLERY TRIGGER
	$('#galleryTab').on('click',function(event){
		if($(this).hasClass('active')){
			$('#galleryContainer').slideUp();
			$(this).removeClass('active');
			$('.bottom .share').show();
		}
		else{
			$('#galleryContainer').slideDown();
			$(this).addClass('active');
			$('.bottom .share').hide();
		}
		event.preventDefault()
	});
	
	//SET CANVAS ALERT
	$('#canvasAlert').css({'width':canvasStats.totalWidth*0.8,'left':canvasStats.totalWidth*0.1,'top':canvasStats.toolbarHeight + (canvasStats.triangleSize/2)});
	$('#canvasAlert').html($('#canvasAlertStage .first')).fadeIn();
	
	//SET GALLERY LIGHTBOX TO CANVAS DIMENSIONS
	$('#gallery').css('paddingTop',canvasStats.toolbarHeight-3);
	$('#galleryNav').css('height',canvasStats.toolbarHeight);
	$(window).resize(function(){
		$('#gallery').css('paddingTop',canvasStats.toolbarHeight);
		$('#galleryNav').css('height',canvasStats.toolbarHeight);
	});
	
	//CAROUSEL NAVIATION
	$('#carousel,#galleryContainer').on('click','.gallery a',function(event){
		var full = $(this).attr('href');
		$('#gallery').html('<img data-index="'+$(this).parent().index()+'" src="'+full+'">').fadeIn();
		$('#galleryNav').fadeIn();
		
		$('html, body').animate({
	    	scrollTop: $('#container').offset().top
	    }, 500);
		
		event.preventDefault();
	});
	
	var galleryLength = $('.gallery li').length-1;
	
	//NEXT, PREVIOUS
	$('#galleryNav').on('click','a.next',function(event){
		var currentSlide = $('#gallery img').data('index');
		if(currentSlide < galleryLength){
			$('#gallery').html('<img data-index="'+(currentSlide+1)+'" src="'+$('.gallery li').eq(currentSlide+1).children('a').attr('href')+'">');
		}
		if(currentSlide === galleryLength){
			$('#gallery').html('<img data-index="'+0+'" src="'+$('.gallery li').eq(0).children('a').attr('href')+'">');
		}
		event.preventDefault()
	});
	$('#galleryNav').on('click','a.prev',function(event){
		var currentSlide = $('#gallery img').data('index');
		if(currentSlide > 0){
			$('#gallery').html('<img data-index="'+(currentSlide-1)+'" src="'+$('.gallery li').eq(currentSlide-1).children('a').attr('href')+'">');
		}
		if(currentSlide === 0){
			$('#gallery').html('<img data-index="'+galleryLength+'" src="'+$('.gallery li').eq(galleryLength).children('a').attr('href')+'">');
		}
		event.preventDefault()
	});
	//CLOSE
	$('#galleryNav').on('click','a.close',function(event){
		$('#gallery,#galleryNav').fadeOut();
		$('#gallery').html('');
		$('#galleryContainer').hide();
		$('#galleryTab').removeClass('active');
		$('.bottom .share').show();
		
		$('html, body').animate({
	    	scrollTop: $('#container').offset().top
	    }, 500);
	    
	    event.preventDefault()
	});
}

function fitWindow(){
	if($(window).width() < 769){
		if($('html').outerHeight() < $(window).height()){
			if($('.splash')){
				$('.splash .columns')
					.height($('.splash .columns').outerHeight() + ($(window).height() - $('html').outerHeight())-10)
					.css('padding-top',$('.splash .columns').outerHeight()/5);
			}
		}
	}
}

function portraitCheck(){
	if(window.innerWidth < 768 && window.innerHeight < window.innerWidth){
	    $('#portraitPlease').show().height(window.innerHeight);
	    $('body,html').css({'overflow':'hidden','height':'100%','width':'100%'})
	}
	else{
		$('#portraitPlease').hide();
		$('body,html').css({'overflow':'auto','height':'auto','width':'auto'})
	}
}

var defaultImageURL = 'http://www.geometryholidaycard.com/images/share.jpg';