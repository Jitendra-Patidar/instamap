$(document).ready(function() {
  $(".fancybox")
    .attr('rel', 'gallery')
    .fancybox({
      beforeShow: function () {
        if (this.title) {
          // New line
          this.title += '<br />';

          // Add FaceBook like button
          this.title += '<iframe src="//www.facebook.com/plugins/like.php?href=' + this.href + '&amp;send=false&amp;layout=button_count&amp;width=450&amp;show_faces=false&amp;font&amp;colorscheme=light&amp;action=like&amp;height=21&amp;appId=537874739558661" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:450px; height:21px;" allowTransparency="true"></iframe>';
        }
        /* Disable right click */
        $.fancybox.wrap.bind("contextmenu", function (e) {
          return false; 
        });
      },
      afterShow: function() {
        // Render tweet button
        twttr.widgets.load();
      },
      helpers : {
        title : {
          type: 'inside'
        }
      } 
    });
  Instamedia.init();
});

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
        { visibility: "on" }
      ]
    }
  ],

  init: function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(Instamedia.showPosition);
    } else {
      alert("Geolocation is not supported by this browser");
    };
  },

  myPic: function() {
    $(".flexslider").flexslider({
      animation: "slide",
      animationLoop: true,
      slideshow: false,
      itemWidth: 160,
      itemMargin: 5
    });
  },

  showPosition: function (position) {
    var latitude  = position.coords.latitude;
    var longitude = position.coords.longitude;
    var myLatlng = new google.maps.LatLng(latitude, longitude);
    var mapOptions = {
      zoom: 12,
      center: myLatlng,
      styles: Instamedia.styles,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    Instamedia.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

    $(".container").append("<img id=\"loader\" src=\"assets/ajax-loader.gif\" />");

    $.ajax({
      type: 'get',
      url: '/places',
      dataType: 'json',
      data: { lng: myLatlng.Ya, lat: myLatlng.Za },
      success: function(data) {
        $("#loader").remove();
        Instamedia.placeMarker(myLatlng);
        $(".imageSlider").html(data.instagram);
        Instamedia.myPic();
        Instamedia.placeImage();
      },
      error: function() {
        alert("Please refresh the page");
      }
    });

    google.maps.event.addListener(Instamedia.map, 'click', function(event) {
      $(".container").append("<img id=\"loader\" src=\"assets/ajax-loader.gif\" />");
      Instamedia.placeMarker(event.latLng);
      Instamedia.pingInstagram(Instamedia.map, event);
      $(Instamedia.map).on('ajax:success', function(event, data) {
        if(data.instagram == ""){
          $(".container").html('<div class="center alert alert-danger"><strong>Unfortunately no images where found for this geolocation.</strong></div>');
        } else {
          $(".imageSlider").html(data.instagram);
          Instamedia.myPic();   
        }
      });
    });
  },

  placeMarker: function(location) {
    var marker = new google.maps.Marker({
      position: location,
      map: Instamedia.map,
      animation: google.maps.Animation.DROP
    });

    Instamedia.map.setZoom(15);
    Instamedia.map.setCenter(marker.getPosition());

    if(Instamedia.markersArray.length >= 1) {
      Instamedia.markersArray[Instamedia.markersArray.length-1].setMap(null);
    }

    Instamedia.markersArray.push(marker);
    Instamedia.map.setCenter(location);
  },

  placeImage: function() {
    var locations = $(".thumb");
    $.each(locations, function(){
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng($(this).attr("data-lat"), $(this).attr("data-long")),
        map: Instamedia.map
      });//end marker
      var infoWindow = new google.maps.InfoWindow;
      var content =
        "<div class='infowindow'>" +
          "<img src='" + $(this).find("img").attr("src") +
          "'<div class='span5'>" +
            "<h3 class='infoUser'><a href='" + $(this).attr("data-show-link") + "'>" + $(this).attr("data-username") + "</a></h3>" +
            "<br />" + $(this).attr("data-caption") +
            "<br />" + $(this).attr("data-comments") +
          "</div>" +
        "</div>";
      Instamedia.openWindow(marker, content, infoWindow);
    });
  },

  openWindow: function(marker, content, infowindow){
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(content);
      infowindow.open(Instamedia.map, marker);
    });
  },

  pingInstagram: function(map, event) {
    var $self = $(map);
    $.ajax({
      type: 'get',
      url: '/places',
      dataType: 'json',
      data: { lng: event.latLng.Ya, lat: event.latLng.Za },
      success: function(data, status, xhr) {
        $self.trigger('ajax:success', [data, status, xhr]);
        Instamedia.placeImage();
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
};//end Instamedia