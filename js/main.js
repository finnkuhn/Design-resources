jQuery(document).ready(function($){
	//open/close lateral filter
	$('.cd-filter-trigger').on('click', function(){
		triggerFilter(true);
	});
	$('.cd-filter .cd-close').on('click', function(){
		triggerFilter(false);
	});

	function triggerFilter($bool) {
		var elementsToTrigger = $([$('.cd-filter-trigger'), $('.cd-filter'), $('.cd-tab-filter'), $('.cd-gallery')]);
		elementsToTrigger.each(function(){
			$(this).toggleClass('filter-is-visible', $bool);
		});
	}

	//mobile version - detect click event on filters tab
	var filter_tab_placeholder = $('.cd-tab-filter .placeholder a'),
		filter_tab_placeholder_default_value = 'Select',
		filter_tab_placeholder_text = filter_tab_placeholder.text();
	
	$('.cd-tab-filter li').on('click', function(event){
		//detect which tab filter item was selected
		var selected_filter = $(event.target).data('type');
			
		//check if user has clicked the placeholder item
		if( $(event.target).is(filter_tab_placeholder) ) {
			(filter_tab_placeholder_default_value == filter_tab_placeholder.text()) ? filter_tab_placeholder.text(filter_tab_placeholder_text) : filter_tab_placeholder.text(filter_tab_placeholder_default_value) ;
			$('.cd-tab-filter').toggleClass('is-open');

		//check if user has clicked a filter already selected 
		} else if( filter_tab_placeholder.data('type') == selected_filter ) {
			filter_tab_placeholder.text($(event.target).text());
			$('.cd-tab-filter').removeClass('is-open');	

		} else {
			//close the dropdown and change placeholder text/data-type value
			$('.cd-tab-filter').removeClass('is-open');
			filter_tab_placeholder.text($(event.target).text()).data('type', selected_filter);
			filter_tab_placeholder_text = $(event.target).text();
			
			//add class selected to the selected filter item
			$('.cd-tab-filter .selected').removeClass('selected');
			$(event.target).addClass('selected');
		}
	});
	
	//close filter dropdown inside lateral .cd-filter 
	$('.cd-filter-block h4').on('click', function(){
		$(this).toggleClass('closed').siblings('.cd-filter-content').slideToggle(300);
	})

	//fix lateral filter and gallery on scrolling
	$(window).on('scroll', function(){
		(!window.requestAnimationFrame) ? fixGallery() : window.requestAnimationFrame(fixGallery);
	});

	function fixGallery() {
		var offsetTop = $('.cd-main-content').offset().top,
			scrollTop = $(window).scrollTop();
		( scrollTop >= offsetTop ) ? $('.cd-main-content').addClass('is-fixed') : $('.cd-main-content').removeClass('is-fixed');
	}

	/************************************
		MitItUp filter settings
		More details: 
		https://mixitup.kunkalabs.com/
		or:
		http://codepen.io/patrickkunka/
	*************************************/

	buttonFilter.init();
	$('.cd-gallery ul').mixItUp({
	    controls: {
	    	enable: false
	    },
	    callbacks: {
	    	onMixStart: function(){
	    		$('.cd-fail-message').fadeOut(200);
	    	},
	      	onMixFail: function(){
	      		$('.cd-fail-message').fadeIn(200);
	    	}
	    }
	});

	//search filtering
	//credits http://codepen.io/edprats/pen/pzAdg
	var inputText;
	var $matching = $();

	var delay = (function(){
		var timer = 0;
		return function(callback, ms){
			clearTimeout (timer);
		    timer = setTimeout(callback, ms);
		};
	})();

	$(".cd-filter-content input[type='search']").keyup(function(){
	  	// Delay function invoked to make sure user stopped typing
	  	delay(function(){
	    	inputText = $(".cd-filter-content input[type='search']").val().toLowerCase();
	   		// Check to see if input field is empty
	    	if ((inputText.length) > 0) {            
	      		$('.mix').each(function() {
		        	var $this = $(this);
		        
		        	// add item to be filtered out if input text matches items inside the title   
		        	if($this.attr('class').toLowerCase().match(inputText)) {
		          		$matching = $matching.add(this);
		        	} else {
		          		// removes any previously matched item
		          		$matching = $matching.not(this);
		        	}
	      		});
	      		$('.cd-gallery ul').mixItUp('filter', $matching);
	    	} else {
	      		// resets the filter to show all item if input is empty
	      		$('.cd-gallery ul').mixItUp('filter', 'all');
	    	}
	  	}, 200 );
	});
});

