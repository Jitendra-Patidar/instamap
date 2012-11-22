class InstaMediaController < ApplicationController

	def index
		@medias = Instagram.media_popular
	end

	def places
		instagram = Instagram.media_search(params[:lng], params[:lat])
		render :json => { :success => true, 
										  :instagram => render_to_string(:partial => "thumbnails", 
											:locals => { :medias => instagram }) }
	end
end
