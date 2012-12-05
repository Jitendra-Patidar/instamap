class InstaMediaController < ApplicationController

  def index
    @medias = Instagram.media_popular count: 200
  end

  def places
    @instagram = Instagram.media_search(params[:lng], params[:lat],
                                      count: 200).data.sort {|x, y| y.likes["count"] <=> x.likes["count"] }

    respond_to do |format|
      format.json { render :json => {
        :instagram => render_to_string(:partial => "thumbnails",
        :formats => [:html]) }
      }
    end
  end

  def show
    @media     = Instagram.media_item(params[:id])
    @comments  = Instagram.media_comments(params[:id], count: 200)
    @user      = Instagram.user(@media.user.id)
  end
end