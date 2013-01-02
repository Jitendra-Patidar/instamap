class InstamapController < ApplicationController

  def index
  end

  def places
    @instagrams = Instagram.media_search(params[:lat], params[:lng], options = { count: 200, distance: 5000 }).data.sort { |x, y| y.likes["count"] <=> x.likes["count"] }

    respond_to do |format|
      format.json { render :json => { :instagram => render_to_string(:partial => "thumbnails", :formats => [:html]) } }
    end
  end

  def comments
    @comments = Instagram.media_comments(params[:id], options = { count: 200 })
    render :json => @comments
  end

  def contact
    @name    = params[:name]
    @email   = params[:email]
    @message = params[:message]
    UserMailer.contact(@name, @email, @message).deliver
    redirect_to root_path
  end
end