Instamap::Application.routes.draw do

  root to: "instamap#index"

  match "/image/:id", to: "instamap#show", as: :show

  match "/places", to: "instamap#places", as: :places

  match "/comments", to: "instamap#comments", as: :comments
  
end
