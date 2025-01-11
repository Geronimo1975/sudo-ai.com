jQuery(function($){ // use jQuery code inside this to avoid "$ is not defined" error
	$(".search-submit-icon").click(function(e) {
		e.preventDefault();
	    $("#searchModal").foundation("open");
	});
	function form_submit() {
    	document.getElementById("search_form").submit();
   	}   

	/*var searchInput = $("input.modal-search-input");
	var searchQuery;
	searchInput.keyup(function(event) {
	    if (event.key === "Enter") {
	    	searchQuery = $(this).val();
	    	var data = {
				'action': 'search_modal',
				'query': c3ai_search_modal_params.posts, // that's how we get params from wp_localize_script() function
				'page' : 1,
				'search':searchQuery
			};
			ajaxSearch(data);
		}
	});
	var loadMoreButton = $("#searchModal").find('.search_load_more');
	loadMoreButton.click(function(e){
    	var data = {
			'action': 'search_modal',
			'query': c3ai_search_modal_params.posts, // that's how we get params from wp_localize_script() function
			'page' : c3ai_search_modal_params.current_page,
			'search':searchQuery
		};
		ajaxSearch(data,'loadmore');
	});

	function ajaxSearch(data,type) {
		type = type || 'search';
		data.type = type;
		$.ajax({ // you can also use $.post here
			url : c3ai_search_modal_params.ajaxurl, // AJAX handler
			data : data,
			type : 'POST',
			beforeSend : function ( xhr ) {
				if(type == 'loadmore')
				loadMoreButton.text('Loading...'); // change the button text, you can also add a preloader image
			},
			success : function( response ){
					var contentDiv = $("#searchModal .inner-content");

					if(type == 'search'){
						var searchInfo = $("#searchModal .search-info");
						searchInfo.hide();
						contentDiv.html("");
						c3ai_blog_loadmore_params.current_page = 1;
						if(response.max_num_pages > 1) {
							c3ai_search_modal_params.current_page = 2;
							loadMoreButton.show();
							c3ai_search_modal_params.max_page = response.max_num_pages;
						}
						else {
							loadMoreButton.hide();
						}

						searchInfo.find('.search-results-count').text(response.total);
						searchInfo.find('.search-query').text(searchQuery);
						searchInfo.show();
					}
					else {
						var text = loadMoreButton.data('text') || "View More";
						loadMoreButton.text( text );
						c3ai_blog_loadmore_params.current_page++;

						if (!data || c3ai_search_modal_params.current_page == c3ai_search_modal_params.max_page ) {
							loadMoreButton.hide();
						} 
					}
					contentDiv.append(response.data);
				}
		});
	}*/
});