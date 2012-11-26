class InstaMediaController < ApplicationController

	def index
		@medias = Instagram.media_popular(count: 200)
	end

	def places
		instagram = Instagram.media_search(params[:lng], params[:lat], count: 20)
		render :json => { :success => true, 
										  :instagram => render_to_string(:partial => "thumbnails", 
											:locals => { :medias => instagram }) 
										}
	end

	def show
		@media 		= Instagram.media_item(params[:id])
		@comments = Instagram.media_comments(params[:id], count: 200)
	end
end