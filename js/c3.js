(function($) {
	let c3 = window.c3 = window.c3 || {};
	const ua = window.navigator.userAgent;
	const isMobile = /(?:iPhone|iPad|Android|Windows Phone)/.test(ua);
	const iOS = /(?:iPhone|iPad)/.test(ua);
	const maybeIE = !Array.from;

	// add 'is-mobile` class if test is true
	if (isMobile) {
		document.documentElement.classList.add('is-mobile');
	}

	/**
	 * @namespace c3
	 * @name ua
	 * @public
	 * @type {boolean}
	 * @description copy of window.navigator.userAgent
	 */
	c3.ua = ua;
	/**
	 * @namespace c3
	 * @name isMobile
	 * @type {boolean}
	 * @description the result of testing the user agent string for mobile devices
	 */
	c3.isMobile = isMobile;
	/**
	 * @namespace c3
	 * @name iOS
	 * @type {boolean}
	 * @description target test of ua for ios
	 */
	c3.iOS = iOS;
	/**
	 * @namespace c3
	 * @name maybeIE
	 * @type {boolean}
	 * @description tests for Array.from and if missing assumes browser is IE
	 */
	c3.maybeIE = maybeIE;

	/**
	 * @class
	 * @name EmbeddedVideo
	 * @param {object} videoOptions options to be passed to initialization (see EmbeddedVideo.defaultOptions)
	 */
	function EmbeddedVideo(videoOptions) {
		// copy passed options or set to default
		let options = Object.assign({}, EmbeddedVideo.defaultOptions);

		if ( videoOptions !== null && typeof videoOptions !== 'undefined' ) {
			options = Object.assign(options, videoOptions);
		}

		this.init(options);
	}

	/**
	 * @name EmbeddedVideo.fallbackMessage
	 * @static
	 * @type {string}
	 * @description string to be used in fallback message if needed
	 */
	EmbeddedVideo.fallbackMessage = 'It seems your browser cannot play the video. Maybe try this link.';

	/**
	 * @name EmbeddedVideo.defaultOptions
	 * @static
	 * @type {object}
	 * @descriptions object with default options for initialization
	 */
	EmbeddedVideo.defaultOptions = {
		controls: true,
		loop: false,
		autoplay: true,
		playsinline: true,
		muted: false,
		src: null,
		poster: null,
		immediateLoad: false
	};

	/**
	 * @name EmbeddedVideo.destroy
	 * @static
	 * @function
	 * @param {object} obj object whose properties will be derefernced
	 * @description generic function to dereference properties in an object
	 * @returns {void}
	 */
	EmbeddedVideo.destroy = function(obj) {
		for (let p in obj) {
			if (obj.hasOwnProperty(p)) {
				delete obj[p];
			}
		}
	};

	/**
	 * @memberof EmbeddedVideo
	 * @name init
	 * @instance
	 * @function
	 * @argument {object} options
	 * @description initialization function for interfacing with video player
	 * @returns {void}
	 */
	EmbeddedVideo.prototype.init = function(options) {
		/**
		 * @memberof EmbeddedVideo
		 * @name video
		 * @instance
		 * @private
		 * @type {HTMLMediaElement}
		 */
		this.video = document.createElement('video');

		// configure video
		this.video.controls = options.controls;
		this.video.loop = options.loop;
		this.video.muted = options.muted;
		this.video.autoplay = options.autoplay;
		this.video.playsinline = options.playsinline;

		// Add poster if available
		if ( options.poster ) {
			this.video.poster = options.poster;
		}
		
		// add access to destory method
		this.video.__ev_destroy__ = this.destroy;

		/**
		 * @memberof EmbeddedVideo
		 * @name source
		 * @instance
		 * @private
		 * @type {HTMLSourceElement}
		 */
		this.source = document.createElement('source');

		/**
		 * @memberof EmbeddedVideo
		 * @name fallbackContainer
		 * @instance
		 * @private
		 * @type {HTMLParagraphElement}
		 */
		this.fallbackContainer = document.createElement('p');

		/**
		 * @memberof EmbeddedVideo
		 * @name fallbackMessage
		 * @instance
		 * @private
		 * @type {Text}
		 */
		this.fallbackMessage = document.createTextNode(EmbeddedVideo.fallbackMessage);

		// add fallback message to container
		this.fallbackContainer.appendChild(this.fallbackMessage);
		
		/**
		 * @memberof EmbeddedVideo
		 * @name videoLink
		 * @instance
		 * @private
		 * @type {HTMLAnchorElement}
		 */
		this.videoLink = document.createElement('a');

		// set target to blank
		this.videoLink.setAttribute('target', '_blank');
		// set rel for security
		this.videoLink.setAttribute('rel', 'noopener noreferrer');
		// append link to container
		this.fallbackContainer.appendChild(this.videoLink);

		// append the source
		this.video.appendChild(this.source);
		// append the fallback message
		this.video.appendChild(this.fallbackContainer);

		/**
		 * @memberof EmbeddedVideo
		 * @name loaded
		 * @instance
		 * @public
		 * @readonly
		 * @type {boolean}
		 */
		this.loaded = false;

		/**
		 * @memberof EmbeddedVideo
		 * @name srcUrl
		 * @instance
		 * @public
		 * @type {string}
		 */
		this.srcUrl = '';

		// store reference for this instance
		const instance = this;

		/**
		 * @memberof EmbeddedVideo
		 * @name played
		 * @instance
		 * @public
		 * @readonly
		 * @type {boolean}
		 */
		Object.defineProperty(this, 'played', {
			get: function() {
				return instance.video.played.length ? true : false;
			},
			enumerable: true
		});

		// configure src
		this.updateSrc(options.src, options.immediateLoad);

		// when video can play, add data-playback attribute
		// TODO: move to container
		this.video.addEventListener('canplaythrough', function(event) {
			event.target.setAttribute('data-playback', true);
		});
	};

	/**
	 * @memberof EmbeddedVideo
	 * @name updateSrc
	 * @instance
	 * @public
	 * @argument {string} newSrc the new video source
	 * @argument {boolean} immediateReload whether or not to call load after setting
	 * @description updates underlying video source
	 * @returns {void}
	 */
	EmbeddedVideo.prototype.updateSrc = function(newSrc, immediateReload) {
		this.srcUrl = newSrc || null;
		this.videoLink.setAttribute('href', this.srcUrl);
		this.loaded = false;
		if (newSrc && immediateReload) {
			this.load();
		}
	};

	/**
	 * @memberof EmbeddedVideo
	 * @name load
	 * @instance
	 * @public
	 * @description loads underlying video
	 * @returns {void}
	 */
	EmbeddedVideo.prototype.load = function() {
		if (!this.loaded && this.srcUrl) {
			this.source.setAttribute('src', this.srcUrl);
			this.video.load();
			this.loaded = true;
		}
	};

	/**
	 * @memberof EmbeddedVideo
	 * @name play
	 * @instance
	 * @public
	 * @description plays underlying video
	 * @returns {void}
	 */
	EmbeddedVideo.prototype.play = function() {
		this.video.play();
	};

	/**
	 * @memberof EmbeddedVideo
	 * @name pause
	 * @instance
	 * @public
	 * @description pauses underlying video
	 * @returns {void}
	 */
	EmbeddedVideo.prototype.pause = function() {
		this.video.pause();
	};

	/**
	 * @memberof EmbeddedVideo
	 * @name destory
	 * @instance
	 * @public
	 * @description destroys own references
	 * @returns {void}
	 */
	EmbeddedVideo.prototype.destroy = function() {
		EmbeddedVideo.destroy(this);
	};

	/**
	 * @memberof EmbeddedVideo
	 * @name onerror
	 * @instance
	 * @public
	 * @description adds error handler to underlying video
	 * @returns {void}
	 */
	EmbeddedVideo.prototype.onerror = function(handler) {
		this.video.addEventListener('error', handler);
	};

	/**
	 * @memberof EmbeddedVideo
	 * @name onready
	 * @instance
	 * @public
	 * @function
	 * @description adds ready handler to underlying video
	 * @returns {void}
	 */
	EmbeddedVideo.prototype.onready = function(handler) {
		if (this.video.readyState === 4) {
			handler();
		} else {
			this.video.addEventListener('canplaythrough', handler);
		}
	};

	/**
	 * @memberof EmbeddedVideo
	 * @name setTime
	 * @instance
	 * @public
	 * @function
	 * @description sets the set in the underlying video
	 * @returns {void}
	 */
	EmbeddedVideo.prototype.setTime = function(time) {
		this.video.currentTime = time;
	};

	/**
	 * @namespace c3
	 * @name EmbeddedVideo
	 * @type {EmbeddedVideo}
	 */
	c3.EmbeddedVideo = EmbeddedVideo;

	/**********************
	 * END EMBEDDED VIDEO *
	 **********************/

	/**
	 * @class
	 * @name Carousel
	 * @param {DOMString} selector to select carousel items
	 */
	function Carousel(selector) {
		/**
		 * @member
		 * @name state
		 * @instance
		 * @private
		 * @type {number}
		 */
		this.state = Carousel.states.UNINIT;
		
		/**
		 * @member
		 * @name containers
		 * @instance
		 * @private
		 * @readonly
		 * @type {NodeList}
		 */
		this.containers = document.querySelectorAll(selector);

		/**
		 * @member
		 * @name activeIndex
		 * @instance
		 * @private
		 * @type {number}
		 */
		this.activeIndex = null;

		/**
		 * @member
		 * @name listeners
		 * @instance
		 * @private
		 * @type {object}
		 * @description map for storing event listeners
		 */
		this.listeners = {};

		/**
		 * @member
		 * @name onceListeners
		 * @instance
		 * @private
		 * @type {object}
		 * @description map for storing one-time event listeners
		 */
		this.onceListeners = {};

		this.isReady = false;

		const instance = this;
		// initialize valid events
		Carousel.events.forEach(function(eventName) {
			instance.listeners[eventName] = [];
			instance.onceListeners[eventName] = [];
		});
	}

	/**
	 * @name Carousel.activeClass
	 * @static
	 * @type {DOMString}
	 * @description the class to be added to active containers
	 */
	Carousel.activeClass = 'is-active';

	/**
	 * @name Carousel.states
	 * @static
	 * @type {object}
	 * @description a bit map of states
	 */
	Carousel.states = {
		'UNINIT': 0,
		'INIT': 1,
		'READY': 2,
		'STARTED': 4,
		'STOPPED': 8,
		'ERROR': 16
	};

	/**
	 * @name Carousel.events
	 * @static
	 * @type {String[]}
	 * @description a list of events for Carousels
	 */
	Carousel.events = [
		'change',
		'end',
		'error',
		'start',
		'stop',
		'ready'
	];

	/**
	 * @memberof Carousel
	 * @name on
	 * @public
	 * @instance
	 * @function
	 * @argument {string} eventName
	 * @argument {function} listener
	 * @description adds listener to valid events
	 * @returns {void}
	 */
	Carousel.prototype.on = function(eventName, listener) {
		if (this.listeners[eventName]) {
			this.listeners[eventName].push(listener);
		}
	};

	/**
	 * @memberof Carousel
	 * @name off
	 * @public
	 * @instance
	 * @function
	 * @argument {string} eventName
	 * @argument {function} listener
	 * @description removes listener if it and the eventName exist
	 * @returns {void}
	 */
	Carousel.prototype.off = function(eventName, listener) {
		if (this.listeners[eventName]) {
			const listenerIndex = this.listeners[eventName].indexOf(listener);
			if (listenerIndex) {
				this.listeners[eventName].splice(listenerIndex, 1);
			}
		}
	};

	/**
	 * @memberof Carousel
	 * @name once
	 * @public
	 * @instance
	 * @function
	 * @argument {string} eventName
	 * @argument {function} listener
	 * @description adds listener that will only fire once
	 * @returns {void}
	 */
	Carousel.prototype.once = function(eventName, handler) {
		if (this.onceListeners[eventName]) {
			this.onceListeners[eventName].push(handler);
		}
	};

	/**
	 * @memberof Carousel
	 * @name emit
	 * @private
	 * @instance
	 * @function
	 * @argument {string} eventName
	 * @argument {=*} data argument to be passed to listener
	 * @description fires listeners for event if valid
	 * @returns {void}
	 */
	Carousel.prototype.emit = function(eventName, data) {
		let listeners = [];
		if (this.listeners[eventName]) {
			listeners = listeners.concat(this.listeners[eventName]);
		}

		if (this.onceListeners[eventName]) {
			listeners = listeners.concat(this.onceListeners[eventName]);
			this.onceListeners[eventName] = [];
		}

		if (listeners.length > 0) {
			setTimeout(function() {
				listeners.forEach(function(handler) {
					handler(data);
				});
			});
		}
	};

	/**
	 * @memberof Carousel
	 * @name start
	 * @public
	 * @instance
	 * @function
	 * @description if not in an error state, fires start event
	 * @returns {void}
	 */
	Carousel.prototype.start = function() {
		// flip STARTED bit on
		this.state |= Carousel.states.STARTED;
		if ((this.state & Carousel.states.ERROR) === 0) {
			this.emit('start');
		}
	};

	/**
	 * @memberof Carousel
	 * @name stop
	 * @public
	 * @instance
	 * @function
	 * @description fires stop event
	 * @returns {void}
	 */
	Carousel.prototype.stop = function() {
		// flip STOPPED bit on
		this.state |= Carousel.states.STOPPED;
		// flip STARTED bit off
		this.state ^= Carousel.states.STARTED;
		this.emit('stop');
	};

	/****************
	 * END CAROUSEL *
	 ****************/

	/**
	 * @class
	 * @name VideoCarousel
	 * @extends Carousel
	 * @param {DOMString} selector to select carousel items
	 * @param {number} slideDuration the slide duration in ms
	 * @param {number} transitionDuration should match the css transistion duration in ms
	 */
	function VideoCarousel(selector, slideDuration, transitionDuration) {
		Carousel.call(this, selector);

		/**
		 * @member
		 * @public
		 * @instance
		 * @type {EmbeddedVideo[]}
		 */
		this.videos = [];

		/**
		 * @member
		 * @public
		 * @instance
		 * @type {number}
		 */
		this.transitionDuration = transitionDuration ? +transitionDuration + 50 : 50;

		/**
		 * @member
		 * @public
		 * @instance
		 * @type {number}
		 */
		this.slideDuration = slideDuration || 4000;

		const instance = this;

		// loop through containers and create videos
		this.containers.forEach(function(container, idx) {
			const videoSrc = container.getAttribute(VideoCarousel.srcAttr);
			if (videoSrc) {
				const ev = new EmbeddedVideo({
					loop: true,
					controls: false,
					autoplay: idx === 0,
					muted: true,
					src: videoSrc,
					immediateLoad: idx === 0
				});
				instance.videos.push(ev);
				container.appendChild(ev.video);
			}
		});

		this.videos[0].onready(function() {
			instance.isReady = true;
			instance.emit('ready');
		});

		// bind to each videos error event
		this.videos.forEach(function(v, idx) {
			v.onerror(function(error) {
				instance.emit('error', {
					error: error,
					video: v,
					index: idx
				});
			});
		});

		/**
		 * @member
		 * @private
		 * @instance
		 * @type {number}
		 */
		this.intervalId = null;

		// on start
		this.on('start', function() {
			instance.next();

			clearInterval(instance.intervalId);

			instance.intervalId = setInterval(function() {
				instance.next();
			}, instance.slideDuration);
		});

		// on change
		this.on('change', function(indices) {
			if (indices.jumpIndex !== null) {
				clearInterval(instance.intervalId);
				instance.intervalId = setInterval(function() {
					instance.next();
				}, instance.slideDuration);
			}
		});

		// on stop
		this.on('stop', function() {
			clearInterval(instance.intervalId);
			instance.videos.forEach(function(v) {
				v.pause();
			});
		});

		this.state = this.state | Carousel.INIT;
	}

	VideoCarousel.prototype = Object.create(Carousel.prototype);
	VideoCarousel.prototype.constructor = VideoCarousel;

	/**
	 * @name VideoCarousel.srcAttr
	 * @public
	 * @static
	 * @readonly
	 * @type {string}
	 * @description the html attribute that stores the video source value
	 */
	VideoCarousel.srcAttr = 'data-video-source';

	/**
	 * @memberof VideoCarousel
	 * @private
	 * @instance
	 * @function
	 * @param {EmbeddedVideo} video 
	 * @param {boolean=} force
	 * @returns {void}
	 */
	VideoCarousel.prototype.loadVideo = function(video, force) {
		if (!video.loaded || force) {
			video.load();
		}
	};

	/**
	 * @memberof VideoCarousel
	 * @name next
	 * @instance
	 * @function
	 * @returns {void}
	 */
	VideoCarousel.prototype.next = function(jumpIndex) {
		const lastIndex = this.activeIndex;
		const instance = this;

		if (this.activeIndex === null) {
			this.activeIndex = 0;
		} else {
			this.containers[this.activeIndex].classList.remove(Carousel.activeClass);
			setTimeout(function() {
				instance.videos[lastIndex].pause();
				instance.videos[lastIndex].setTime(0);
			}, instance.transitionDuration);

			if (typeof jumpIndex !== 'undefined' && jumpIndex !== null) {
				this.loadVideo(this.videos[jumpIndex]);
				this.activeIndex = jumpIndex;
			} else {
				this.activeIndex++;
			}

			if (this.activeIndex >= this.containers.length) {
				this.activeIndex = 0;
			}
		}

		this.containers[this.activeIndex].classList.add(Carousel.activeClass);
		this.videos[this.activeIndex].play();
		
		let nextIndex = this.activeIndex + 1;

		if (nextIndex >= this.containers.length) {
			nextIndex = 0;
		}

		this.loadVideo(this.videos[nextIndex]);

		this.emit('change', {
			activeIndex: this.activeIndex,
			lastIndex: lastIndex,
			jumpIndex: typeof jumpIndex === 'undefined' ? null : jumpIndex
		});
	};

	c3.VideoCarousel = VideoCarousel;

	/**********************
	 * END VIDEO CAROUSEL *
	 **********************/

	/**
	 * @class
	 * @name BackgroundImage
	 * @param {object} imageOptions 
	 */
	function BackgroundImage(imageOptions) {
		const options = Object.create(imageOptions);

		this.init(options);
	}

	/**
	 * @memberof BackgroundImage
	 * @name init
	 * @private
	 * @instance
	 * @function
	 * @param {object} options
	 * @returns {void}
	 */
	BackgroundImage.prototype.init = function(options) {
		this.src = options.src || null;
		this.image = new Image();
		this.loaded = false;
		if (options.immediateLoad) {
			this.load();
		}
	};

	/**
	 * @memberof BackgroundImage
	 * @name load
	 * @public
	 * @instance
	 * @function
	 * @returns {void}
	 */
	BackgroundImage.prototype.load = function() {
		if (!this.loaded) {
			this.image.src = this.src;
			this.loaded = true;
		}
	};

	/**
	 * @memberof BackgroundImage
	 * @name onload
	 * @public
	 * @instance
	 * @function
	 * @returns {void}
	 */
	BackgroundImage.prototype.onload = function(listener) {
		if (this.loaded) {
			listener();
		} else {
			this.image.addEventListener('load', listener);
		}
	};

	c3.BackgroundImage = BackgroundImage;

	/************************
	 * END BACKGROUND IMAGE *
	 ************************/

	/**
	 * @class
	 * @name ImageCarousel
	 * @param {DOMString} selector 
	 */
	function ImageCarousel(selector, slideDuration) {
		Carousel.call(this, selector);

		this.images = [];

		/**
		 * @member
		 * @public
		 * @instance
		 * @type {number}
		 */
		this.slideDuration = slideDuration || 4000;

		/**
		 * @type {ImageCarousel}
		 * @description reference to this
		 */
		const instance = this;

		this.containers.forEach(function(container, idx) {
			instance.images.push(new BackgroundImage({
				src: container.getAttribute(ImageCarousel.srcAttr),
				immediateLoad: idx === 0
			}));
		});

		this.images[0].onload(function() {
			instance.isReady = true;
			instance.emit('ready');
		});

		/**
		 * @member
		 * @private
		 * @instance
		 * @type {number}
		 */
		this.intervalId = null;

		// on start
		this.on('start', function() {

			instance.next();

			clearInterval(this.intervalId);

			instance.intervalId = setInterval(function() {
				instance.next();
			}, instance.slideDuration);
		});

		// on change
		this.on('change', function(indices) {
			if (indices.jumpIndex !== null) {
				clearInterval(instance.intervalId);
				instance.intervalId = setInterval(function() {
					instance.next();
				}, instance.slideDuration);
			}
		});

		// on stop
		this.on('stop', function() {
			clearInterval(instance.intervalId);
		});

		this.state = this.state | Carousel.INIT;
	}

	ImageCarousel.prototype = Object.create(Carousel.prototype);
	ImageCarousel.prototype.constructor = ImageCarousel;

	ImageCarousel.srcAttr = 'data-img-src';

	ImageCarousel.prototype.renderBackgroundImage = function(image) {
		const idx = this.images.indexOf(image);
		if (idx > -1) {
			this.containers[idx].style.backgroundImage = 'url(' + image.src + ')';
		}
	};

	ImageCarousel.prototype.next = function(jumpIndex) {
		const lastIndex = this.activeIndex;

		if (this.activeIndex === null) {
			this.activeIndex = 0;
		} else {
			this.containers[this.activeIndex].classList.remove(Carousel.activeClass);

			if (typeof jumpIndex !== 'undefined' && jumpIndex !== null) {
				this.images[jumpIndex].load();
				this.activeIndex = jumpIndex;
			} else {
				this.activeIndex++;
			}
			
			if (this.activeIndex >= this.containers.length) {
				this.activeIndex = 0;
			}
		}

		this.containers[this.activeIndex].classList.add(Carousel.activeClass);
		this.renderBackgroundImage(this.images[this.activeIndex]);

		let nextIndex = this.activeIndex + 1;

		if (nextIndex >= this.containers.length) {
			nextIndex = 0;
		}

		this.images[nextIndex].load();

		this.emit('change', {
			activeIndex: this.activeIndex,
			lastIndex: lastIndex,
			jumpIndex: typeof jumpIndex === 'undefined' ? null : jumpIndex
		});
	};

	c3.ImageCarousel = ImageCarousel;

	/**********************
	 * END IMAGE CAROUSEL *
	 **********************/
	
	/**
	 * @namespace c3
	 * @name initModalVideos
	 * @public
	 * @function
	 * @param {DOMString} selector the selector to find all of the video containers
	 */
	c3.initModalVideos = function initModalVideos(modalId) {
		// get all elements that open video modals
		const modalTriggers = document.querySelectorAll('[data-open="' + modalId + '"][data-video-modal-id]');
		// if any are found
		if (modalTriggers.length > 0) {
			let videoModalContainer = document.querySelector('#' + modalId);

			// Set up modal
			$(videoModalContainer).on('closeme.zf.reveal', function() {
				const modal = this;
				const videoContainer = modal.querySelector('.video-container');
				const videoSource = modal.getAttribute('data-video-source');
				const videoPoster = modal.getAttribute('data-video-poster');

				const embeddedVideo = new EmbeddedVideo({
					src: videoSource,
					autoplay: true,
					poster: videoPoster
				});
				videoContainer.append(embeddedVideo.video);
				embeddedVideo.load();
				embeddedVideo.onready(function() {
					embeddedVideo.play();
				});
			});

			$(videoModalContainer).on('open.zf.reveal', function() {
				const nonCarouselVideos = document.querySelectorAll('*:not(.section-case-study):not(.section-hero) video');
				nonCarouselVideos.forEach(function(video) {
					if (!video.paused) {
						video.setAttribute('data-play-on-close-modal', '');
						video.pause();
					}
				});
				c3.disableFPScroll();
				c3.stopHeroAnimation && c3.stopHeroAnimation();
				c3.stopCaseStudyAnimation && c3.stopCaseStudyAnimation();
			});

			$(videoModalContainer).on('closed.zf.reveal', function() {
				const videosToPlay = document.querySelectorAll('[data-play-on-close-modal]');
				videosToPlay.forEach(function(video) {
					if (video.paused) {
						video.removeAttribute('data-play-on-close-modal');
						video.play();
					}
				});
				c3.enableFPScroll();
				if (window.jQuery.fn.fullpage) {
					
					const activeSection = window.jQuery.fn.fullpage.getActiveSection();
					if (activeSection.item) {

						if (activeSection.item.classList.contains('section-case-study')) {
							c3.startCaseStudyAnimation && c3.startCaseStudyAnimation();
						} else if (activeSection.item.classList.contains('section-hero')) {
							c3.startHeroAnimation && c3.startHeroAnimation();
						}
						
					}
				}
				
			});

			// NOTE: depends on NodeList.prototype.forEach polyfill for IE
			modalTriggers.forEach(function(el) {
				const src = el.getAttribute('data-video-modal-id');
				const poster = el.getAttribute('data-video-poster');
				el.addEventListener('click', function() {
					videoModalContainer.setAttribute('data-video-source', src);
					videoModalContainer.setAttribute('data-video-poster', poster);
				});
			});

			// Set up observer to clear video if modal is closing
			const observer = new MutationObserver(function(mutationList, observer) {
				for ( let i = 0; i < mutationList.length; i++ ) {
					let mutation = mutationList[i];
					const modalContainer = mutation.target;
					const modalClassList = modalContainer.classList;
					if ( mutation.type === 'attributes' && mutation.attributeName === 'class' && modalClassList.contains('fade-out') ) {
						const videoContainer = modalContainer.querySelector('.video-container');

						if ( videoContainer.children.length > 0 ) {
							console.debug('[MODAL] Clearing modal video container');
							videoContainer.innerHTML = '';
						}
					}
				}
			});
			observer.observe(videoModalContainer, { attributes: true });
		}
	};

	/************************************
	* c3-background-image
	* update any element has [data-bg-image] attribute with `background-image`
	************************************/
	/**
	 * @param {HTMLElement|HTMLElement<>} data
	 */
	c3.lazyBgLoad = function(data) {
		const attr = 'data-bg-image';
		function lazy($el) {
			if (!$el || !$el.getAttribute) {
				return
			}
			const url = $el.getAttribute(attr);
			if (url) {
				$el.style.backgroundImage = 'url(' + url + ')';
				$el.removeAttribute(attr);
			}
		}
		if (data.length) {
			Array.prototype.slice.call(data).forEach(lazy);
		} else {
			lazy(data);
		}
	};
	/************************************
	* c3-image
	* update any element has attribute with `data-src` to `src`
	************************************/
	/**
	 * @param {HTMLElement|HTMLElement<>} data
	 */
	c3.lazyImage = function(data) {
		const attr = 'data-src';
		function lazy($el) {
			if (!$el || !$el.getAttribute) {
				return
			}
			const src = $el.getAttribute(attr);
			if (src) {
				$el.setAttribute('src', src);
				$el.removeAttribute(attr);
			}
		}
		if (data.length) {
			Array.prototype.slice.call(data).forEach(lazy);
		} else {
			lazy(data);
		}
	};
	/************************************
	* set interval with requestAnimationFrame
	************************************/
	c3.requestInterval = function(fn, delay) {
		function Loop() {
			this._isStop = true;
		};
		Loop.prototype.request = function() {
			const self = this;
			if (this._isStop) { return; }
			fn();
			requestAnimationFrame(function() {
				self.request();
			});
		};
		Loop.prototype.start = function() {
			this._isStop = false;
			const self = this;
			requestAnimationFrame(function() {
				self.request();
			});
		};
		Loop.prototype.cancel = function() {
			this._isStop = true;
		};
		const loop = new Loop();
		loop.start();
		return loop;
	}
	/************************************
	* fullpagejs
	* control scroll enable
	************************************/
	c3.disableFPScroll = function() {
		if (!$.fn.fullpage || !$.fn.fullpage.setAllowScrolling) { return; }
		$.fn.fullpage.setAllowScrolling(false);
		$.fn.fullpage.setKeyboardScrolling(false);
	};
	c3.enableFPScroll = function() {
		if (!$.fn.fullpage || !$.fn.fullpage.setAllowScrolling) { return; }
		$.fn.fullpage.setAllowScrolling(true);
		$.fn.fullpage.setKeyboardScrolling(true);
	};
	/************************************
	* c3-slide-button
	* button with white background animation comes from left and leave to right
	************************************/
	/**
	 * show button
	 * @param {HTMLElement} $el
	 */
	c3.showSlideButton = function($el) {
		if (!$el) { return; }
		if($el.length > 0) {
			$el.forEach(function(e, i) {
				const $bgEl = e.querySelector('.c3-slide-button--bg');
				if (!$bgEl) { return; }
				anime.remove($bgEl);
				anime({
					targets: $bgEl,
					scaleX: [0, 1],
					delay: 300,
					duration: 250,
					easing: 'easeInQuad',
					complete: function() {
						e.classList.add('is-show');
						anime({
							targets: $bgEl,
							scaleX: [1, 0],
							delay: 50,
							duration: 250,
							easing: 'easeOutQuad',
						});
					}
				});
			});
		}
	};
	/**
	 * hide button
	 * @param {HTMLElement} $el
	 */
	c3.hideSlideButton = function($el) {
		if (!$el) { return; }
		if($el.length > 0) {
			$el.forEach(function(e, i) {
				const $bgEl = e.querySelector('.c3-slide-button--bg');
				if (!$bgEl) { return; }
				e.classList.remove('is-show');
				anime.remove($bgEl);
				anime({
					targets: $bgEl,
					scaleX: 0,
					duration: 0
				});
			});
		}
	};
})(jQuery);
