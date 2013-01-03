var Fancy = {
  box: function(lat, lng, pid) {
    var street;
    var latLng = new google.maps.LatLng(lat, lng);
    var view   = new google.maps.StreetViewService();
    $(".fancybox").fancybox({
      width       : 1155, 
      height      : '95%',
      maxWidth    : '95%',
      maxHeight   : '95%',
      openEffect  : 'none',
      autoSize    : true,
      autoResize  : false,
      closeEffect : 'fade',
      scrolling   : 'auto',
      type        : 'iframe',
      helpers     : {
        media : {}
      },

      beforeShow: function() {
        view.getPanoramaByLocation(latLng, 100, function (streetViewPanoramaData, status) {
          if (status === google.maps.StreetViewStatus.OK) {
            var panoramaOptions = {
              addressControl: true,
              addressControlOptions: {
                style: { backgroundColor: 'grey', color: 'yellow' }
              },
              position: new google.maps.LatLng(streetViewPanoramaData.location.latLng.Ya, streetViewPanoramaData.location.latLng.Za),
              pov: {
                heading: 0,
                pitch: 0,
                zoom: 0
              }//end pov
            };//end panoramaOptions
            $(".fancybox-inner").prepend('<div id="street_view"></div>');
            $(".fancybox-inner").prepend(
              '<div id="lightbox_comments"></div>' +
              '<div id="comment_box">' + 
                '<textarea id="user_comment" class="span7 offset1"></textarea>' +
                '<br />' +
                '<div id="post_comment" class="btn btn-small btn-success">Post comment</div>' +
              '</div>'
            );
            street = new google.maps.StreetViewPanorama(document.getElementById("street_view"), panoramaOptions);
            Instagram.post();
          } else {
            var panoramaOptions = {
              addressControl: true,
              addressControlOptions: {
                style: { backgroundColor: 'grey', color: 'yellow' }
              },
              position: new google.maps.LatLng(lat, lng),
              pov: {
                heading: 0,
                pitch: 0,
                zoom: 0
              }
            };
            $(".fancybox-inner").prepend('<div id="street_view"></div>');
            $(".fancybox-inner").prepend('<div id="lightbox_comments"></div>');
            street = new google.maps.StreetViewPanorama(document.getElementById("street_view"), panoramaOptions);
            $("#street_view").html("<img id=\"not_available\" src=\"assets/not-available.jpeg\" />");
          }
        });

        $.ajax({
          type: 'get',
          url: "/comments",
          dataType: 'json',
          data: { id: pid },
          success: function(data) {
            if (data == "") {
              $("#lightbox_comments").append('<div id="no_comments" class="center alert alert-info span8">Be the first to leave a comment</div>');
            } else {
              $.each(data, function() {
                $("#lightbox_comments").append('<a href="' + window.location.origin + '/' + $(this)[0].from.username + '">' + $(this)[0].from.username + '</a> says: <br />' + $(this)[0].text + '<img src=' + $(this)[0].from.profile_picture + ' height=64 width=64 /><br /><br /><br />');
              }); //end each
            }// if/else
          }//end success
        });//end ajax
      }//end beforeShow
    });//end click
  },//end box
  
  run: function(object) {
    var lat    = $(object).data("lat");
    var lng    = $(object).data("long");
    var pid    = $(object).data("id");
    Fancy.box(lat, lng, pid);
  }//end run
};//end Fancy