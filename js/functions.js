/*JQuery*/
(function($) {
	var $ = jQuery;

	jQuery.browser = {};
	(function () {
		jQuery.browser.msie = false;
		jQuery.browser.version = 0;
		if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
			jQuery.browser.msie = true;
			jQuery.browser.version = RegExp.$1;
		}
	})();

	"use strict";

	let c3 = window.c3 = window.c3 || {};

	var $status = $('.slide-counter');
	var $slickElement = $('.content-carousel');

	if ( $slickElement.length > 0 ) {
		$slickElement.on('init reInit afterChange', function (event, slick, currentSlide, nextSlide) {
			// currentSlide is undefined on init -- set it to 0 in this case (currentSlide is 0 based)
			var i = (currentSlide ? currentSlide : 0) + 1;
			$status.text(i + ' / ' + slick.slideCount);
		});

		$slickElement.slick({
			infinite: false,
			slidesToShow: 1,
			slidesToScroll: 1,
			arrows: true,
			dots: true,
			fade: true,
			appendDots: $slickElement.next('.slider-controls').children('.slider-dots'),
			prevArrow: $slickElement.next('.slider-controls').children('.slider-prev'),
			nextArrow: $slickElement.next('.slider-controls').children('.slider-next')
		});
	}

	/* Video Slick Carousel */
	var videoSlickCarousel = $('.video-carousel');
	if (videoSlickCarousel.length > 0) {
		videoSlickCarousel.each(function(){
			var videoCarousel = $(this);
			
			videoCarousel.slick({
				infinite: 		true,
				slidesToShow: 	1,
				slidesToScroll:	1,
				arrows: 		true,
				dots: 			videoCarousel.hasClass('video-carousel-has-dots'),
				fade: 			true,
				appendDots: 	(videoCarousel.hasClass('video-carousel-has-dots') ? videoCarousel.next('.video-carousel-slider-controls').children('.slider-dots') : false),
				prevArrow: 		'<button type="button" class="video-carousel-slider-controls-slider-prev"></button>',
				nextArrow: 		'<button type="button" class="video-carousel-slider-controls-slider-next"></button>'
			});
		});
	}

	/*Rotating hero*/
	var $heroContainer = $('.product-heros'),
		$heroes = $heroContainer.find('.rotating-hero'),
		activeClass = 'active',
		pageHeroClass = 'rotating-hero',
		heroTransitionTimer = 3000; // miliseconds

	if ($.browser.msie && $.browser.version == 11) {
		$("body").addClass("ie11");
	}

	setInterval(switchHeroes, heroTransitionTimer);


	// Hide old hero and show new hero
	function switchHeroes() {
		var $activeHero = getActiveHero(),
			$nextHero = getNextHero($activeHero);

		$activeHero.removeClass(activeClass);
		$nextHero.addClass(activeClass);
	}

	// Find the current active hero and return it as a jQuery Element
	function getActiveHero() {
		return $('.' + pageHeroClass + '.' + activeClass).first();
	}

	// Get the next hero based on current active hero
	// $activeHero : jQuery Element
	function getNextHero($activeHero) {
		var $nextElement = $activeHero.next();

		if ( $nextElement === null || !$nextElement.hasClass(pageHeroClass) ) {
			$nextElement = $('.' + pageHeroClass).first();
		}

		return $nextElement;
	}



	$(window).scroll(function(){
		if ($(this).scrollTop() > 0) {
			$('.light-header').addClass('scrolling');
			$('.section-menu').addClass('scrolled-position');
		} else {
			$('.light-header').removeClass('scrolling');
			$('.section-menu').removeClass('scrolled-position');
		}
	});


	/**
	 * Header auto-hide
	 */
	 $('#main-nav .mega-menu.menu-item').on('mouseover', function() {
		$('body').addClass('menu-is-open');
	});
	$('#main-nav .mega-menu.menu-item').on('mouseout', function() {
		$('body').removeClass('menu-is-open');
	});
	
	var lastScrollTop = 0;
	
	$(window).on('load scroll', function(event) {
		var st = $(this).scrollTop();
		if(st < 100) {
			$('body').removeClass('is-scrolling');
		} else {
			$('body').addClass('is-scrolling');
		}

		if (st > lastScrollTop) {
			// downscroll code
			$('body').removeClass('up').addClass('down');
		} else {
			// upscroll code
			$('body').removeClass('down').addClass('up');
		}
		lastScrollTop = st;
	});
	/* END Header auto-hide */


	/*sticky sidebar menu*/

	/* var $menu = $('.fixed-menu'),
		$timeline = $('.section-timeline, .cta-section, .footer, .nav-footer-action').first(),
		$socialWidgets = $('.fixed-menu + .widget_c3ai_social_share_widget'),
		anchorEl = $menu.data('anchor-el'),
		menuHeight = $menu.outerHeight(),
		menuDefaultTop = parseInt($menu.css('top')),
		menuPaddingTweak = 35;


	var $menu2 = $('.section-menu'),
		$cta = $('.section-timeline, .cta-section, .footer, .nav-footer-action').first(),
		anchorEl = $('#sticky-anchor').data('anchor-el'),
		menu2Height = $menu2.outerHeight(),
		menu2DefaultTop = parseInt($menu2.css('top')),
		menu2PaddingTweak = 35;

	$(document).ready( function(){
		$menu.addClass('fixed-menu-fade-in');
		cleanUpJumpPositions();

		// if ( $('.menu-enterprise-ai-for-manufactoring-container').length > 0 ) {
		// 	setTimeout(function(){
		// 		$('.section-menu').addClass('section-menu-fade-in');
		// 	}, 500);
		// }
	});

	// Run on load then on scroll
	$(window).on('scroll', cleanUpJumpPositions );

	function cleanUpJumpPositions(){
		var scrollTop = $(document).scrollTop();

		if (top.length) {
			var menuMaxTop = $timeline.offset().top - parseInt($timeline.prev().css('paddingTop')) - menuHeight - menuDefaultTop - menuPaddingTweak;
		}

		// Adjust menu next to an elements if using our custom field
		if ( anchorEl && $('#' + anchorEl).length > 0 ){
			var anchorElTop = $('#' + anchorEl).offset();
			var menuMinTop = ( scrollTop * -1 ) + anchorElTop.top + 80;
			// console.log( anchorElTop );
		}


		if ( 185 < menuMinTop ) {
			$menu.css('top', menuMinTop);
			$socialWidgets.css('top', menuMinTop + menuHeight + 50);
		} else if ( scrollTop >= menuMaxTop ) {
			var newMenuTop = menuDefaultTop - (scrollTop - menuMaxTop);
			$menu.css('top', newMenuTop);
			$socialWidgets.css('top', newMenuTop + menuHeight + 50);
		} else if ( parseInt($menu.css('top')) !== menuDefaultTop ) {
			$menu.css('top', menuDefaultTop);
			$socialWidgets.css('top', menuDefaultTop + menuHeight + 50);
		}

		// Menu 2 stuff.

		// Grab fresh in case it changes.
		menu2Height = $menu2.outerHeight();

		// Adjust menu next to an elements if using our custom field
		if ( anchorEl && $('#' + anchorEl).length > 0 ){
			var anchorElTop = $('#' + anchorEl).offset();
			var menu2MinTop = ( scrollTop * -1 ) + anchorElTop.top + 80;
			// console.log( anchorElTop );
		}

		// if (top.length) {
			var menu2MaxTop = $cta.offset().top - parseInt($cta.prev().css('paddingTop')) - menu2Height - menu2DefaultTop - menu2PaddingTweak;

		// }

		// console.log( menu2DefaultTop, menu2Height, top );



		if ( 185 < menu2MinTop || $menu2.find('#menu-c3-ai-suite').length > 0 ) {
			// If dealing with our custom AI Suite menu, attach regardless
			$menu2.css('top', menuMinTop);
		} else if ( scrollTop >= menu2MaxTop ) {
			var newMenu2Top = menu2DefaultTop - (scrollTop - menu2MaxTop);
			$menu2.css('top', newMenu2Top);
		} else if ( parseInt($menu2.css('top')) !== menu2DefaultTop ) {
			$menu2.css('top', menu2DefaultTop);
		}
	} */




	/**
	 * c3-horizon-card
	 */

	$('.c3-horizon-card--wrapper').slick({
		arrows: true,
		infinite: false,
		slidesToShow: 3,
		slidesToScroll: 3,
		variableWidth: false,
		prevArrow: '<button type="button" class="slick-prev c3-horizon-card--prev"><img src="/wp-content/themes/c3-ai-theme/assets/images/chevron-left-small.svg" /></button>',
		nextArrow: '<button type="button" class="slick-next c3-horizon-card--next"><img src="/wp-content/themes/c3-ai-theme/assets/images/chevron-right-small.svg" /></button>',
		responsive: [
				{
				breakpoint: 1024,
				settings: {
					arrows: true,
					slidesToShow: 2,
					slidesToScroll: 2,
					variableWidth: false
				}
			},
				{
				breakpoint: 640,
				settings: {
					arrows: false,
					slidesToShow: 1,
					slidesToScroll: 1,
					variableWidth: true
				}
			}
		]
	}).each(function(index) {
		const $el = $(this);
		let ww;
		function updateHeight() {
			if (ww === window.innerWidth) { return; }
			ww = window.innerWidth;
			const $parent = $el.find('.slick-track');
			if (!$parent.length) { return; }
			const $link = $parent.find('.c3-horizon-card--link');
			// reset first
			$link.css('height', 'auto');
			const height = $parent.height();
			$link.css('height', height);
		}
		updateHeight();
		$(window).resize(updateHeight);
	});






	/**
	 * set mobile menu where is slides from right when clicking hamburger icon (it's from jointswp theme)
	 * @see http://jointswp.com/docs/off-canvas-menu/
	 * @see https://foundation.zurb.com/sites/docs/off-canvas.html
	 * @see https://foundation.zurb.com/sites/docs/drilldown-menu.html
	 */
	const setMobileMenu = function() {
		const $offCanvas = $('#off-canvas');
		if (!$offCanvas.length) { return; }
		// add event when off-canvas is open/close to toggle the fullpagejs scroll
		// ignore if no c3 funciton exist (it means no fullpage js has used)
		if (window.c3 && c3.disableFPScroll && c3.enableFPScroll) {
			$offCanvas.on('opened.zf.offcanvas', c3.disableFPScroll);
			$offCanvas.on('closed.zf.offcanvas', c3.enableFPScroll);
		}
		// fixed the bug drilldown scroll is extremely longer
		// somehow height in an element with `is-drilldown` class gets a wrong height
		const $drilldown = $offCanvas.find('[data-drilldown]');
		if (!$drilldown.length) { return; }
		const $drilldownScroll = $offCanvas.find('.is-drilldown');
		if (!$drilldownScroll.length) { return; }
		const openDrilldown = function() {
			// get element has `is-active` class
			const $activeMenu = $drilldown.find('.menu.is-active');
			$activeMenu.css('min-height', 'auto');
			const menuHeight = $activeMenu.height();
			// apply 50ms later to overwrite the style
			setTimeout(function() {
				$drilldownScroll.css('min-height', Math.max(menuHeight + 16, window.innerHeight));
			}, 50);
			// lazy load images
			c3.lazyBgLoad($activeMenu[0].querySelectorAll('[data-bg-image]'));
			c3.lazyImage($activeMenu[0].querySelectorAll('[data-src]'));
		};
		$drilldown.on('open.zf.drilldown', openDrilldown);
	};

	$(document).ready(function() {
		setMobileMenu();
		c3.initModalVideos('c3-video--modal');
	});



	/*JS*/
	'use strict';
	function c3_set_up_link_watchers() {

		document.addEventListener('DOMContentLoaded', function() {
			// look for the jump links
			var linkQuery = 'div.has-fixed-sidemenu ul.fixed-menu li a, .has-fixed-sidemenu ul.jumplinks-menu li a, .has-fixed-sidemenu ul.jumplinks-menu.clone li a, #menu-ai-suite-section-menu > li > a, #menu-enterprise-ai-for-manufacturing-product > li > ul > li > a';
			var links = document.querySelectorAll(linkQuery);

			// if there are any...
			if (links.length > 0) {

				//default the first link found to active
				var activeLink = links[0];

				if (links[0].hash && document.querySelector(links[0].hash)) {
					setJumpLinkActiveStyles(activeLink);
				} else {
					activeLink = null;
				}

				// create threshold array starting with 0
				var thresholdArray = [0];
				// add 100 even increments
				for (var i = 1; i < 101; i++) {
					thresholdArray.push(+((i/100).toFixed(2)));
				}

				// create a new IntersectionObserver that sets the state
				// of the link which has the visible section
				var jumplinkSectionObserver = new window.IntersectionObserver(function(entries) {
					// go through each entry
					for (var i = 0; i < entries.length; i++) {
						// store the anchor tag that corresponds to the href hash
						var link = document.querySelector('[href*="#' + entries[i].target.id + '"]');
						// if it's intersecting the viewport and it's close enough to the top
						if (entries[i].isIntersecting &&
							entries[i].intersectionRect.top <= 150 &&
							entries[i].intersectionRect.bottom > 150) {
							// set the current activeLink styles to default
							setJumpLinkInactiveStyles(activeLink);
							// set the link to active styles
							setJumpLinkActiveStyles(link);
							// set the link as the active link
							activeLink = link;
						}
					}
				}, {
					threshold: [].concat(thresholdArray)
				});

				// for each of the jump links
				links.forEach(function(link) {
					// get the hash of the link (this should be the selector for the section)
					var selector = link.hash;
					// bail out if selector is empty
					if (!selector) return;
					// store the result of the query using that selector
					var elem = document.querySelector(selector);
					// if an element was found
					if (elem) {
						// observe it
						jumplinkSectionObserver.observe(elem);
					}
				});

				/* // for observing area that will result in low contrast for the active links
				var darkSectionObserver = new window.IntersectionObserver(function(entries) {
					var makeWhite = entries.some(function(entry) {
						return entry.isIntersecting && isIntersecting(entry.target, activeLink)
					});

					var jumplinks = activeLink.parentNode.parentNode.children;
					if (makeWhite) {
						activeLink.parentNode.parentNode.classList.add('jump-dark-bg');
					} else { // if not
						activeLink.parentNode.parentNode.classList.remove('jump-dark-bg');
					}
					for (var i = 0; i < entries.length; i++) {
						for (var j = 0; j < jumplinks.length; j++) {
							if ( entries[i].isIntersecting && isIntersecting(entries[i].target, jumplinks[j]) ) {
								jumplinks[j].classList.add('jump-el-dark-bg');
							} else {
								jumplinks[j].classList.remove('jump-el-dark-bg');
							}
						}

					}
				}, {
					threshold: [].concat(thresholdArray)
				});

				// observe all dark sections
				var darkSections = document.querySelectorAll('.dark-section');
				darkSections.forEach(function(s) {
					darkSectionObserver.observe(s);
				}); */
			}

		});


		// Custom handling of global menu sidenavs
		document.addEventListener('DOMContentLoaded', function() {

			// look for the jump links
			var linkQuery = '.sidenav-init-global-menu > li > a, .jumplinks-menu > li > a';
			var links = document.querySelectorAll(linkQuery);
			var menuElement = document.querySelectorAll('.sidenav-init-global-menu, .jumplinks-menu')[0];
			$(menuElement).parent().addClass('js-sidenav');

			// if there are any...
			if (links.length > 0) {

				/* Sidenav coloring */
				// Clone Sidenav
				$(menuElement).clone().addClass("clone").appendTo('.js-sidenav');

				// Create SVG for Masks
				$('.js-sidenav').prepend('<svg height="0" width="0"><defs><clipPath id="mask"></clipPath></defs></svg>');

				function setMasks() {
					$(".js-sidenav svg defs clipPath").html("");

					$(".content.has-global-menu .dark-section:not(.display-none), .content.has-fixed-sidemenu .dark-section:not(.display-none)").each(function (i) {
						var sectionX = $(this).offset().left - $('.js-sidenav')[0].getBoundingClientRect().left;
						var sectionY = $(this).position().top + parseInt($(this).css('marginTop')) - $(window).scrollTop() - $('.js-sidenav')[0].getBoundingClientRect().top + $('.content.has-global-menu, .content.has-fixed-sidemenu').offset().top;
						var sectionWidth = $(this).outerWidth();
						var sectionHeight = $(this).outerHeight();

						var $svg = $(".js-sidenav svg defs clipPath");
						$(SVG("rect"))
						.attr("x", sectionX)
						.attr("y", sectionY)
						.attr("width", sectionWidth)
						.attr("height", sectionHeight)
						.appendTo($svg);
					});

					updateMasks();
				}
				setMasks();

				function updateMasks() {
					$(".content.has-global-menu .dark-section:not(.display-none), .content.has-fixed-sidemenu .dark-section:not(.display-none)").each(function (i) {
						var sectionY = $(this).position().top + parseInt($(this).css('marginTop')) - $(window).scrollTop() - $('.js-sidenav')[0].getBoundingClientRect().top + $('.content.has-global-menu, .content.has-fixed-sidemenu').offset().top;
						$(".js-sidenav #mask rect:eq(" + i + ")").attr("y", sectionY);
					});

					// Fix for Safari
					$(".clone").css({ "clip-path": "none" });
					$(".clone").css({ "clip-path": "url(#mask)" });
				}

				function SVG(tag) {
					return document.createElementNS("http://www.w3.org/2000/svg", tag);
				}

				window.addEventListener("scroll", function () {
					//updateMasks();
					// Forcing setMasks to prevent possible redraw issue.
					setMasks();
				});

				$(window).on("resize", function () {
					setMasks();
				});

				// Check for class updates and copy to clone.
				var $sidenav = $(".js-sidenav > ul li");
				var $sidenavclone = $(".js-sidenav > ul.clone li");
				var observer = new MutationObserver(function (mutations) {
					mutations.forEach(function (mutation, index) {
						if (mutation.attributeName === "class") {
							if ($(mutation.target).parent().hasClass('clone')) {
								var trgt = '';
							} else {
								var trgt = '.clone ';
							}

							var attributeValue = $(mutation.target).prop(mutation.attributeName);
							var index = $(mutation.target).index();

							if($(mutation.target).attr('id'), $(mutation.target).hasClass('sub-menu-collapsed')) {
								$(mutation.target).closest(".js-sidenav").find(trgt + ">li:eq(" + index + ")").find('.sub-menu').slideUp();
							} else {
								$(mutation.target).closest(".js-sidenav").find(trgt + ">li:eq(" + index + ")").find('.sub-menu').slideDown();
							}
							
							$(mutation.target)
								.closest(".js-sidenav")
								.find(trgt + ">li:eq(" + index + ")")
								.attr('class', $(mutation.target).attr('class'));

							if ($(mutation.target).hasClass("is-open")) {
								$(mutation.target)
								.closest(".js-sidenav")
								.find(trgt + ">li:eq(" + index + ")")
								.addClass("is-open");
							} else {
								$(mutation.target)
								.closest(".js-sidenav")
								.find(trgt + ">li:eq(" + index + ")")
								.removeClass("is-open");
							}
							updateMasks();
						}
					});
				});
				//observer.observe($sidenav[0], {
				observer.observe($(".js-sidenav > ul:not(.clone)")[0], {
					attributes: true,
					childList: true,
					subtree: true,
				});
				/* observer.observe($sidenavclone[0], {
					attributes: true
				}); */
				/* END Sidenav coloring */


				/* // create threshold array starting with 0
				var thresholdArray = [0];
				// add 100 even increments
				for (var i = 1; i < 101; i++) {
					thresholdArray.push(+((i/100).toFixed(2)));
				}

				// for observing area that will result in low contrast for the active links
				var darkSectionObserver = new window.IntersectionObserver(function(entries) {
					var makeWhite = entries.some(function(entry) {
						return entry.isIntersecting && isIntersecting(entry.target, menuElement)
					});
					var jumplinks = menuElement.children;
					if ( makeWhite ) {
						menuElement.classList.add('jump-dark-bg');
						$(menuElement).parents('.section-menu').addClass('jump-show-dark-icon');
					} else { // if not
						menuElement.classList.remove('jump-dark-bg');
						$(menuElement).parents('.section-menu').removeClass('jump-show-dark-icon');
					}
					for (var i = 0; i < entries.length; i++) {
						for (var j = 0; j < jumplinks.length; j++) {
							if ( entries[i].isIntersecting && isIntersecting(entries[i].target, jumplinks[j].querySelector('a')) ) {
								jumplinks[j].classList.add('jump-el-dark-bg');
							} else {
								jumplinks[j].classList.remove('jump-el-dark-bg');
							}

							// Submenu items
							var sublinks = jumplinks[j].querySelectorAll('.menu-item');
							for (var k = 0; k < sublinks.length; k++) {
								if ( entries[i].isIntersecting && isIntersecting(entries[i].target, sublinks[k]) ) {
									sublinks[k].classList.add('jump-el-dark-bg');
								} else {
									sublinks[k].classList.remove('jump-el-dark-bg');
								}
							}
						}

					}
				}, {
					threshold: [].concat(thresholdArray)
				});

				// observe all dark sections
				var darkSections = document.querySelectorAll('.dark-section');
				darkSections.forEach(function(s) {
					darkSectionObserver.observe(s);
				}); */

				setTimeout(function(){
					$('.section-menu').addClass('section-menu-fade-in');
				}, 500);

			}

		});

		// // Custom handling of ex-machina
		// document.addEventListener('DOMContentLoaded', function() {

		// 	// look for the jump links
		// 	var linkQuery = '#menu-ex-machina > li > a';
		// 	var links = document.querySelectorAll(linkQuery);
		// 	var menuElement = document.querySelectorAll('#menu-ex-machina')[0];

		// 	// if there are any...
		// 	if (links.length > 0) {

		// 		// create threshold array starting with 0
		// 		var thresholdArray = [0];
		// 		// add 100 even increments
		// 		for (var i = 1; i < 101; i++) {
		// 			thresholdArray.push(+((i/100).toFixed(2)));
		// 		}

		// 		// for observing area that will result in low contrast for the active links
		// 		var darkSectionObserver = new window.IntersectionObserver(function(entries) {
		// 			var makeWhite = entries.some(function(entry) {
		// 				return entry.isIntersecting && isIntersecting(entry.target, menuElement)
		// 			});
		// 			var jumplinks = menuElement.children;
		// 			if ( makeWhite ) {
		// 				menuElement.classList.add('jump-dark-bg');
		// 				$(menuElement).parents('.section-menu').addClass('jump-show-dark-icon');
		// 			} else { // if not
		// 				menuElement.classList.remove('jump-dark-bg');
		// 				$(menuElement).parents('.section-menu').removeClass('jump-show-dark-icon');
		// 			}
		// 			for (var i = 0; i < entries.length; i++) {
		// 				for (var j = 0; j < jumplinks.length; j++) {
		// 					if ( entries[i].isIntersecting && isIntersecting(entries[i].target, jumplinks[j]) ) {
		// 						jumplinks[j].classList.add('jump-el-dark-bg');
		// 					} else {
		// 						jumplinks[j].classList.remove('jump-el-dark-bg');
		// 					}
		// 				}

		// 			}
		// 		}, {
		// 			threshold: [].concat(thresholdArray)
		// 		});

		// 		// observe all dark sections
		// 		var darkSections = document.querySelectorAll('.dark-section');
		// 		darkSections.forEach(function(s) {
		// 			darkSectionObserver.observe(s);
		// 		});

		// 		setTimeout(function(){
		// 			$('.section-menu').addClass('section-menu-fade-in');
		// 		}, 500);

		// 	}

		// });


		// // Custom handling of enterprise AI manufactoring
		// document.addEventListener('DOMContentLoaded', function() {

		// 	// look for the jump links
		// 	var linkQuery = '#menu-enterprise-ai-for-manufactoring > li > a';
		// 	var links = document.querySelectorAll(linkQuery);
		// 	var menuElement = document.querySelectorAll('#menu-enterprise-ai-for-manufactoring')[0];

		// 	// if there are any...
		// 	if (links.length > 0) {

		// 		// create threshold array starting with 0
		// 		var thresholdArray = [0];
		// 		// add 100 even increments
		// 		for (var i = 1; i < 101; i++) {
		// 			thresholdArray.push(+((i/100).toFixed(2)));
		// 		}

		// 		// for observing area that will result in low contrast for the active links
		// 		var darkSectionObserver = new window.IntersectionObserver(function(entries) {
		// 			var makeWhite = entries.some(function(entry) {
		// 				return entry.isIntersecting && isIntersecting(entry.target, menuElement)
		// 			});
		// 			var jumplinks = menuElement.children;
		// 			if ( makeWhite ) {
		// 				menuElement.classList.add('jump-dark-bg');
		// 				$(menuElement).parents('.section-menu').addClass('jump-show-dark-icon');
		// 			} else { // if not
		// 				menuElement.classList.remove('jump-dark-bg');
		// 				$(menuElement).parents('.section-menu').removeClass('jump-show-dark-icon');
		// 			}
		// 			for (var i = 0; i < entries.length; i++) {
		// 				for (var j = 0; j < jumplinks.length; j++) {
		// 					if ( entries[i].isIntersecting && isIntersecting(entries[i].target, jumplinks[j]) ) {
		// 						jumplinks[j].classList.add('jump-el-dark-bg');
		// 					} else {
		// 						jumplinks[j].classList.remove('jump-el-dark-bg');
		// 					}
		// 				}
		// 			}
		// 			// Handle Icon
		// 		}, {
		// 			threshold: [].concat(thresholdArray)
		// 		});

		// 		// observe all dark sections
		// 		var darkSections = document.querySelectorAll('.dark-section');
		// 		darkSections.forEach(function(s) {
		// 			darkSectionObserver.observe(s);
		// 		});

		// 		setTimeout(function(){
		// 			$('.section-menu').addClass('section-menu-fade-in');
		// 		}, 500);

		// 	}

		// });


		// // Custom handling of enterprise AI manufactoring
		// document.addEventListener('DOMContentLoaded', function() {

		// 	// look for the jump links
		// 	var linkQuery = '#menu-enterprise-ai-for-manufacturing-product > li > a';
		// 	var links = document.querySelectorAll(linkQuery);
		// 	var menuElement = document.querySelectorAll('#menu-enterprise-ai-for-manufacturing-product')[0];

		// 	// if there are any...
		// 	if (links.length > 0) {

		// 		// create threshold array starting with 0
		// 		var thresholdArray = [0];
		// 		// add 100 even increments
		// 		for (var i = 1; i < 101; i++) {
		// 			thresholdArray.push(+((i/100).toFixed(2)));
		// 		}

		// 		// for observing area that will result in low contrast for the active links
		// 		var darkSectionObserver = new window.IntersectionObserver(function(entries) {
		// 			var makeWhite = entries.some(function(entry) {
		// 				return entry.isIntersecting && isIntersecting(entry.target, menuElement)
		// 			});
		// 			var jumplinks = menuElement.children;
		// 			if ( makeWhite ) {
		// 				menuElement.classList.add('jump-dark-bg');
		// 				$(menuElement).parents('.section-menu').addClass('jump-show-dark-icon');
		// 			} else { // if not
		// 				menuElement.classList.remove('jump-dark-bg');
		// 				$(menuElement).parents('.section-menu').removeClass('jump-show-dark-icon');
		// 			}
		// 			for (var i = 0; i < entries.length; i++) {
		// 				for (var j = 0; j < jumplinks.length; j++) {
		// 					if ( entries[i].isIntersecting && isIntersecting(entries[i].target, jumplinks[j]) ) {
		// 						jumplinks[j].classList.add('jump-el-dark-bg');
		// 					} else {
		// 						jumplinks[j].classList.remove('jump-el-dark-bg');
		// 					}
		// 				}

		// 			}
		// 		}, {
		// 			threshold: [].concat(thresholdArray)
		// 		});

		// 		// observe all dark sections
		// 		var darkSections = document.querySelectorAll('.dark-section');
		// 		darkSections.forEach(function(s) {
		// 			darkSectionObserver.observe(s);
		// 		});

		// 		setTimeout(function(){
		// 			$('.section-menu').addClass('section-menu-fade-in');
		// 		}, 500);

		// 	}

		// });


		// // Custom handling of readiness
		// document.addEventListener('DOMContentLoaded', function() {

		// 	// look for the jump links
		// 	var linkQuery = '#menu-c3ai-readiness > li > a';
		// 	var links = document.querySelectorAll(linkQuery);
		// 	var menuElement = document.querySelectorAll('#menu-c3ai-readiness')[0];

		// 	// if there are any...
		// 	if (links.length > 0) {

		// 		// create threshold array starting with 0
		// 		var thresholdArray = [0];
		// 		// add 100 even increments
		// 		for (var i = 1; i < 101; i++) {
		// 			thresholdArray.push(+((i/100).toFixed(2)));
		// 		}

		// 		// for observing area that will result in low contrast for the active links
		// 		var darkSectionObserver = new window.IntersectionObserver(function(entries) {
		// 			var makeWhite = entries.some(function(entry) {
		// 				return entry.isIntersecting && isIntersecting(entry.target, menuElement)
		// 			});
		// 			var jumplinks = menuElement.children;
		// 			if ( makeWhite ) {
		// 				menuElement.classList.add('jump-dark-bg');
		// 				$(menuElement).parents('.section-menu').addClass('jump-show-dark-icon');
		// 			} else { // if not
		// 				menuElement.classList.remove('jump-dark-bg');
		// 				$(menuElement).parents('.section-menu').removeClass('jump-show-dark-icon');
		// 			}
		// 			for (var i = 0; i < entries.length; i++) {
		// 				for (var j = 0; j < jumplinks.length; j++) {
		// 					if ( entries[i].isIntersecting && isIntersecting(entries[i].target, jumplinks[j]) ) {
		// 						jumplinks[j].classList.add('jump-el-dark-bg');
		// 					} else {
		// 						jumplinks[j].classList.remove('jump-el-dark-bg');
		// 					}
		// 				}

		// 			}
		// 		}, {
		// 			threshold: [].concat(thresholdArray)
		// 		});

		// 		// observe all dark sections
		// 		var darkSections = document.querySelectorAll('.dark-section');
		// 		darkSections.forEach(function(s) {
		// 			darkSectionObserver.observe(s);
		// 		});


		// 		setTimeout(function(){
		// 			$('.section-menu').addClass('section-menu-fade-in');
		// 		}, 500);
		// 	}

		// });


		// // Custom handling of new C3 AI Suite
		// document.addEventListener('DOMContentLoaded', function() {

		// 	// look for the jump links
		// 	var linkQuery = '#menu-c3-ai-suite > li > a';
		// 	var links = document.querySelectorAll(linkQuery);
		// 	var menuElement = document.querySelectorAll('#menu-c3-ai-suite')[0];

		// 	// if there are any...
		// 	if (links.length > 0) {

		// 		// create threshold array starting with 0
		// 		var thresholdArray = [0];
		// 		// add 100 even increments
		// 		for (var i = 1; i < 101; i++) {
		// 			thresholdArray.push(+((i/100).toFixed(2)));
		// 		}

		// 		// for observing area that will result in low contrast for the active links
		// 		var darkSectionObserver = new window.IntersectionObserver(function(entries) {
		// 			var makeWhite = entries.some(function(entry) {
		// 				return entry.isIntersecting && isIntersecting(entry.target, menuElement)
		// 			});
		// 			var jumplinks = menuElement.children;
		// 			if ( makeWhite ) {
		// 				menuElement.classList.add('jump-dark-bg');
		// 			} else { // if not
		// 				menuElement.classList.remove('jump-dark-bg');
		// 			}
		// 			for (var i = 0; i < entries.length; i++) {
		// 				for (var j = 0; j < jumplinks.length; j++) {
		// 					if ( entries[i].isIntersecting && isIntersecting(entries[i].target, jumplinks[j]) ) {
		// 						jumplinks[j].classList.add('jump-el-dark-bg');
		// 					} else {
		// 						jumplinks[j].classList.remove('jump-el-dark-bg');
		// 					}
		// 				}

		// 			}
		// 		}, {
		// 			threshold: [].concat(thresholdArray)
		// 		});

		// 		// observe all dark sections
		// 		var darkSections = document.querySelectorAll('.dark-section');
		// 		darkSections.forEach(function(s) {
		// 			darkSectionObserver.observe(s);
		// 		});


		// 		setTimeout(function(){
		// 			$('.section-menu').addClass('section-menu-fade-in');
		// 		}, 500);
		// 	}

		// });




		// // Custom handling of new Inventory Optimization Menu
		// document.addEventListener('DOMContentLoaded', function() {

		// 	// look for the jump links
		// 	var linkQuery = '#menu-c3-ai-inventory-optimization > li > a';
		// 	var links = document.querySelectorAll(linkQuery);
		// 	var menuElement = document.querySelectorAll('#menu-c3-ai-inventory-optimization')[0];

		// 	// if there are any...
		// 	if (links.length > 0) {

		// 		// create threshold array starting with 0
		// 		var thresholdArray = [0];
		// 		// add 100 even increments
		// 		for (var i = 1; i < 101; i++) {
		// 			thresholdArray.push(+((i/100).toFixed(2)));
		// 		}

		// 		// for observing area that will result in low contrast for the active links
		// 		var darkSectionObserver = new window.IntersectionObserver(function(entries) {
		// 			var makeWhite = entries.some(function(entry) {
		// 				return entry.isIntersecting && isIntersecting(entry.target, menuElement)
		// 			});
		// 			var jumplinks = menuElement.children;
		// 			if ( makeWhite ) {
		// 				menuElement.classList.add('jump-dark-bg');
		// 			} else { // if not
		// 				menuElement.classList.remove('jump-dark-bg');
		// 			}
		// 			for (var i = 0; i < entries.length; i++) {
		// 				for (var j = 0; j < jumplinks.length; j++) {
		// 					if ( entries[i].isIntersecting && isIntersecting(entries[i].target, jumplinks[j]) ) {
		// 						jumplinks[j].classList.add('jump-el-dark-bg');
		// 					} else {
		// 						jumplinks[j].classList.remove('jump-el-dark-bg');
		// 					}
		// 				}

		// 			}
		// 		}, {
		// 			threshold: [].concat(thresholdArray)
		// 		});

		// 		// observe all dark sections
		// 		var darkSections = document.querySelectorAll('.dark-section');
		// 		darkSections.forEach(function(s) {
		// 			darkSectionObserver.observe(s);
		// 		});


		// 		setTimeout(function(){
		// 			$('.section-menu').addClass('section-menu-fade-in');
		// 		}, 500);
		// 	}

		// });





		// // Custom handling of covid data lake
		// document.addEventListener('DOMContentLoaded', function() {

		// 	// look for the jump links
		// 	var linkQuery = '#menu-covid-data-lake > li > a';
		// 	var links = document.querySelectorAll(linkQuery);
		// 	var menuElement = document.querySelectorAll('#menu-covid-data-lake')[0];

		// 	// if there are any...
		// 	if (links.length > 0) {

		// 		// create threshold array starting with 0
		// 		var thresholdArray = [0];
		// 		// add 100 even increments
		// 		for (var i = 1; i < 101; i++) {
		// 			thresholdArray.push(+((i/100).toFixed(2)));
		// 		}

		// 		// for observing area that will result in low contrast for the active links
		// 		var darkSectionObserver = new window.IntersectionObserver(function(entries) {
		// 			var makeWhite = entries.some(function(entry) {
		// 				return entry.isIntersecting && isIntersecting(entry.target, menuElement)
		// 			});
		// 			var jumplinks = menuElement.children;
		// 			if ( makeWhite ) {
		// 				menuElement.classList.add('jump-dark-bg');
		// 			} else { // if not
		// 				menuElement.classList.remove('jump-dark-bg');
		// 			}
		// 			for (var i = 0; i < entries.length; i++) {
		// 				for (var j = 0; j < jumplinks.length; j++) {
		// 					if ( entries[i].isIntersecting && isIntersecting(entries[i].target, jumplinks[j]) ) {
		// 						jumplinks[j].classList.add('jump-el-dark-bg');
		// 					} else {
		// 						jumplinks[j].classList.remove('jump-el-dark-bg');
		// 					}
		// 				}

		// 			}
		// 		}, {
		// 			threshold: [].concat(thresholdArray)
		// 		});

		// 		// observe all dark sections
		// 		var darkSections = document.querySelectorAll('.dark-section');
		// 		darkSections.forEach(function(s) {
		// 			darkSectionObserver.observe(s);
		// 		});


		// 		setTimeout(function(){
		// 			$('.section-menu').addClass('section-menu-fade-in');
		// 		}, 500);
		// 	}

		// });

		// // Custom handling of covid data lake
		// document.addEventListener('DOMContentLoaded', function() {

		// 	// look for the jump links
		// 	var linkQuery = '#menu-enterprise-ai > li > a';
		// 	var links = document.querySelectorAll(linkQuery);
		// 	var menuElement = document.querySelectorAll('#menu-enterprise-ai')[0];

		// 	// if there are any...
		// 	if (links.length > 0) {

		// 		// create threshold array starting with 0
		// 		var thresholdArray = [0];
		// 		// add 100 even increments
		// 		for (var i = 1; i < 101; i++) {
		// 			thresholdArray.push(+((i/100).toFixed(2)));
		// 		}

		// 		// for observing area that will result in low contrast for the active links
		// 		var darkSectionObserver = new window.IntersectionObserver(function(entries) {
		// 			var makeWhite = entries.some(function(entry) {
		// 				return entry.isIntersecting && isIntersecting(entry.target, menuElement)
		// 			});
		// 			var jumplinks = menuElement.children;
		// 			if ( makeWhite ) {
		// 				menuElement.classList.add('jump-dark-bg');
		// 			} else { // if not
		// 				menuElement.classList.remove('jump-dark-bg');
		// 			}
		// 			for (var i = 0; i < entries.length; i++) {
		// 				for (var j = 0; j < jumplinks.length; j++) {
		// 					if ( entries[i].isIntersecting && isIntersecting(entries[i].target, jumplinks[j]) ) {
		// 						jumplinks[j].classList.add('jump-el-dark-bg');
		// 					} else {
		// 						jumplinks[j].classList.remove('jump-el-dark-bg');
		// 					}
		// 				}

		// 			}
		// 		}, {
		// 			threshold: [].concat(thresholdArray)
		// 		});

		// 		// observe all dark sections
		// 		var darkSections = document.querySelectorAll('.dark-section');
		// 		darkSections.forEach(function(s) {
		// 			darkSectionObserver.observe(s);
		// 		});


		// 		setTimeout(function(){
		// 			$('.section-menu').addClass('section-menu-fade-in');
		// 		}, 500);
		// 	}

		// });


		// Overwrite scrolling on sidebarnav
		$('ul.fixed-menu li a, ul.jumplinks-menu li a').click( function(e){
			var href = $(this).attr('href');
			if ( '#' == href.substr( 0, 1 ) ){
				var targetDiv = $(href);
				if ( targetDiv.find('.section-title').length > 0 ) {
					e.preventDefault();
					$('html, body').animate({scrollTop: targetDiv.find('.section-title').offset().top - c3Localized.jumplinksOffset }, 'slow');
					return false;
				} else if ( targetDiv.find('.section_title').length > 0 ) {
				e.preventDefault();
					$('html, body').animate({scrollTop: targetDiv.find('.section_title').offset().top - c3Localized.jumplinksOffset }, 'slow');
					return false;
				} else if ( targetDiv.find('.c3_title').length > 0 ) {
					e.preventDefault();
					$('html, body').animate({scrollTop: targetDiv.find('.c3_title').offset().top - c3Localized.jumplinksOffset }, 'slow');
					return false;
				}
			}
		});

		// Custom Enterprise AI Accordion
		$('.section-menu ul#menu-enterprise-ai .menu-item-has-children > a').click( function(e){
			e.preventDefault();
			$(this).next('.sub-menu').slideToggle();
			$(this).parent('li').toggleClass('sub-menu-collapsed');
			return false;
		});

		$('.section-menu ul#menu-enterprise-ai .menu-item-has-children').each(function(){
			if ( ! $(this).hasClass('current-menu-item') && ! $(this).hasClass('current-menu-parent') ){
				$(this).addClass('sub-menu-collapsed');
			}
		});

		// Custom #menu-what-is-generative-ai Accordion
		$('.section-menu ul#menu-what-is-generative-ai .menu-item-has-children > a').click( function(e){
			e.preventDefault();
			$(this).next('.sub-menu').slideToggle();
			$(this).parent('li').toggleClass('sub-menu-collapsed');
			return false;
		});

		$('.section-menu ul#menu-what-is-generative-ai .menu-item-has-children').each(function(){
			if ( ! $(this).hasClass('current-menu-item') && ! $(this).hasClass('current-menu-parent') ){
				$(this).addClass('sub-menu-collapsed');
			}
		});

		// Custom Machine Learning Accordion
		$('.section-menu ul#menu-machine-learning .menu-item-has-children > a').click( function(e){
			e.preventDefault();
			$(this).next('.sub-menu').slideToggle();
			$(this).parent('li').toggleClass('sub-menu-collapsed');
			return false;
		});

		$('.section-menu ul#menu-machine-learning .menu-item-has-children').each(function(){
			if ( ! $(this).hasClass('current-menu-item') && ! $(this).hasClass('current-menu-parent') ){
				$(this).addClass('sub-menu-collapsed');
			}
		});

		// Smooth scroll to custom link anchor
		$('.section-menu').on('click', '.sub-menu .menu-item-type-custom a', function(e) {
			var href = $(this).attr('href');
			var noHash = href.split('#')[0];
			var hash = href.split('#')[1];

			if(window.location.href.indexOf(noHash) > -1) {
				e.preventDefault();

				if(hash) {
					var element = document.getElementById(hash);
					element.scrollIntoView({behavior: "smooth"});
				}
			}
		});


		// Custom AI Suite Accordion
		$('.section-menu ul#menu-c3-ai-suite .menu-item-has-children > a').click( function(e){
			e.preventDefault();
			$(this).next('.sub-menu').slideToggle();
			$(this).parent('li').toggleClass('sub-menu-collapsed');
			return false;
		});

		$('.section-menu ul#menu-c3-ai-suite .menu-item-has-children').each(function(){
			if ( ! $(this).hasClass('current-menu-item') && ! $(this).hasClass('current-menu-parent') ){
				$(this).addClass('sub-menu-collapsed');
			}
		});

		// Custom Glossary Accordion
		$('.section-menu ul#menu-glossary .menu-item-has-children > a').click( function(e){
			e.preventDefault();

			$(this).parent('li').siblings().find('.sub-menu').slideUp();
			$(this).parent('li').siblings().addClass('sub-menu-collapsed');

			$(this).next('.sub-menu').slideToggle();
			$(this).parent('li').toggleClass('sub-menu-collapsed');


			return false;
		});

		$('.section-menu ul#menu-glossary .menu-item-has-children').each(function(){
			if ( ! $(this).hasClass('current-menu-item') && ! $(this).hasClass('current-menu-parent') ){
				$(this).addClass('sub-menu-collapsed');
			}
		});

		// Custom Accordion
		$('.has-custom-accordion').on('click', '.section-menu > div > ul .menu-item-has-children > a', function(e){
			e.preventDefault();

			$(this).parent('li').siblings().find('.sub-menu').slideUp();
			$(this).parent('li').siblings().addClass('sub-menu-collapsed');

			$(this).next('.sub-menu').slideToggle();
			$(this).parent('li').toggleClass('sub-menu-collapsed');


			return false;
		});

		$('.has-custom-accordion .section-menu > div > ul .menu-item-has-children').each(function(){
			if ( ! $(this).hasClass('current-menu-item') && ! $(this).hasClass('current-menu-parent') ){
				$(this).addClass('sub-menu-collapsed');
			}
		});

		/**
		 * @param {HTMLElement} link
		 * @description sets the styles for an "active" link
		 */
		function setJumpLinkActiveStyles(link) {
			if (!link) return;
			link.closest('li').classList.add('current-menu-item');
		}

		/**
		 * @param {HTMLElement} link
		 * @description sets the styles for an "inactive" link
		 */
		function setJumpLinkInactiveStyles(link) {
			if (!link) return;
			link.closest('li').classList.remove('current-menu-item');
		}

		/**
		 * @param {HTMLElement} target the target area to check the elem against
		 * @param {HTMLElement} elem
		 * @returns {boolean} true if the DOMRects intersect
		 */
		function isIntersecting(target, elem) {
			var r1 = target.getBoundingClientRect();
			var r2 = elem.getBoundingClientRect();
			var dx = Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left);
			var dy = Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top);
			return dx * dy > 0;
		}
	}
	c3_set_up_link_watchers();



	/**
	 * Set up observer to pause/play videos as they come into view
	 * Required attribute [data-video-auto-pause] on .video-container
	 */
	document.addEventListener('DOMContentLoaded', function() {
		var videos = document.querySelectorAll('.video-container[data-video-auto-pause]');

		var videoObserver = new IntersectionObserver(function(entries) {
			entries.forEach(function(entry) {
			var video = entry.target.querySelector('video');

			if ( ! video ) return;

			// Play or pause depending on if video is in view
			if ( entry.intersectionRatio === 0 ) {
				video.pause();
				video.currentTime = 0;
			} else {
				video.play();
			}
			});
		});

		videos.forEach(function(video) {
			videoObserver.observe(video);
		});
	});

	$(document).ready(function($){

		/* // Check if first section is .dark-section
		var firstSection = $('.menu-position-wrapper').next();
		if ( firstSection.hasClass('dark-section') ) {
			$('.fixed-menu').addClass( 'jump-dark-bg' );
			$('.sidenav-init-global-menu').addClass( 'jump-dark-bg' );
			// $('#menu-ex-machina').addClass( 'jump-dark-bg' );
			// $('#menu-c3ai-readiness').addClass( 'jump-dark-bg' );
			// $('#menu-covid-data-lake').addClass( 'jump-dark-bg' );
			// $('#menu-enterprise-ai').addClass( 'jump-dark-bg' );
			// $('#menu-c3-ai-suite').addClass( 'jump-dark-bg' );
			// $('#menu-c3-ai-inventory-optimization').addClass( 'jump-dark-bg' );
			window.setTimeout( function(){
				$('.fixed-menu li').addClass( 'jump-el-dark-bg' );
				$('.sidenav-init-global-menu li').addClass( 'jump-el-dark-bg' );
				// $('#menu-ex-machina li').addClass( 'jump-el-dark-bg' );
				// $('#menu-c3ai-readiness li').addClass( 'jump-el-dark-bg' );
				// $('#menu-covid-data-lake li').addClass( 'jump-el-dark-bg' );
				// $('#menu-enterprise-ai li').addClass( 'jump-el-dark-bg' );
				// $('#menu-c3-ai-suite li').addClass( 'jump-el-dark-bg' );
				// $('#menu-c3-ai-inventory-optimization').addClass( 'jump-el-dark-bg' );
			}, 700);
		} */

		// Accordion Module
		if ( $('[data-accordion]').length > 0 ) {
			$('[data-accordion] [data-accordion-item]').each( function(){
				var accordion = $(this);
				accordion.find('.accordion-title').click(function(){
					accordion.find('[data-tab-content]').slideToggle();
					$(this).toggleClass('collapsed');
				});
			});
		}

		if ( $('.three-image-featured').length > 0 ) {
			$('.three-image-featured').each( function(){
				var $el = $(this);
				var featured = $el.find('.three-image-feature-featured .three-image-feature--image-wrapper');
				$el.find('li').click(function(){
					$el.find('li').removeClass('active');
					var newImg = $(this).find('img').clone();
					featured.html( newImg ).scrollTop(0);
					$(this).addClass('active');
				});
			});

		}

		if( jQuery().isotope && $('.isotope-grid').length > 0 ) {
			var $grid = $('.isotope-grid').isotope({
					itemSelector: '.cell',
					layoutMode: 'fitRows',
					stagger: 30,
			});

			function matchHeight() {
				$('.isotope-grid .cell:visible').matchHeight({
					byRow: true,
					property: 'height',
					target: null,
					remove: false
				});
			}

			function delayCall() {
				setTimeout(matchHeight, 300);
			}

			// Update the URL with the filter values to get a shareable link
			function updateIsotopeURL(paramName, paramValue) {
				let baseUrl = window.location.origin + window.location.pathname;
				let hashPart = window.location.hash;
				let searchParams = new URLSearchParams(window.location.search);
			  
				if (paramValue === "*" || paramValue === "") {
					searchParams.delete(paramName);
				} else {
					// Remove the .class dot
					if (paramValue !== null && paramValue.length > 0) {
						paramValue = paramValue.substring(1);
				  	}

					searchParams.set(paramName, paramValue);
				}
			  
				if (searchParams.toString() !== "") {
					baseUrl += '?';
				}

				let updatedURL = baseUrl + searchParams.toString() + hashPart;
				window.history.pushState({ path: updatedURL }, '', updatedURL);
			}

			$grid.on( 'layoutComplete', delayCall);

			$grid.imagesLoaded().always( function() {
				$grid.isotope('layout');
			});

			/* Move "Cross-Industry Applications" to second place. */
			var $li = $('a[data-filter=".cross-industry-applications"]').parent();
			$li.prev().insertAfter($li);

			// bind filter button click
			$('.isotope-filter-buttons').on( 'click', 'a', function() {
				var $dropdown = $(this).closest('dl.dropdown');
				$dropdown.find('.is-checked').removeClass('is-checked');
				$(this).addClass('is-checked');
				
				var filterValue = '';

				if($dropdown.length > 1) {
					$dropdown.each(function() {
						if($(this).find('.is-checked').attr('data-filter')) {
							filterValue += $(this).find('.is-checked').attr('data-filter');
						}
					});
				} else {
					filterValue = $( this ).attr('data-filter');

					// Update the URL if the class exists and if we are only getting one value per dropdown
					let ifilter = $(this).closest('.isotope-filter-buttons');
					if (ifilter.hasClass('isotope-update-url')) {
						updateIsotopeURL(ifilter.data('urlParam'), filterValue);
					}
				}

				$(this).closest('.grid-container').find('.isotope-grid').isotope({ filter: filterValue });
			});

			// change is-checked class on buttons
			$('.isotope-filter-buttons').each( function( i, buttonGroup ) {
				var $buttonGroup = $( buttonGroup );
				$buttonGroup.on( 'click', 'a', function() {
					$buttonGroup.find('.is-checked').removeClass('is-checked');
					$( this ).addClass('is-checked');
				});
			});

			// Maybe trigger click to load filters passed in URL?
			$('.isotope-update-url li.current a').each(function(){
				if ($(this).data('filter') != "*") {
					$(this).trigger('click');

					return;
				}
			});
		}

	});


	/**
	 * Append videos to all video containers with appropriate settings
	 */
	function c3_append_videos_to_video_containers(EmbeddedVideo) {
		document.addEventListener('DOMContentLoaded', function() {
			var videoContainers = document.querySelectorAll('.video-container[data-video-source]');

			videoContainers.forEach(function(videoContainer) {
				var options = {
					src: videoContainer.getAttribute('data-video-source'),
					poster: videoContainer.getAttribute('data-video-poster'),
					loop: getBooleanValue(videoContainer.getAttribute('data-video-loop'), false),
					controls: getBooleanValue(videoContainer.getAttribute('data-video-controls'), true),
					autoplay: getBooleanValue(videoContainer.getAttribute('data-video-autoplay'), false),
					muted: getBooleanValue(videoContainer.getAttribute('data-video-muted'), false),
					immediateLoad: getBooleanValue(videoContainer.getAttribute('data-video-immediate'), true),
					playsinline: getBooleanValue(videoContainer.getAttribute('data-video-playsinline'), true)
				};

				// If video is an embedded video, override some options
				if ( videoContainer.getAttribute('data-video-embedded') !== null ) {
					options.controls = false;
					options.autoplay = true;
					options.muted = true;
					options.playsinline = true;
				}

				if ( ! options.src ) {
					console.error('Video source not set on video container. Expected data-video-source attribute.', videoContainer);
				}

				var embeddedVideo = new EmbeddedVideo(options);
				videoContainer.appendChild(embeddedVideo.video);
				embeddedVideo.video.setAttribute('playsinline', '');
				if ( videoContainer.getAttribute('data-video-muted') === true || videoContainer.getAttribute('data-video-muted') === '' ) {
					embeddedVideo.video.setAttribute('muted', '');
				}
			});

		});

		/**
		 * Return boolean based on provided string. If null or undefined,
		 * return default value.
		 *
		 * @param {String | null} attribute
		 * @param {Boolean} defaultValue
		 */
		function getBooleanValue(string, defaultValue) {
			switch ( string ) {
				case 'false':
				return false;
				case '':
				return true;
				default:
				return defaultValue;
			}
		}
	}
	if ( $('.video-container[data-video-source]').length > 0 ){
		c3_append_videos_to_video_containers(window.c3.EmbeddedVideo);
	}




	/**
	 * Add observer to manage some reveal animations
	 * Simply add the attribute "data-reveal-animation" and
	 * set it to the animation you want. Some examples include:
	 * slide-up   slide-right   expand   reveal-right
	 *
	 * Some animations may require additional elements, such as
	 * "reveal-right"
	 *
	 * Once an element is in view, it will add the class .is-visible
	 * to the element with the data-reveal-animation attribute. You
	 * can add custom animations if you want.
	 *
	 * See CSS for additional information
	 */
	function c3_add_observer_for_reveal_animations() {
		document.addEventListener('DOMContentLoaded', function() {
			var elements = document.querySelectorAll('[data-reveal-animation]');
			var elementObserver = new IntersectionObserver(function(entries) {
				entries.forEach(function(entry) {
					var hasBeenVisible = entry.target.classList.contains('is-visible');
					var isVisible = entry.isIntersecting;

					if ( isVisible && ! hasBeenVisible ) {
						entry.target.classList.add('is-visible');
					}
				});
			}, {
				rootMargin: '20px'
			});

			elements.forEach(function(element) {
				elementObserver.observe(element);

				// Custom attributes for certain animations
				if ( element.attributes['data-reveal-animation'].value === 'reveal-right') {
					if ( element.attributes['data-reveal-animation-bg-color'] ) {
						var revealBox = element.querySelector('.reveal-box');
						revealBox.style.backgroundColor = element.attributes['data-reveal-animation-bg-color'].value;
					}
				}
			});
		});
	}
	if ( $('[data-reveal-animation]').length > 0 ) {
		c3_add_observer_for_reveal_animations();
	}


	if ( $('.c3-countdown-timer').length > 0 ) {
		// Set the date we're counting down to
		var date = $('.c3-countdown-timer').data('date');
		var countDownDate = new Date(date).getTime();

		// Update the count down every 1 second
		var x = setInterval(function() {

			// Get today's date and time
			var now = new Date().getTime();

			// Find the distance between now and the count down date
			var distance = countDownDate - now;

			// Time calculations for days, hours, minutes and seconds
			var days = Math.floor(distance / (1000 * 60 * 60 * 24));
			var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
			var seconds = Math.floor((distance % (1000 * 60)) / 1000);

			// Display the result in the element with id="demo"
			$('.c3-countdown-timer .days span:first-of-type').html( days  );
			$('.c3-countdown-timer .hours span:first-of-type').html( hours );
			$('.c3-countdown-timer .minutes span:first-of-type').html( minutes );
			$('.c3-countdown-timer .seconds span:first-of-type').html( seconds );

			// If the count down is finished, write some text
			if (distance < 0) {
				clearInterval(x);
				$('.c3-countdown-timer').html( "" );
			}
		}, 1000);
	}

	/* Disbale Resources TLN Link */

	$('li#menu-item-32838 > a').click(function(e) {
		e.preventDefault();
	});

	$('#menu-item-22058 > section > div > div > div:nth-child(3) > div > div:nth-child(1) > a, #menu-item-50306 > section > div > div > div:nth-child(3) > div > div:nth-child(1) > a, .menu-item-company > section > div > div > div:nth-child(3) > div > div:nth-child(1) > a').click(function(e) {
		e.preventDefault();
		window.open('https://ir.c3.ai');
	});


	/*
		Open video modal if URI ends with '/video-'
		Original code from section-customer-testimonials.js, adapted for site-wide use
		Wrapped by function() to avoid possible var conflicts
		Author: Adam
	*/

	function open_video_modal_via_URI() {

		var hash = window.location.hash.replace('#', '');
		var slug = hash.replace(/[^\w-]+/g, ''); //Never trust user input. Source https://stackoverflow.com/questions/23356238/regex-to-match-alphanumeric-and-hyphen-only-strip-everything-else-in-javascript

		if( slug ) {
			var el = '[data-video-slug=' + slug + ']';
			if( $(el).length > 0 ) {

				var src = $(el).data('video-modal-id');
				var poster = $(el).data('video-poster');
				var videoModalContainer = document.querySelector('#c3-video--modal');
				videoModalContainer.setAttribute('data-video-source', src);
				videoModalContainer.setAttribute('data-video-poster', poster);
				$(videoModalContainer).foundation('open');

			}
		}
	}

	$(document).ready(function($){
		open_video_modal_via_URI();
	});


	/*
		Find <table> elements in post content and wrap them with a div to make them responsive in mobile.
		Author: Adam
	*/

	$('.post .entry-content table').each(function() {
		if( ! $(this).parent('div.table-responsive').length ) {

			$(this).wrap('<div class="table-responsive" />');

		}
	});


	/*
		Side-menu on Machine learning pages - go to first sub-menu page on accordion click
		Author: Adam
	*/
	/*$('ul#menu-machine-learning > li > a').on('click', function() {

		var goTo = $(this).next('ul.sub-menu').find('li:first-child > a').attr('href');

		window.location.href = goTo;

	});*/

	/* Add classes to Top Level Navigation CTA */

	$("#top-bar-menu li#menu-item-44036").addClass("button hollow");
	$("#top-bar-menu li#menu-item-44246").addClass("button hollow");
	
	// Function to read value of a cookie
	function readCookie(name) {
		var cookiename = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(cookiename) == 0) return c.substring(cookiename.length,c.length);
		}
		return null;
	}

	// Track time spent on a page
	if (c3Localized.track_time == 1) {
		TimeMe.initialize({
			currentPageName: 		"global",
			idleTimeoutInSeconds: 	15
		});
		$(window).on('unload', function() {
			let marketo_cookie = readCookie('_mkto_trk');
			let marketo_lead_id = readCookie('mkt_lead_id');		
			if (marketo_cookie !== null || marketo_lead_id !== null) {
				var params = new URLSearchParams();
				params.set('action', 		'track_time_spent');
				params.set('time_spent',	TimeMe.getTimeOnCurrentPageInSeconds());
				params.set('page_url',		window.location.href);
				params.set('marketo_id',	marketo_lead_id !== null ? marketo_lead_id : marketo_cookie);			
				
				navigator.sendBeacon(c3Localized.ajaxurl, params);
			}
		});
	}
})(jQuery);


