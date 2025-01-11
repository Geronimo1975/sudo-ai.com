jQuery(function($){ // use jQuery code inside this to avoid "$ is not defined" error
	var blogFilters = $(".blog-page-filters");
	if(blogFilters.length == 0) return;

	// Update the URL with the filter values to get a shareable link
	function updateFilterURL(paramName, paramValue) {
		let baseUrl = window.location.origin + window.location.pathname;
		let hashPart = window.location.hash;
		let searchParams = new URLSearchParams(window.location.search);
	  
		if (paramValue === "") {
			searchParams.delete(paramName);
		} else {
			searchParams.set(paramName, paramValue);
		}
	  
		if (searchParams.toString() !== "") {
			baseUrl += '?';
		}

		let updatedURL = baseUrl + searchParams.toString() + hashPart;
		window.history.pushState({ path: updatedURL }, '', updatedURL);
	}

	blogFilters.find('select').change(function(){
		var catFilter = blogFilters.find('.category-filter').val();
		var dateFilter = blogFilters.find('.date-filter').val();

		var innerContent = $('.inner-content');
 		var loadMoreBtn = $('.blog_load_more');
		var data = {
			action: 'c3ai_blog_filter',
			query: c3ai_blog_filter_params.posts,
			template: c3ai_blog_filter_params.template,
			catFilter:catFilter,
			dateFilter:dateFilter
		};

		if ( blogFilters.data('post-type') !== null ) {
			data.postType = blogFilters.data('post-type');
		}

		if ( blogFilters.data('taxonomy') !== null ) {
			data.postTaxonomy = blogFilters.data('taxonomy');
		}

		// Update the URL if the filter class exists
		let select = $(this);
		if (select.hasClass('filter-update-url')) {
			let filterValue = select.val();

			// We might have an alternative value for the URL, for example the category slug and not the name
			let alternativeValue = select.find("option:selected").data('filterUrl');
			if (alternativeValue !== undefined) {
				filterValue = alternativeValue;
			}

			updateFilterURL(select.data('urlParam'), filterValue);
		}

		$.ajax({ // you can also use $.post here
			url : c3ai_blog_filter_params.ajaxurl, // AJAX handler
			data : data,
			type : 'POST',
			beforeSend : function ( xhr ) {
				innerContent.text('Loading...'); // change the button text, you can also add a preloader image
				loadMoreBtn.hide(); // Hide load more button for now
			},
			success : function( response ){
				if( response.data ) {
					var maxpages = response.max_num_pages;
					if ( ! maxpages && maxpages !== 0 ) maxpages = c3ai_blog_filter_params.max_page; 
					innerContent.html(response.data); // insert new posts
 					loadMoreBtn.attr('data-catfilter',catFilter);
 					loadMoreBtn.attr('data-datefilter',dateFilter);
 					loadMoreBtn.attr('data-current_page', 1);
 					loadMoreBtn.attr('data-maxpages', maxpages);
					if ( maxpages > 1 ) {
						loadMoreBtn.show(); // if last page, remove the button
					}

					// Add is-visible to filtered results.
					// Added to event loop to allow stack to complete for animation
					setTimeout(function() {
						innerContent.find('.cell[data-reveal-animation="slide-up"]:not(.is-visible)').each(function(index, element) {
							element.classList.add('is-visible');
						});
					}, 0);
				}
				else {
					innerContent.html("<h2>No results found.</h2>");
				}
			}
		});
	});
	
	// Certain browsers (Chrome) carry the selected values when you click the back button, yet not the filtered articles
	// Thus upon page load, we check if the filters are set and if yes, trigger the change programatically
	// Now, this also automatically filters the predefined values coming from updateFilterURL()
	$(document).ready(function() {
		blogFilters.find('select').each(function(){
			if ($(this).val() != '') {
				$(this).trigger("change");
				return true;
			}
		});
	});
});