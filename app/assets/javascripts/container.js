var Container = {
  loader: function() {
    $(".container").prepend("<img id=\"loader\" src=\"assets/ajax-loader.gif\" />")
  },

  sad_face: function() {
    $(".container").prepend("<div id=\"sad_face\" class=\"center alert alert-danger\"><img src=\"/assets/sad-face.png\" /><strong>&nbsp;&nbsp;Oh no! No Instagram images were found in this area, come back when this town gets up to speed with technology!</strong></div>");
    setTimeout(function() {
      $("#sad_face").slideUp(500);
    }, 5000);
  }
};