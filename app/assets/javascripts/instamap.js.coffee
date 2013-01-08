$(document).ready ->
  Modal.show()
  Tooltip.show()
  Flash.show()
  Instamap.init()

Instamap = 
  init: ->
    if navigator.geolocation
      navigator.geolocation.getCurrentPosition ((position) ->
        latitude = position.coords.latitude
        longitude = position.coords.longitude
        Google.geoPosition latitude, longitude
      ), ->
        Google.geoPosition 40.69847032728747, -73.9514422416687
    else
      Google.geoPosition 40.69847032728747, -73.9514422416687

Modal = 
  show: ->
    $("#about_us").on "click", (event) ->
      event.preventDefault()
      $("#myModal").modal()
      $(".contact").show()
      $(".controls").show()
      $("#name, #email, #message").val ""
      $(".nav-tabs li").on "click", ->
        selection = $(this).text()
        if selection is "About" or selection is "Contact"
          $("#myModalLabel").text selection + " us"
        else
          $("#myModalLabel").text selection + " use Instamap"
      $(".contact").on "click", (event) ->
        event.preventDefault()
        paths = ["#name", "#email", "#message"]
        index = 0
        while index < 3
          if $(paths[index]).val().length is 0
            $(paths[index]).closest("div.control-group").addClass "error"
          else
            $(paths[index]).closest("div.control-group").removeClass "error"
          index++
        if $("#name").val().length > 0 and $("#email").val().length > 0 and $("#message").val().length > 0
          $(".contact").hide()
          $(".modal-body").append "<img id=\"contact-loader\" src=\"/assets/ajax-loader.gif\" />"
          $.ajax
            type: "post"
            url: "/contact"
            dataType: "html"
            data:
              name: $("#name").val()
              email: $("#email").val()
              message: $("#message").val()
            success: ->
              $("#modal-errors").prepend "<div id=\"contact-success\" class=\"center alert alert-success\">Message successfully sent"
              $(".controls").hide()
              $("#contact-loader").remove()
              setTimeout ->
                $("#contact-success").remove()
                $("#myModal").modal "hide"
              , 1050
            error: ->
              alert "Oops. Something weird happened. Please try submitting the contact form again."

Tooltip = 
  show: ->
    $("#following").hide()
    $("#followers_link").tooltip placement: "right"
    $("#following_link").tooltip placement: "right"
    $(".img-circle").tooltip placement: "top"
    $("#following_link").on "click", ((event) ->
      event.preventDefault()
      $("#followers").slideUp 1050
      $("#following").show()
    )
    $("#followers_link").on "click", ((event) ->
      event.preventDefault()
      $("#following").slideUp 1050
      $("#followers").show()
    )

Flash = 
  show: ->
    setTimeout ->
      $("#flash").slideUp "slow"
    , 4000

Container = 
  loader: ->
    $(".container").prepend "<img id=\"loader\" src=\"assets/ajax-loader.gif\" />"

  sad_face: ->
    $(".container").prepend "<div id=\"sad_face\" class=\"center alert alert-danger\"><img src=\"/assets/sad-face.png\" /><strong>&nbsp;&nbsp;Oh no! No Instagram images were found in this area, come back when this town gets up to speed with technology!</strong></div>"
    setTimeout ->
      $("#sad_face").slideUp 500
    , 5000

