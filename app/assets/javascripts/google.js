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