/*****************************************************
	MixItUp - Define a single object literal 
	to contain all filter custom functionality
*****************************************************/
var buttonFilter = {
  	// Declare any variables we will need as properties of the object
  	$filters: null,
  	groups: [],
  	outputArray: [],
  	outputString: '',
  
  	// The "init" method will run on document ready and cache any jQuery objects we will need.
  	init: function(){
    	var self = this; // As a best practice, in each method we will asign "this" to the variable "self" so that it remains scope-agnostic. We will use it to refer to the parent "buttonFilter" object so that we can share methods and properties between all parts of the object.
    
    	self.$filters = $('.cd-main-content');
    	self.$container = $('.cd-gallery ul');
    
	    self.$filters.find('.cd-filters').each(function(){
	      	var $this = $(this);
	      
		    self.groups.push({
		        $inputs: $this.find('.filter'),
		        active: '',
		        tracker: false
		    });
	    });
	    
	    self.bindHandlers();
  	},
  
  	// The "bindHandlers" method will listen for whenever a button is clicked. 
  	bindHandlers: function(){
    	var self = this;

    	self.$filters.on('click', 'a', function(e){
	      	self.parseFilters();
    	});
	    self.$filters.on('change', function(){
	      self.parseFilters();           
	    });
  	},
  
  	parseFilters: function(){
	    var self = this;
	 
	    // loop through each filter group and grap the active filter from each one.
	    for(var i = 0, group; group = self.groups[i]; i++){
	    	group.active = [];
	    	group.$inputs.each(function(){
	    		var $this = $(this);
	    		if($this.is('input[type="radio"]') || $this.is('input[type="checkbox"]')) {
	    			if($this.is(':checked') ) {
	    				group.active.push($this.attr('data-filter'));
	    			}
	    		} else if($this.is('select')){
	    			group.active.push($this.val());
	    		} else if( $this.find('.selected').length > 0 ) {
	    			group.active.push($this.attr('data-filter'));
	    		}
	    	});
	    }
	    self.concatenate();
  	},
  
  	concatenate: function(){
    	var self = this;
    
    	self.outputString = ''; // Reset output string
    
	    for(var i = 0, group; group = self.groups[i]; i++){
	      	self.outputString += group.active;
	    }
    
	    // If the output string is empty, show all rather than none:    
	    !self.outputString.length && (self.outputString = 'all'); 
	
    	// Send the output string to MixItUp via the 'filter' method:    
		if(self.$container.mixItUp('isLoaded')){
	    	self.$container.mixItUp('filter', self.outputString);
		}
  	}
};

