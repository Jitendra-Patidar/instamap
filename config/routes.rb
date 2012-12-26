Instamap::Application.routes.draw do

  root to: "instamap#index"

  match "/image/:id", to: "instamap#show", as: :show

  match "/places", to: "instamap#places", as: :places

  match "/comments", to: "instamap#comments", as: :comments

  match "/contact", to: "instamap#contact", as: :contact

  match "/login", to: "users#login", as: :login

  match "/generate_token", to: "users#generate_token", as: :generate_token

  match "/:username", to: "users#show", as: :show
  
end