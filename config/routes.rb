Instamedia::Application.routes.draw do

  root to: "insta_media#index"

  match "/image/:id", to: "insta_media#show", as: :show

  match "/places", to: "insta_media#places", as: :places
  
end
