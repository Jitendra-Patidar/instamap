$(document).ready(function() { $('#myModal').modal(); Instamap.init(); });

var Instamap = {
  init: function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(Google.geoPosition);
    } else {
      alert("Geolocation is not supported by this browser");
    };
  }
};

var Google = {
  map: null,
  markersArray: [],
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
    var image = "/assets/person.png";
    var marker = new google.maps.Marker({
      position: location,
      map: Google.map,
      title: "Your location",
      icon: image,
      animation: google.maps.Animation.DROP
    });

    Google.map.setZoom(15);
    Google.map.setCenter(marker.getPosition());

    if(Google.markersArray.length >= 1) {
      Google.markersArray[Google.markersArray.length-1].setMap(null);
    }

    Google.markersArray.push(marker);
    Google.map.setCenter(location);
  },

  placeIcon: function() {
    var image = "/assets/camera.png";
    var locations = $(".thumb");
    $.each(locations, function(){
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng($(this).attr("data-lat"), $(this).attr("data-long")),
        map: Google.map,
        icon: image,
        animation: google.maps.Animation.DROP
      });
      var infoWindow = new google.maps.InfoWindow({
        maxWidth: 900
      });
      var content =
        "<div class='infowindow'>" +
          "<img src='" + $(this).find("img").attr("src") +
        "' /></div>";
      Google.openWindow(marker, content, infoWindow);
    });
  },

  openWindow: function(marker, content, infowindow){
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(content);
      infowindow.open(Google.map, marker);
    });
  },

  geoPosition: function (position) {
    $(".search_btn").on("click", function(e) {
      $(".container").prepend("<img id=\"loader\" src=\"assets/ajax-loader.gif\" />");
      geocoder = new google.maps.Geocoder();
      e.preventDefault();
      var geocode_addy = $("#geocode_address").val();
      geocoder.geocode( { 'address': geocode_addy }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          Google.map.setZoom(15);
          Google.map.setCenter(results[0].geometry.location);
          var image = "/assets/person.png";
          var marker = new google.maps.Marker({
              map: Google.map,
              position: results[0].geometry.location,
              icon: image, 
              title: "Your searched location - " + geocode_addy
          });
          
          $.ajax({
            type: 'get',
            url: '/places',
            dataType: 'json',
            data: { lng: results[0].geometry.location.Ya, lat: results[0].geometry.location.Za },
            success: function(data) {
              $("#loader").remove();
              $(".imageSlider").html(data.instagram);
              Slider.flexi();
              Google.placeIcon();
            },
            error: function() {
              alert("Please refresh the page");
              $("#loader").remove();
            }
          });
        } else {
          alert("Geocode was not successful for the following reason: " + status);
          $("#loader").remove();
        }
      });
    });

    var latitude  = position.coords.latitude;
    var longitude = position.coords.longitude;
    var myLatlng = new google.maps.LatLng(latitude, longitude);
    var mapOptions = {
      zoom: 12,
      center: myLatlng,
      styles: Google.styles,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    Google.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

    $(".container").prepend("<img id=\"loader\" src=\"assets/ajax-loader.gif\" />");

    $.ajax({
      type: 'get',
      url: '/places',
      dataType: 'json',
      data: { lng: myLatlng.Ya, lat: myLatlng.Za },
      success: function(data) {
        $("#loader").remove();
        Google.placeMarker(myLatlng);
        $(".imageSlider").html(data.instagram);
        Slider.flexi();
        Google.placeIcon();
      },
      error: function() {
        alert("Please refresh the page");
        $("#loader").remove();
      }
    });

    google.maps.event.addListener(Google.map, 'click', function(event) {
      $(".container").prepend("<img id=\"loader\" src=\"assets/ajax-loader.gif\" />");
      Google.placeMarker(event.latLng);
      Instagram.ping(Google.map, event);
      $(Google.map).on('ajax:success', function(event, data) {
        if(data.instagram == ""){
          $(".imageSlider").html('<div class="no_results center alert alert-danger"><strong>Unfortunately no images where found for this geolocation.</strong></div>');
          $("#loader").remove();
        } else {
          $(".imageSlider").html(data.instagram);
          Slider.flexi();   
        }
      });
    });
  }
};

var Instagram = {
  ping: function(map, event) {
    debugger;
    var $self = $(map);
    $.ajax({
      type: 'get',
      url: '/places',
      dataType: 'json',
      data: { lng: event.latLng.Ya, lat: event.latLng.Za },
      success: function(data, status, xhr) {
        $self.trigger('ajax:success', [data, status, xhr]);
        Google.placeIcon();
        $("#loader").remove();
      },
      error: function(xhr, status, error) {
        $self.trigger('ajax:error', [xhr, status, error]);
      },
      complete: function(xhr, status) {
        $self.trigger('ajax:complete', [xhr, status]);
      }
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
    
    $(".thumb").on("click", function() {
      var street;
      var lat    = $(this).attr("data-lat");
      var lng    = $(this).attr("data-long");
      var pid    = $(this).attr("data-show-link").split("/").pop();
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
        beforeShow  : function() {
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
                }
              };
              $(".fancybox-inner").prepend('<div id="street_view"></div>');
              $(".fancybox-inner").prepend('<div id="lightbox_comments"></div>');
              street = new google.maps.StreetViewPanorama(document.getElementById("street_view"), panoramaOptions);
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
                });
              }
            }
          });
        }
      });
    });
  }
};
