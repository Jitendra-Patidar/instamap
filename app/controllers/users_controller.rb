class UsersController < ApplicationController

  after_filter :get_user, only: :generate_token

  def login
    redirect_to "https://api.instagram.com/oauth/authorize/?client_id=" + ENV["client_id"] + "&redirect_uri=" + 
                root_url + "generate_token&response_type=code&scope=comments+relationships+likes"
  end

  def generate_token
    @instagram_user = HTTParty.post("https://api.instagram.com/oauth/access_token",
                    body: {
                          client_id:      ENV["client_id"],
                          client_secret:  ENV["client_secret"],
                          grant_type:     "authorization_code",
                          redirect_uri:   root_url + "generate_token",
                          code:           params[:code]
                          } )
    
    @user = User.find_by_username(@instagram_user["user"]["username"])
    
    if @user.nil?
      @user         = User.new.new_user(@instagram_user)
      @current_user = User.find_by_username(@user.username)
      redirect_to show_path(@current_user.username)
    else
      redirect_to show_path(@user.username)
    end
  end

  def show
    @instamap_user      = User.find_by_username(params[:username])
    if @instamap_user.nil?
      begin
        @instagram_user = Instagram.user_search(params[:username]).first
        @images         = Instagram.user_recent_media(@instagram_user.id, options = { access_token: User.first.access_token, count: 200 })
        @stats          = Instagram.user(@instagram_user.id, options = { access_token: User.first.access_token })
        @following      = Instagram.user_follows(@instagram_user.id, options = { access_token: User.first.access_token })
        @follows        = Instagram.user_followed_by(@instagram_user.id, options = { access_token: User.first.access_token })
      rescue Instagram::BadRequest
        redirect_to     root_path, notice: "You are trying to access a private user"
      end
    else
      @images         = Instagram.user_recent_media(@instamap_user.instagram_id, options = { access_token: @instamap_user.access_token, count: 200 })
      @stats          = Instagram.user(@instamap_user.instagram_id, options = { access_token: @instamap_user.access_token })
      @following      = Instagram.user_follows(@instamap_user.instagram_id, options = { access_token: @instamap_user.access_token })
      @follows        = Instagram.user_followed_by(@instamap_user.instagram_id, options = { access_token: @instamap_user.access_token })
    end
  end

  def logout
    session[:user] = nil
    redirect_to root_path
  end

private

  def get_user
    session[:user] = @user
  end
end