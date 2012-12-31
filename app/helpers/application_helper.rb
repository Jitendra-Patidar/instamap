module ApplicationHelper
  def comma_number(number)
    number_with_delimiter(number, :delimiter => ",")
  end

  def title(page_title)
  	content_for(:title) { page_title }
  end
end
