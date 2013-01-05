require "spec_helper"

describe InstamapController do

	describe "#new" do
		it "should load the page" do
			get :index
			response.should be_success
		end

		it "should render the index view" do
			get :index
			response.should render_template(:index)
		end
	end

	describe "#places" do
		context "when arguments are not passed correctly" do
		  
		  it "should expect at least two arguments" do
		  	expect { Instagram.media_search(40.7142) }.to raise_error
			end

			it "should have an array length of 0" do
				media = Instagram.media_search(-74.0064, -40.7142)
				media.data.length.should eq 0
			end
		end

		context "when arguments are passed correctly" do

			it "should not raise error" do
				expect { Instagram.media_search(40.7142, -74.0064) }.to_not raise_error
			end

			it "should not return more images then count passed in the options hash" do
				Instagram.media_search(40.7142, -74.0064, options = { count: 5 }).length.should_not be > 5
			end
		end
	end

	describe "#comments" do
		context "when passed the correct media id" do
	  
		  it "should get comments for the media" do
		    get :comments, { id: "361125177477624988_14895060" }
		    response.should be_success
		  end

		  it "should not raise an error" do
		  	expect { get :comments, { id: "361125177477624988_14895060" } }.to_not raise_error
		  end

		  it "should return an array of length greater then 0 for media with comments" do
		  	get :comments, { id: "361125177477624988_14895060" }
		  	response.body.length.should be > 0
		  end

		  it "should return status 200" do
		  	get :comments, { id: "361125177477624988_14895060" }
		  	response.status.should be 200
		  end
		end

		context "when passed the incorrect media id" do

			it "should raise an error" do
				expect { get :comments, { id: "3611251774" } }.to raise_error
			end

			it "should return an empty array for media with comments" do
				get :comments, { id: "223402934" }
				response.body.should eq("[]")
			end

			it "should return Instagram::BadRequest" do
				expect { get :comments, { id: "lskefj" } }.to raise_error(Instagram::BadRequest)
			end
		end
	end
  
end