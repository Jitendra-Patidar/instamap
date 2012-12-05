$(document).ready(function() { Instamedia.init(); });

var Instamedia = {
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
        { visibility: "off" }
      ]
    }
  ],

  init: function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(Instamedia.showPosition);
    } else {
      alert("Geolocation is not supported by this browser");
    };

    Instamedia.myPic();
  },

  myPic: function () {
    var $container = $('.container');
    $container.imagesLoaded(function(){
      $container.masonry({
        itemSelector : '.thumbnail',
        gutterWidth : 15,
        isFitWidth: true
      });
    });
  },

  showPosition: function (position) {
    var latitude  = position.coords.latitude;
    var longitude = position.coords.longitude;
    var myLatlng = new google.maps.LatLng(latitude, longitude);
    var mapOptions = {
      zoom: 8,
      center: myLatlng,
      styles: Instamedia.styles,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    Instamedia.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

    google.maps.event.addListener(Instamedia.map, 'click', function(event) {
      Instamedia.placeMarker(event.latLng);
      Instamedia.pingInstagram(Instamedia.map, event);
    });

    $(Instamedia.map).on('ajax:success', function(event, data) {
      if(data.instagram == ""){
        $(".container").html('<div class="center alert alert-danger"><strong>Unfortunately no images where found for this geolocation.</strong></div>');
      } else {
        $(".container").html(data.instagram);
        $(".container").imagesLoaded(function(){
          $(".container").masonry({
            itemSelector : '.thumbnail',
            gutterWidth : 15,
            isFitWidth: true
          });
        });
        $(".container").masonry("reload");
      }
    });
  },

  placeMarker: function(location) {
    var marker = new google.maps.Marker({
      position: location,
      map: Instamedia.map,
      animation: google.maps.Animation.DROP
    });

    if(Instamedia.markersArray.length >= 1) {
      Instamedia.markersArray[Instamedia.markersArray.length-1].setMap(null);
    }

    Instamedia.markersArray.push(marker);
    Instamedia.map.setCenter(location);
  },

  placeImage: function() {
    var locations = $(".thumbnail");
    $.each(locations, function(){
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng($(this).attr("data-lat"), $(this).attr("data-long")),
        map: Instamedia.map
      });//end marker
      var infoWindow = new google.maps.InfoWindow;
      var contentString = "<div class='infowindow'><img src='" + $(this).find("img").attr("src") + "'</div>";
      Instamedia.bindInfoW(marker, contentString, infoWindow);
    });
  },

  bindInfoW: function(marker, contentString, infowindow){
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(contentString);
        infowindow.open(Instamedia.map, marker);
    });
  },

  openWindow: function(marker) {
    google.maps.event.addListener(marker, 'click', function(event) {
      Instamedia.infoWindow.open(Instamedia.map, marker);
    });
  },

  pingInstagram: function(map, event) {
    var $self = $(map);
    $.ajax({
      type: 'get',
      url: '/places',
      dataType: 'json',
      data: { lng: event.latLng.$a, lat: event.latLng.ab },
      success: function(data, status, xhr) {
        $self.trigger('ajax:success', [data, status, xhr]);
        Instamedia.placeImage();
      },
      error: function(xhr, status, error) {
        $self.trigger('ajax:error', [xhr, status, error]);
      },
      complete: function(xhr, status) {
        $self.trigger('ajax:complete', [xhr, status]);
      }
    });
  }
};//end Instamedia
