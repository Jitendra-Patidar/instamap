var Tooltip = {
  show: function() {
    $("#following").hide();
    $("#followers_link").tooltip({ placement: "right" });
    $("#following_link").tooltip({ placement: "right" });
    $(".img-circle").tooltip({ placement: "top" });
    if ($("#following_link").on("click", function(event) {
      event.preventDefault();
      $("#followers").slideUp(1050);
      $("#following").show();
    }));
    if ($("#followers_link").on("click", function(event) {
      event.preventDefault();
      $("#following").slideUp(1050);
      $("#followers").show();
    }));
  }
};