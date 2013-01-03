$(document).ready(function() {
  Modal.show();
  Tooltip.show();
  Flash.show();
  Instamap.init();
});

var Instamap = {
  init: function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position){
        var latitude  = position.coords.latitude;
        var longitude = position.coords.longitude;
        Google.geoPosition(latitude, longitude);
      }, function(){
        Google.geoPosition(40.69847032728747, -73.9514422416687);
      });
    } else {
      Google.geoPosition(40.69847032728747, -73.9514422416687);
    };//end else
  },//end init
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

var Flash = {
  show: function() {
    setTimeout(function() {
      $("#flash").slideUp("slow");
    }, 4000);
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
  iconsArray: [],
  placeMarkerArray: [],
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
    Google.deleteIcons(Google.placeMarkerArray);
    var image = "/assets/custom_marker.png";
    if (window.location.pathname == "/") {
      var marker = new google.maps.Marker({
        position: location,
        map: Google.map,
        title: "Your location",
        icon: image,
        animation: google.maps.Animation.DROP
      });
      Google.placeMarkerArray.push(marker);
      Google.map.setZoom(13);
      Google.map.setCenter(marker.getPosition());
    } else {
      var find_location = $("#instagrams").data("instagrams");
      var location;
      $.each(find_location, function() {
        if ($(this).attr("location") != null) {
          location = $(this).attr("location");
        }
      });
      if (location.latitude && location.longitude != null) {
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(location.latitude - .01, location.longitude),
          map: Google.map,
          title: $(".label.label-important").text() + " location",
          icon: image,
          animation: google.maps.Animation.DROP
        });
        Google.map.setZoom(8);
        Google.map.setCenter(marker.getPosition());
      } else {
        Google.map.setZoom(4);
      }
    }
  },

  placeIcon: function() {
    Google.deleteIcons(Google.iconsArray);
    var image = "/assets/camera.png";
    var instagrams = $('#instagrams').data('instagrams');
    var infoWindow = new google.maps.InfoWindow();
    $.each(instagrams, function() {
      if ($(this).attr("location") != null) {
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng($(this).attr("location").latitude, $(this).attr("location").longitude),
          map: Google.map,
          icon: image,
          animation: google.maps.Animation.DROP
        });
        Google.iconsArray.push(marker);
        var content =
          "<div id=\"infowindow\">" +
            "<img src=" + $(this).attr("images").thumbnail.url + " />" +
          "</div>";
        Google.openWindow(marker, content, infoWindow);
      }
    });
  },

  deleteIcons: function(array){
    if (array) {
      for (var counter = 0; counter < array.length; counter++) {
        array[counter].setMap(null);
      }
      array.length = 0;
    }
  },

  openWindow: function(marker, content, infowindow) {
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.close();
      infowindow.setContent(content);
      infowindow.open(Google.map, marker);
      Google.infowindowLightbox();
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
      var geocoder = new google.maps.Geocoder();
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

  geoPosition: function(latitude, longitude) {
    Google.instaGeocode();
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
  },//end geoPosition

  infowindowLightbox: function() {
    $('.street_view').click(function(){
      var infowindow_pic = $(this).parent().find('img').attr('src');
      var thumbs = $('.thumb');
      $.each(thumbs, function() {
        if ($(this).data("thumb") == infowindow_pic) {
          Fancy.run(this);
        }
      });//end each
    });//end click
  }//end infowindowLightbox
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

var Slider = {
  flexi: function() {
    $(".flexslider").flexslider({
      animation: "slide",
      animationLoop: true,
      slideshow: false,
      itemWidth: 160,
      itemMargin: 5
    });
  }
};

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