(function(){
	// FAQ Template - by CodyHouse.co
  var FaqTemplate = function(element) {
		this.element = element;
		this.sections = this.element.getElementsByClassName('cd-faq__group');
		this.triggers = this.element.getElementsByClassName('cd-faq__trigger');
		this.faqContainer = this.element.getElementsByClassName('cd-faq__items')[0];
		this.faqsCategoriesContainer = this.element.getElementsByClassName('cd-faq__categories')[0];
		this.faqsCategories = this.faqsCategoriesContainer.getElementsByClassName('cd-faq__category');
  	this.faqOverlay = this.element.getElementsByClassName('cd-faq__overlay')[0];
  	this.faqClose = this.element.getElementsByClassName('cd-faq__close-panel')[0];
  	this.scrolling = false;
  	initFaqEvents(this);
  };

  function initFaqEvents(faqs) {
  	// click on a faq category
		faqs.faqsCategoriesContainer.addEventListener('click', function(event){
			var category = event.target.closest('.cd-faq__category');
			if(!category) return;
			var mq = getMq(faqs),
				selectedCategory = category.getAttribute('href').replace('#', '');
			if(mq == 'mobile') { // on mobile, open faq panel
				event.preventDefault();
				faqs.faqContainer.scrollTop = 0;
				Util.addClass(faqs.faqContainer, 'cd-faq__items--slide-in');
				Util.addClass(faqs.faqClose, 'cd-faq__close-panel--move-left');
				Util.addClass(faqs.faqOverlay, 'cd-faq__overlay--is-visible');
				var selectedSection = faqs.faqContainer.getElementsByClassName('cd-faq__group--selected');
				if(selectedSection.length > 0) {
					Util.removeClass(selectedSection[0], 'cd-faq__group--selected');
				}
				Util.addClass(document.getElementById(selectedCategory), 'cd-faq__group--selected');
			} else { // on desktop, scroll to section
				if(!window.requestAnimationFrame) return;
				event.preventDefault();
				var windowScrollTop = window.scrollY || document.documentElement.scrollTop;
				Util.scrollTo(document.getElementById(selectedCategory).getBoundingClientRect().top + windowScrollTop + 2, 200);
			}
		});

		// on mobile -> close faq panel
		faqs.faqOverlay.addEventListener('click', function(event){
			closeFaqPanel(faqs);
		});
		faqs.faqClose.addEventListener('click', function(event){
			event.preventDefault();
			closeFaqPanel(faqs);
		});

		// on desktop -> toggle faq content visibility when clicking on the trigger element
		faqs.faqContainer.addEventListener('click', function(event){
			if(getMq(faqs) != 'desktop') return;
			var trigger = event.target.closest('.cd-faq__trigger');
			if(!trigger) return;
			event.preventDefault();
			var content = trigger.nextElementSibling,
				parent = trigger.closest('li'),
				bool = Util.hasClass(parent, 'cd-faq__item-visible');

			Util.toggleClass(parent, 'cd-faq__item-visible', !bool);

			//store initial and final height - animate faq content height
			Util.addClass(content, 'cd-faq__content--visible');
			var initHeight = bool ? content.offsetHeight: 0,
				finalHeight = bool ? 0 : content.offsetHeight;
			
			if(window.requestAnimationFrame) {
				Util.setHeight(initHeight, finalHeight, content, 200, function(){
					heighAnimationCb(content, bool);
				});
			} else {
				heighAnimationCb(content, bool);
			}
		});
		
		if(window.requestAnimationFrame) {
			// on scroll -> update selected category
			window.addEventListener('scroll', function(){
				if(getMq(faqs) != 'desktop' || faqs.scrolling) return;
				faqs.scrolling = true;
				window.requestAnimationFrame(updateCategory.bind(faqs)); 
			});
		}
  };

  function closeFaqPanel(faqs) {
  	Util.removeClass(faqs.faqContainer, 'cd-faq__items--slide-in');
  	Util.removeClass(faqs.faqClose, 'cd-faq__close-panel--move-left');
  	Util.removeClass(faqs.faqOverlay, 'cd-faq__overlay--is-visible');
  };

  function getMq(faqs) {
		//get MQ value ('desktop' or 'mobile') 
		return window.getComputedStyle(faqs.element, '::before').getPropertyValue('content').replace(/'|"/g, "");
  };

  function updateCategory() { // update selected category -> show green rectangle to the left of the category
  	var selected = false;
		for(var i = 0; i < this.sections.length; i++) {
			var top = this.sections[i].getBoundingClientRect().top,
				bool = (top <= 0) && (-1*top < this.sections[i].offsetHeight);
			Util.toggleClass(this.faqsCategories[i], 'cd-faq__category-selected', bool);
			if(bool) selected = true;
		}
		if(!selected) Util.addClass(this.faqsCategories[0], 'cd-faq__category-selected');
		this.scrolling = false;
  };

  function heighAnimationCb(content, bool) {
		content.removeAttribute("style");
		if(bool) Util.removeClass(content, 'cd-faq__content--visible');
  };

  var faqTemplate = document.getElementsByClassName('js-cd-faq'),
  	faqArray = [];
  if(faqTemplate.length > 0) {
		for(var i = 0; i < faqTemplate.length; i++) {
			faqArray.push(new FaqTemplate(faqTemplate[i])); 
		}
  };
})();