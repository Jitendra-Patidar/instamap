require "spec_helper"

describe InstamapController do

	describe "#new" do
		it
	end

	describe "#places" do
		context "when arguments are not passed correctly" do
		  
		  it "should expect two arguments" do
		  	expect { Instagram.media_search(40.7142) }.to raise_error
			end

			it "should have a length of 0" do
				media = Instagram.media_search(-74.0064, -40.7142)
				media.data.length.should eq 0
			end
		end

		context "when passed the correct arguments" do

			it "should not raise error" do
				expect { Instagram.media_search(40.7142, 74.0064) }.to_not raise_error
			end

			it "should not return more images then count passed in the options hash" do
				Instagram.media_search(40.7142, -74.0064, options = { count: 5 }).length.should_not be > 5
			end
		end
	end
  
end