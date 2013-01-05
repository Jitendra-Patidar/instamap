require "spec_helper"

describe UsersController do

	describe "#show" do
		
		before :each do
			@user = User.find_by_username("rvbsanjose")
		end

		context "when user is an instamap user" do
		  
		  it "should have a user with status 200" do
		    get :show, { username: "rvbsanjose" }
		    response.status.should be 200
		  end

		  it "should contain the user" do
		  	get :show, { username: "rvbsanjose" }
		    response.body.should_not be_nil
		  end

		  it "should get the users media" do
		  	images = Instagram.user_recent_media(@user.instagram_id, options = { access_token: @user.access_token })
		  	images.should_not be_nil
		  end

		  it "should get the users stats" do
		  	stats = Instagram.user(@user.instagram_id)
		  	stats.should_not be_nil
		  end

		  it "should get who the user follows" do
		  	follows = Instagram.user_follows(@user.instagram_id, options = { access_token: @user.access_token })
		  	follows.should_not be_nil
		  end

		  it "should get who follows the user" do
		  	following = Instagram.user_followed_by(@user.instagram_id, options = { access_token: @user.access_token })
		  	following.should_not be_nil
		  end
		end

		context "when user is an instagram user" do

			it "should be able to grab the users media" do
				@instagram_user = Instagram.user_search("stancenation").first
				expect { Instagram.user_recent_media(@instagram_user.id, options = { access_token: @user.access_token }) }.to_not raise_error
			end

			it "should be able to grab who the user follows" do
				@instagram_user = Instagram.user_search("stancenation").first
				expect { Instagram.user_follows(@instagram_user.id, options = { access_token: @user.access_token }) }.to_not raise_error
			end

			it "should be able to grab who follows the user" do
				@instagram_user = Instagram.user_search("stancenation").first
				expect { Instagram.user_followed_by(@instagram_user.id, options = { access_token: @user.access_token }) }.to_not raise_error
			end
		end

		context "when it does not have a user param" do

			it "should return status 302" do
				get :show, { username: "" }
				response.status.should be 302
			end
		end
	end
  
  describe "#logout" do
	
  	it "should clear the sesssion" do
  		session[:user] = "Larry"
  		get :logout
  		session[:user].should be_nil
  	end
	end
end