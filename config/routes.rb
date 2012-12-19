Instamap::Application.routes.draw do

  root to: "instamap#index"

  match "/places", to: "instamap#places", as: :places

  match "/comments", to: "instamap#comments", as: :comments
  
end
