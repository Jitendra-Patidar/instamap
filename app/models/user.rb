class User < ActiveRecord::Base
  attr_accessible :access_token, :full_name, :instagram_id, :profile_picture, :username
end
