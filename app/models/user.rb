class User < ActiveRecord::Base
  attr_accessible :access_token, :full_name, :instagram_id, :profile_picture, :username

  def new_user(instagram_user)
    User.create(
      access_token:    instagram_user["access_token"],
      instagram_id:    instagram_user["user"]["id"],
      username:        instagram_user["user"]["username"],
      full_name:       instagram_user["user"]["full_name"],
      profile_picture: instagram_user["user"]["profile_picture"]
    )
  end
end
