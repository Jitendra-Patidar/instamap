class InstamapController < ApplicationController

  def index
    @medias = Instagram.media_popular
  end

  def places
    @instagram = Instagram.media_search(params[:lng], params[:lat], count: 200)#.data.sort { |x, y| y.likes["count"] <=> x.likes["count"] }

    respond_to do |format|
      format.json { render :json => { :instagram => render_to_string(:partial => "thumbnails", :formats => [:html]) } }
    end
  end

  def comments
    @comments = Instagram.media_comments(params[:id], count: 200)
    render :json => @comments
  end
end