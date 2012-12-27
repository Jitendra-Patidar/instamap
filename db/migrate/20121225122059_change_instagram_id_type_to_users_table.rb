class ChangeInstagramIdTypeToUsersTable < ActiveRecord::Migration
  def change
  	change_column :users, :instagram_id, :string
  end
end
