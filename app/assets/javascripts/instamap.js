$(document).ready(function() {
  Modal.show();
  Instamap.init();
});

var Instamap = {
  init: function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(Google.geoPosition);
    } else {
      alert("Get on a modern browser that supports geolocation like Chrome or Firefox to use this app");
    };
  }
};

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

var Google = {
  map: null,
  styles: [
    {
      featureType: "all",
      stylers: [
        { saturation: -50 },
        { gamma: 1.51 }
      ]
    },{
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [
        { hue: "#403D3A" },
        { saturation: 80 }
      ]
    },{
      featureType: "poi.business",
      elementType: "labels",
      stylers: [
        { visibility: "on" }
      ]
    }
  ],

  placeMarker: function(location) {
    var image = "/assets/custom_marker.png";
    var marker = new google.maps.Marker({
      position: location,
      map: Google.map,
      title: "Your location",
      icon: image,
      animation: google.maps.Animation.DROP
    });
    Google.map.setZoom(15);
    Google.map.setCenter(marker.getPosition());
  },

  placeIcon: function() {
    var image = "/assets/camera.png";
    var instagrams = $('#instagrams').data('instagrams');
    var infoWindow = new google.maps.InfoWindow();
    $.each(instagrams, function(index, instagram) {
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(instagram.location.latitude, instagram.location.longitude),
        map: Google.map,
        icon: image,
        animation: google.maps.Animation.DROP
      });
      var content =
        "<div id=\"infowindow\">" +
          "<img src=" + instagram.images.thumbnail.url + " />" +
        "</div>";
      Google.openWindow(marker, content, infoWindow);
    });
  },

  openWindow: function(marker, content, infowindow) {
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.close();
      infowindow.setContent(content);
      infowindow.open(Google.map, marker);
    });
    $(".thumb").on("mouseenter", function() {
      // if ($(this).data("thumb") == content.match(/([^<div id="infowindow"><img src=](.)+[^ \/><\/div>])/)[0]) {
      if ($(this).data("thumb") == $(content).find('img').attr('src')) {  
        infowindow.setContent(content);
        infowindow.open(Google.map, marker);
      }
    });
    $(".thumb").on("mouseleave", function() {
      infowindow.close();
    });
  },

  instaGeocode: function() {
    $(".search_btn").on("click", function(e) {
      Container.loader();
      geocoder = new google.maps.Geocoder();
      e.preventDefault();
      var address = $("#geocode_address").val();
      geocoder.geocode( { 'address': address }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          Google.map.setZoom(15);
          Google.map.setCenter(results[0].geometry.location);
          var image = "/assets/custom_marker.png";
          var marker = new google.maps.Marker({
              map: Google.map,
              position: results[0].geometry.location,
              icon: image, 
              title: "Your searched location - " + address
          });//end Marker
          
          Instagram.ping(results[0].geometry.location.Ya, results[0].geometry.location.Za);

        } else {
          alert("Geocode was not successful for the following reason: " + status);
          $("#loader").remove();
        }//end else
      });//end geocoder
    });//end on (search button click)
  },

  geoPosition: function (position) {
    Google.instaGeocode();
    var latitude  = position.coords.latitude;
    var longitude = position.coords.longitude;
    var myLatlng = new google.maps.LatLng(latitude, longitude);
    var mapOptions = {
      zoom: 12,
      center: myLatlng,
      styles: Google.styles,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }//end mapOptions

    Google.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

    Container.loader();

    Instagram.ping(myLatlng.Ya, myLatlng.Za);

    google.maps.event.addListener(Google.map, 'click', function(event) {
      Container.loader();
      Google.placeMarker(event.latLng);
      Instagram.ping(event.latLng.Ya, event.latLng.Za);
    });//end addListener
  }//end geoPosition
};//end Google

var Instagram = {
  ping: function(latitude, longitude) {
    var myLatlng = new google.maps.LatLng(latitude, longitude);
    $.ajax({
      type: 'get',
      url: '/places',
      dataType: 'json',
      data: { lat: latitude, lng: longitude },
      success: function(data) {
        debugger
        $("#loader").remove();
        if (data.instagram.length == 122) {
          Container.sad_face();
        } else {
          Google.placeMarker(myLatlng);
          $(".imageSlider").html(data.instagram);
          Slider.flexi();
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
      alert($("#user_comment").val());
    });
  }
};

var Slider = {
  flexi: function() {
    $(".flexslider").flexslider({
      animation: "slide",
      animationLoop: true,
      slideshow: false,
      itemWidth: 160,
      itemMargin: 5
    });
    Fancy.box();
  }
};

var Fancy = {
  box: function() {
    $(".thumb").on("click", function() {
      var street;
      var lat    = $(this).data("lat");
      var lng    = $(this).data("long");
      var pid    = $(this).data("id");
      var latLng = new google.maps.LatLng(lat, lng);
      var view   = new google.maps.StreetViewService();

      $(".fancybox").fancybox({
        padding     : 5,
        width       : '90%',
        height      : '95%',
        scrolling   : 'no',
        openEffect  : 'none',
        closeEffect : 'fade',
        helpers : {
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
                '<div id="comment_box" class="span6">' + 
                  '<textarea id="user_comment"></textarea>' +
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
                $("#lightbox_comments").append('<div class="span6 center alert alert-danger">No comments at this time...</div>');
              } else {
                $.each(data, function() {
                  $("#lightbox_comments").append('<div class="span4">' + $(this)[0].text + "</div><div class=\"span2\"><img src=" + $(this)[0].from.profile_picture + " height=64 width=64 /><div></div><br /><br />");
                }); //end each
              }//end else
            }//end success
          });//end ajax
        }//end beforeShow
      });//end fancybox
    });//end click
  }//end box
};//end Fancy
