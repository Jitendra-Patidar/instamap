require "spec_helper"

describe UsersController do

	describe "#login" do
	  it "redirects to Instagram to login" do
	    get :login
	    response.should redirect_to "https://api.instagram.com/oauth/authorize/?client_id=12ffc303a02944f2a42f552ebf8502cd&redirect_uri=http://test.host/generate_token&response_type=code&scope=comments+relationships+likes"
	  end
	end

	describe "#show" do

		before :each do
			@user = User.find_by_username("rvbsanjose")
		end

		context "when session[:user] is not nil" do
		  
		  it "should have a user with status 200" do
		    get :show, { username: "rvbsanjose" }
		    response.status.should be 200
		  end

		  it "should contain the user" do
		  	get :show, { username: "rvbsanjose" }
		    response.body.should_not be_nil
		  end

		  specify { Instagram.user_recent_media(@user.instagram_id, options = { access_token: @user.access_token }).should_not be_nil }

		  specify { Instagram.user(@user.instagram_id).should_not be_nil }

		  specify { Instagram.user_follows(@user.instagram_id, options = { access_token: @user.access_token }).should_not be_nil }

		  specify { Instagram.user_followed_by(@user.instagram_id, options = { access_token: @user.access_token }).should_not be_nil }

		end

		context "when session[:user] is nil" do

			before :all do
				@instagram_user = Instagram.user_search("stancenation").first
			end

			it "grabs who the user follows" do
				expect { Instagram.user_follows(@instagram_user.id, options = { access_token: @user.access_token }) }.to_not raise_error
			end

			it "grabs who follows the user" do
				expect { Instagram.user_followed_by(@instagram_user.id, options = { access_token: @user.access_token }) }.to_not raise_error
			end
		end

		context "when it does not have a user param" do

			it "returns status 302" do
				get :show, { username: "" }
				response.status.should be 302
			end
		end
	end

	describe "#comments" do
		context "when passed the correct media id" do
	  
		  it "gets comments for the media" do
		    get :comments, { id: "361125177477624988_14895060" }
		    response.should be_success
		  end

		  it "should not raise an error" do
		  	expect { get :comments, { id: "361125177477624988_14895060" } }.to_not raise_error
		  end

		  it "returns an array of length greater then 0 for media with comments" do
		  	get :comments, { id: "361125177477624988_14895060" }
		  	response.body.length.should be > 0
		  end

		  it "returns status 200" do
		  	get :comments, { id: "361125177477624988_14895060" }
		  	response.status.should be 200
		  end
		end

		context "when passed the incorrect media id" do

			it "should raise an error" do
				expect { get :comments, { id: "3611251774" } }.to raise_error
			end

			it "returns an empty array for media with comments" do
				get :comments, { id: "223402934" }
				response.body.should eq("[]")
			end

			it "returns Instagram::BadRequest" do
				expect { get :comments, { id: "lskefj" } }.to raise_error(Instagram::BadRequest)
			end
		end
	end
  
  describe "#logout" do
	
  	it "clears the sesssion" do
  		session[:user] = "Larry"
  		get :logout
  		session[:user].should be_nil
  	end
	end
end