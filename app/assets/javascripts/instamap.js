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
