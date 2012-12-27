class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string  :access_token,    null: false
      t.integer :instagram_id,    null: false
      t.string  :username,        null: false
      t.string  :full_name,       null: true
      t.string  :profile_picture, null: true

      t.timestamps
    end
  end
end
