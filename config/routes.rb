Instamedia::Application.routes.draw do

  root to: "insta_media#index"

  match "/places", to: "insta_media#places", as: :places
  
end