Google =
  map: null
  iconsArray: []
  placeMarkerArray: []
  styles: [
    featureType: "all"
    stylers: [
      saturation: -50
    ,
      gamma: 1.51
    ]
  ,
    featureType: "road.arterial"
    elementType: "geometry"
    stylers: [
      hue: "#403D3A"
    ,
      saturation: 80
    ]
  ,
    featureType: "poi.business"
    elementType: "labels"
    stylers: [visibility: "on"]
  ]

  placeMarker: (location) ->
    Google.deleteIcons Google.placeMarkerArray
    image = "/assets/custom_marker.png"
    if window.location.pathname is "/"
      marker = new google.maps.Marker
        position: location
        map: Google.map
        title: "Your location"
        icon: image
        animation: google.maps.Animation.DROP
      Google.placeMarkerArray.push marker
      Google.map.setZoom 13
      Google.map.setCenter marker.getPosition()
    else
      find_location = $("#instagrams").data("instagrams")
      location = undefined
      $.each find_location, ->
        location = $(this).attr("location") if $(this).attr("location")?
      if location.latitude and location.longitude?
        marker = new google.maps.Marker
          position: new google.maps.LatLng location.latitude - .01, location.longitude
          map: Google.map
          title: $(".label.label-important").text() + " location"
          icon: image
          animation: google.maps.Animation.DROP
        Google.map.setZoom 8
        Google.map.setCenter marker.getPosition()
      else
        Google.map.setZoom 4

  placeIcon: ->
    Google.deleteIcons Google.iconsArray
    image = "/assets/camera.png"
    instagrams = $("#instagrams").data("instagrams")
    infoWindow = new google.maps.InfoWindow()
    $.each instagrams, ->
      if $(this).attr("location")?
        marker = new google.maps.Marker
          position: new google.maps.LatLng $(this).attr("location").latitude, $(this).attr("location").longitude
          map: Google.map
          icon: image
          animation: google.maps.Animation.DROP
        Google.iconsArray.push marker
        content = "<div id=\"infowindow\">" + "<img src=" + $(this).attr("images").thumbnail.url + " />" + "</div>"
        Google.openWindow marker, content, infoWindow

  deleteIcons: (array) ->
    if array
      counter = 0
      while counter < array.length
        array[counter].setMap null
        counter++
      array.length = 0

  openWindow: (marker, content, infowindow) ->
    google.maps.event.addListener marker, "click", ->
      infowindow.close()
      infowindow.setContent content
      infowindow.open Google.map, marker
      Google.infowindowLightbox()

    $(".thumb").on "mouseenter", ->
      if $(this).data("thumb") is $(content).find("img").attr("src")
        infowindow.setContent content
        infowindow.open Google.map, marker
    $(".thumb").on "mouseleave", ->
      infowindow.close()

  instaGeocode: ->
    $(".search_btn").on "click", (event) ->
      event.preventDefault()
      Container.loader()
      geocoder = new google.maps.Geocoder()
      address = $("#geocode_address").val()
      geocoder.geocode
        address: address
      , (results, status) ->
        if status is google.maps.GeocoderStatus.OK
          Google.map.setZoom 15
          Google.map.setCenter results[0].geometry.location
          image = "/assets/custom_marker.png"
          marker = new google.maps.Marker
            map: Google.map
            position: results[0].geometry.location
            icon: image
            title: "Your searched location - " + address
          Instagram.ping results[0].geometry.location.Ya, results[0].geometry.location.Za
        else
          alert "Geocode was not successful for the following reason: " + status
          $("#loader").remove()

  geoPosition: (latitude, longitude) ->
    Google.instaGeocode()
    myLatlng = new google.maps.LatLng latitude, longitude
    mapOptions =
      zoom: 12
      center: myLatlng
      styles: Google.styles
      mapTypeId: google.maps.MapTypeId.ROADMAP
    Google.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions)
    Container.loader()
    Instagram.ping myLatlng.Ya, myLatlng.Za
    google.maps.event.addListener Google.map, "click", (event) ->
      Container.loader()
      Google.placeMarker event.latLng
      Instagram.ping event.latLng.Ya, event.latLng.Za

  infowindowLightbox: ->
    $(".street_view").click ->
      infowindow_pic = $(this).parent().find("img").attr("src")
      thumbs = $(".thumb")
      $.each thumbs, ->
        Fancy.run this if $(this).data("thumb") is infowindow_pic

Instagram =
  ping: (latitude, longitude) ->
    myLatlng = new google.maps.LatLng latitude, longitude
    $.ajax
      type: "get"
      url: "/places"
      dataType: "json"
      data:
        lat: latitude
        lng: longitude
      success: (data) ->
        $("#loader").remove()
        if data.instagram.length is 122
          Container.sad_face()
        else
          Google.placeMarker myLatlng
        $(".imageSlider").html data.instagram
        Slider.flexi()
        $(".thumb").on "click", ->
          Fancy.run this
        Google.placeIcon()
      error: ->
        alert "Please refresh the page"
        $("#loader").remove()

  post: ->
    $("#post_comment").on "click", ->
      alert "Posting comments is currently disable while we wait for approval from Instagram"

  like: (pid) ->
    $.ajax
      type: "get"
      url: "/like"
      dataType: "json"
      data: id: pid
      success: (data) ->
        alert "You've liked this photo"
      error: ->
        alert "Something happened... Try again later!"

