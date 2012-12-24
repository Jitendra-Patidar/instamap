class UserMailer < ActionMailer::Base
  default from: "rvbsanjose@me.com"

  def contact(name, email, message)
    @name    = name
    @email   = email
    @message = message
    mail(to: "rvbsanjose@me.com", subject: "New message received from Instamap")
  end
end