/*Object Fit Polyfill*/
/*! npm.im/object-fit-images 3.2.4 */
var objectFitImages=function(){"use strict";function t(t,e){return"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='"+t+"' height='"+e+"'%3E%3C/svg%3E"}function e(t){if(t.srcset&&!p&&window.picturefill){var e=window.picturefill._;t[e.ns]&&t[e.ns].evaled||e.fillImg(t,{reselect:!0}),t[e.ns].curSrc||(t[e.ns].supported=!1,e.fillImg(t,{reselect:!0})),t.currentSrc=t[e.ns].curSrc||t.src}}function i(t){for(var e,i=getComputedStyle(t).fontFamily,r={};null!==(e=u.exec(i));)r[e[1]]=e[2];return r}function r(e,i,r){var n=t(i||1,r||0);b.call(e,"src")!==n&&h.call(e,"src",n)}function n(t,e){t.naturalWidth?e(t):setTimeout(n,100,t,e)}function c(t){var c=i(t),o=t[l];if(c["object-fit"]=c["object-fit"]||"fill",!o.img){if("fill"===c["object-fit"])return;if(!o.skipTest&&f&&!c["object-position"])return}if(!o.img){o.img=new Image(t.width,t.height),o.img.srcset=b.call(t,"data-ofi-srcset")||t.srcset,o.img.src=b.call(t,"data-ofi-src")||t.src,h.call(t,"data-ofi-src",t.src),t.srcset&&h.call(t,"data-ofi-srcset",t.srcset),r(t,t.naturalWidth||t.width,t.naturalHeight||t.height),t.srcset&&(t.srcset="");try{s(t)}catch(t){window.console&&console.warn("https://bit.ly/ofi-old-browser")}}e(o.img),t.style.backgroundImage='url("'+(o.img.currentSrc||o.img.src).replace(/"/g,'\\"')+'")',t.style.backgroundPosition=c["object-position"]||"center",t.style.backgroundRepeat="no-repeat",t.style.backgroundOrigin="content-box",/scale-down/.test(c["object-fit"])?n(o.img,function(){o.img.naturalWidth>t.width||o.img.naturalHeight>t.height?t.style.backgroundSize="contain":t.style.backgroundSize="auto"}):t.style.backgroundSize=c["object-fit"].replace("none","auto").replace("fill","100% 100%"),n(o.img,function(e){r(t,e.naturalWidth,e.naturalHeight)})}function s(t){var e={get:function(e){return t[l].img[e?e:"src"]},set:function(e,i){return t[l].img[i?i:"src"]=e,h.call(t,"data-ofi-"+i,e),c(t),e}};Object.defineProperty(t,"src",e),Object.defineProperty(t,"currentSrc",{get:function(){return e.get("currentSrc")}}),Object.defineProperty(t,"srcset",{get:function(){return e.get("srcset")},set:function(t){return e.set(t,"srcset")}})}function o(){function t(t,e){return t[l]&&t[l].img&&("src"===e||"srcset"===e)?t[l].img:t}d||(HTMLImageElement.prototype.getAttribute=function(e){return b.call(t(this,e),e)},HTMLImageElement.prototype.setAttribute=function(e,i){return h.call(t(this,e),e,String(i))})}function a(t,e){var i=!y&&!t;if(e=e||{},t=t||"img",d&&!e.skipTest||!m)return!1;"img"===t?t=document.getElementsByTagName("img"):"string"==typeof t?t=document.querySelectorAll(t):"length"in t||(t=[t]);for(var r=0;r<t.length;r++)t[r][l]=t[r][l]||{skipTest:e.skipTest},c(t[r]);i&&(document.body.addEventListener("load",function(t){"IMG"===t.target.tagName&&a(t.target,{skipTest:e.skipTest})},!0),y=!0,t="img"),e.watchMQ&&window.addEventListener("resize",a.bind(null,t,{skipTest:e.skipTest}))}var l="fregante:object-fit-images",u=/(object-fit|object-position)\s*:\s*([-.\w\s%]+)/g,g="undefined"==typeof Image?{style:{"object-position":1}}:new Image,f="object-fit"in g.style,d="object-position"in g.style,m="background-size"in g.style,p="string"==typeof g.currentSrc,b=g.getAttribute,h=g.setAttribute,y=!1;return a.supportsObjectFit=f,a.supportsObjectPosition=d,o(),a}();
