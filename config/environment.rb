# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
Instamap::Application.initialize!

# Don't care if the mailer can't send
  config.action_mailer.raise_delivery_errors = true

# Change mail delvery to either :smtp, :sendmail, :file, :test
config.action_mailer.delivery_method = :smtp

config.action_mailer.smtp_settings = {
  address: "smtp.gmail.com",
  port: 587,
  domain: "instamap.it",
  authentication: "plain",
  enable_starttls_auto: true,
  user_name: "rvbsanjose@gmail.com",
  password: "movadodo"
}