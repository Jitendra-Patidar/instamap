var Modal = {
  show: function() {
    $("#about_us").on("click", function(event) {
      event.preventDefault();
      $("#myModal").modal();
      $(".contact").show();
      $(".controls").show();
      $("#name, #email, #message").val("");
      $(".nav-tabs li").on("click", function() {
        var selection = $(this).text();
        if (selection == "About" || selection == "Contact") {
          $("#myModalLabel").text(selection + " us");
        } else {
          $("#myModalLabel").text(selection + " use Instamap");
        }
      });
      $(".contact").on("click", function(event) {
        event.preventDefault();
        var paths = ["#name", "#email", "#message"];
        for (var index = 0; index < 3; index++) {
          if ($(paths[index]).val().length == 0) {
            $(paths[index]).closest("div.control-group").addClass("error");
          } else {
            $(paths[index]).closest("div.control-group").removeClass("error");
          }
        }
        if ($("#name").val().length > 0 && $("#email").val().length > 0 && $("#message").val().length > 0) {
          $(".contact").hide();
          $(".modal-body").append("<img id=\"contact-loader\" src=\"assets/ajax-loader.gif\" />");
          $.ajax({
            type: "post",
            url: "/contact",
            dataType: "html",
            data: { name: $("#name").val(), email: $("#email").val(), message: $("#message").val() },
            success: function() {
              $("#modal-errors").prepend("<div id=\"contact-success\" class=\"center alert alert-success\">Message successfully sent");
              $(".controls").hide();
              $("#contact-loader").remove();
              setTimeout(function() {
                $("#contact-success").remove();
                $("#myModal").modal("hide");
              }, 1050);
            },
            error: function() {
              alert("Oops. Something weird happen. Please try submitting the contact form again.");
            }
          });
        }
      });
    });
  }
};