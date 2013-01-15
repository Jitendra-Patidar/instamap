# This file is used by Rack-based servers to start the application.

require ::File.expand_path('../config/environment',  __FILE__)
run Instamap::Application
use Rack::CanonicalHost, ENV['CANONICAL_HOST'] if ENV['CANONICAL_HOST']