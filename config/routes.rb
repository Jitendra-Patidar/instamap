Instamap::Application.routes.draw do
  root to: 'instamap#index'

  match '/places',           to: 'instamap#places',      as: :places
  match '/contact',          to: 'instamap#contact',     as: :contact
  match '/comments',         to: 'users#comments',       as: :comments
  match '/image', 				   to: 'users#image', 				 as: :image
  match '/like',             to: 'users#like',           as: :like
  match '/login',            to: 'users#login',          as: :login
  match '/logout',           to: 'users#logout',         as: :logout
  match '/generate_token',   to: 'users#generate_token', as: :generate_token
  match '/user/(:username)', to: 'users#show',           as: :show
  match '/popular',          to: 'instamap#popular',     as: :popular
  match '/follow',           to: 'users#follow',         as: :follow
  match '/search',           to: 'users#search',         as: :search
end