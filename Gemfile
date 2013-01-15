source 'https://rubygems.org'

gem 'rails', '3.2.11'
gem 'instagram'
gem 'bootstrap-sass'
gem 'httparty'
gem 'haml-rails'

# Bundle edge Rails instead:
# gem 'rails', :git => 'git://github.com/rails/rails.git'

group :development, :test, :production do
  gem 'pg'
end

group :development do
  gem 'rspec-rails'
  platform :ruby_19 do
    gem 'linecache19', :git => 'git://github.com/mark-moseley/linecache'
    gem 'ruby-debug-base19x', '~> 0.11.30.pre4'
    gem "ruby-debug19"
  end
end

group :test do
  gem 'simplecov', :require => false
end

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails',   '~> 3.2.3'
  gem 'coffee-rails', '~> 3.2.1'

  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  # gem 'therubyracer', :platforms => :ruby

  gem 'uglifier', '>= 1.0.3'
end

gem 'jquery-rails'

# To use ActiveModel has_secure_password
# gem 'bcrypt-ruby', '~> 3.0.0'

# To use Jbuilder templates for JSON
# gem 'jbuilder'

# Use unicorn as the app server
# gem 'unicorn'

# Deploy with Capistrano
# gem 'capistrano'

# To use debugger
# gem 'debugger'
