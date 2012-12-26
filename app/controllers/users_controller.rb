class UsersController < ApplicationController

  before_filter :get_user, except: [:login, :generate_token]

	def login
    redirect_to "https://api.instagram.com/oauth/authorize/?client_id=b3d509571728426b92a190d4057debc9&redirect_uri=" + 
                root_url + "generate_token&response_type=code&scope=comments+relationships+likes"
  end

  def generate_token
    @instagram_user = HTTParty.post("https://api.instagram.com/oauth/access_token",
                    body: {
                          client_id:      "b3d509571728426b92a190d4057debc9",
                          client_secret:  "2e514b30a2384d16b5916aefe6b85812",
                          grant_type:     "authorization_code",
                          redirect_uri:   root_url + "generate_token",
                          code:           params[:code]
                          } )
    
    @user = User.find_by_username(@instagram_user["user"]["username"])
    
    if @user.nil?
      new_user
    else
      redirect_to show_path(@user.username)
    end
  end

  def new_user
    @user = User.create(
      access_token:    @instagram_user["access_token"],
      instagram_id:    @instagram_user["user"]["id"],
      username:        @instagram_user["user"]["username"],
      full_name:       @instagram_user["user"]["full_name"],
      profile_picture: @instagram_user["user"]["profile_picture"]
    )

    @current_user = User.find_by_username(@user.username)
    redirect_to show_path(@current_user.username)
  end

  def show
    @current_user = User.find_by_username(params[:username])
    @images = Instagram.user_recent_media(@current_user.instagram_id, options = { access_token: @current_user.access_token })
  end

private

  def get_user
    session[:user] = @current_user
  end
end