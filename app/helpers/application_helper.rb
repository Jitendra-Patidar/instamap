module ApplicationHelper
  def comma_number(number)
    number_with_delimiter(number, :delimiter => ",")
  end
end
