class InstamapController < ApplicationController

  def index
    flash[:notice] = "Welcome to Instamap"
  end

  def places
    @instagrams = Instagram.media_search(params[:lat], params[:lng], count: 200).data.sort { |x, y| y.likes["count"] <=> x.likes["count"] }

    respond_to do |format|
      format.json { render :json => { :instagram => render_to_string(:partial => "thumbnails", :formats => [:html]) } }
    end
  end

  def comments
    @comments = Instagram.media_comments(params[:id], count: 200)
    render :json => @comments
  end

  def contact
    @name    = params[:name]
    @email   = params[:email]
    @message = params[:message]
    if @name.blank? || @email.blank? || @message.blank?
      flash[:notice] = "You must fill out all the required fields"
      redirect_to root_path
    else
      UserMailer.contact(@name, @email, @message).deliver
      flash[:success] = "Your message has been successfully sent and you should receive a response within 24 hours."
      redirect_to root_path
    end
  end
end