Slider =
  flexi: ->
    $(".flexslider").flexslider
      animation: "slide"
      animationLoop: true
      slideshow: false
      itemWidth: 160
      itemMargin: 5

Fancy =
  box: (lat, lng, pid) ->
    street = undefined
    latLng = new google.maps.LatLng lat, lng
    view = new google.maps.StreetViewService()
    $(".fancybox").fancybox
      width: 1155
      height: "95%"
      maxWidth: "95%"
      maxHeight: "95%"
      openEffect: "none"
      autoSize: true
      autoResize:  false
      closeEffect: "fade"
      scrolling: "auto"
      type: "iframe"
      helpers:
        media:{}
      
      beforeShow: ->
        $(".fancybox-inner").prepend "<div id=\"street_view\"></div>"
        $(".fancybox-inner").prepend "<div id=\"lightbox_comments\"></div>" + "<div id=\"comment_box\">" + "<textarea id=\"user_comment\" class=\"span7 offset1\"></textarea>" + "<br />" + "<div id=\"post_comment\" class=\"btn btn-small btn-success\">Post comment</div>" + "</div>"
        $(".fancybox-inner").append "<div id=\"instagram_image\"></div>"
        $(".fancybox-inner").append "<div id=\"instagram_user_image\"></div>"
        $("#instagram_image").on "click", ->
          Instagram.like pid
        Instagram.post()
        view.getPanoramaByLocation latLng, 100, (streetViewPanoramaData, status) ->
          if status is google.maps.StreetViewStatus.OK
            panoramaOptions =
              addressControl: true
              addressControlOptions:
                style:
                  backgroundColor: "grey"
                  color: "yellow"
              position: new google.maps.LatLng streetViewPanoramaData.location.latLng.Ya, streetViewPanoramaData.location.latLng.Za
              pov:
                heading: 0
                pitch: 0
                zoom: 0
            street = new google.maps.StreetViewPanorama(document.getElementById("street_view"), panoramaOptions)
          else
            panoramaOptions =
              addressControl: true
              addressControlOptions:
                style:
                  backgroundColor: "grey"
                  color: "yellow"
              position: new google.maps.LatLng lat, lng
              pov:
                heading: 0
                pitch: 0
                zoom: 0
            street = new google.maps.StreetViewPanorama(document.getElementById("street_view"), panoramaOptions)
            $("#street_view").html "<img id=\"not_available\" src=\"assets/not-available.jpeg\" />"
          $.ajax
            type: "get"
            url: "/comments"
            dataType: "json"
            data:
              id: pid
            success: (data) ->
              if data.length is 0
                $("#lightbox_comments").append '<div id="no_comments" class="center alert alert-info span8">Be the first to leave a comment</div>'
              else
                $.each data, ->
                  $("#lightbox_comments").append '<a href="http://www.instamap.it/' + $(this)[0].from.username + '">' + $(this)[0].from.username + '</a> says: <br />' + $(this)[0].text + '<img src=' + $(this)[0].from.profile_picture + ' height=64 width=64 /><br /><br /><br />'
          $.ajax
            type: "get"
            url: "/image"
            dataType: "json"
            data: 
              id: pid
            success: (user) ->
              $("#instagram_user_image").append '<a href="http://www.instamap.it/' + user.data.user.username + '"><img id="profile_picture" class="img-polaroid" src="' + user.data.user.profile_picture + '" /></a>'
            error: ->
              alert "You do not have the proper permissions to view this users image"

  run: (object) ->
    lat = $(object).data("lat")
    lng = $(object).data("long")
    pid = $(object).data("id")
    Fancy.box lat, lng, pid