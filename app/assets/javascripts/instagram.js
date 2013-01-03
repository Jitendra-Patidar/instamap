var Instagram = {
  ping: function(latitude, longitude) {
    var myLatlng = new google.maps.LatLng(latitude, longitude);
    $.ajax({
      type: 'get',
      url: '/places',
      dataType: 'json',
      data: { lat: latitude, lng: longitude },
      success: function(data) {
        $("#loader").remove();
        if (data.instagram.length == 122) {
          Container.sad_face();
        } else {
          Google.placeMarker(myLatlng);
          $(".imageSlider").html(data.instagram);
          Slider.flexi();
          $(".thumb").on("click", function() {
            Fancy.run(this);
          });//end on click
          Google.placeIcon();
        }
      },//end success
      error: function() {
        alert("Please refresh the page");
        $("#loader").remove();
      }//end error
    });//end ajax
  },//end ping

  post: function() {
    $("#post_comment").on("click", function() {
      alert("Posting comments is currently disable while we wait for approval from Instagram");
    });
  }
};