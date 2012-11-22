$(function() {
	$('.modal').modal("show");
});

$(function () {
	var $container = $('.container');
	$container.imagesLoaded(function(){
	  $container.masonry({
	    itemSelector : '.thumbnail',
	    gutterWidth : 15,
	    isFitWidth: true
	  });
	});
});

var map;
markersArray = [];

function initialize() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    alert("Geolocation is not supported by this browser");
  }
}

var styles = [
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
];

function showPosition(position) {
  var latitude  = position.coords.latitude;
  var longitude = position.coords.longitude;
  var myLatlng = new google.maps.LatLng(latitude, longitude);
  var mapOptions = {
    zoom: 10,
    center: myLatlng,
    styles: styles,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  
  map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

  google.maps.event.addListener(map, 'click', function(event) {
  	placeMarker(event.latLng);
    pingInstagram(map, event);
    setTimeout(function(){
    	markersArray[markersArray.length-1].setMap(null);
    }, 3000);
  });

  $(map).on('ajax:success', function(event, data) {
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

};

function placeMarker(location) {
  var marker = new google.maps.Marker({
    position: location,
    map: map,
    animation: google.maps.Animation.DROP
  });

  markersArray.push(marker);
  map.setCenter(location);
};

function pingInstagram(map, event) {
	var $self = $(map);
  $.ajax({
		type: 'get',
		url: '/places',
		dataType: 'json',
		data: { lng: event.latLng.$a, lat: event.latLng.ab },
		success: function(data, status, xhr) {
      $self.trigger('ajax:success', [data, status, xhr]);
    },
    error: function(xhr, status, error) {
      $self.trigger('ajax:error', [xhr, status, error]);
    },
    complete: function(xhr, status) {
      $self.trigger('ajax:complete', [xhr, status]);
    }
	});
};