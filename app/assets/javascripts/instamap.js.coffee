$(document).ready ->
  $('#loading').fadeOut(2000)
  $('#stat-box').hide() if window.location.pathname is '/search'
  Modal.show()
  User.search()
  Instagram.follow()
  if window.location.pathname is '/'
    Instamap.init()
  else
    Google.placeMarker ''

Instamap = 
  init: ->
    setTimeout ->
      $('#notice-error').slideUp('slow')
    , 4000
    if navigator.geolocation
      navigator.geolocation.getCurrentPosition ((position) ->
        latitude = position.coords.latitude
        longitude = position.coords.longitude
        city = [latitude, longitude].toString()
        geocoder = new google.maps.Geocoder()
        geocoder.geocode
          address: city
        , (results, status) ->
          $('#search_area').text 'Location: ' + results[0].address_components[2].short_name + ', ' + results[0].address_components[4].short_name
        Google.geoPosition latitude, longitude
      ), ->
        Google.geoPosition 40.69847032728747, -73.9514422416687
    else
      Google.geoPosition 40.69847032728747, -73.9514422416687

User =
  search: ->
    $('.search-query').on 'keypress', (event) ->
      event.preventDefault() if event.keyCode is 13
    $('.search-query').autocomplete
      minLength: 3
      focus: (event, response) ->
        event.preventDefault()
      source: (request, response) ->
        response ['Search by location', 'Search by tag', 'Search by user']
      select: (event, selection) ->
        if selection.item.label is 'Search by location'
          event.preventDefault()
          Google.instaGeocode()
        else if selection.item.label is 'Search by tag'
          event.preventDefault()
          Instagram.tag $('#geocode_address').val()
        else
          event.preventDefault()
          Instagram.search $('#geocode_address').val()

Modal = 
  show: ->
    $('#about_us').on 'click', (event) ->
      event.preventDefault()
      $('#myModal').modal()
      $('.contact').show()
      $('.controls').show()
      $('#name, #email, #message').val ''
      $('.nav-tabs li').on 'click', ->
        selection = $(this).text()
        if selection is 'About' or selection is 'Contact'
          $('#myModalLabel').text selection + ' us'
        else
          $('#myModalLabel').text selection + ' use Instamap'
      $('.contact').on 'click', (event) ->
        event.preventDefault()
        paths = ['#name', '#email', '#message']
        index = 0
        while index < 3
          if $(paths[index]).val().length is 0
            $(paths[index]).closest('div.control-group').addClass 'error'
          else
            $(paths[index]).closest('div.control-group').removeClass 'error'
          index++
        if $('#name').val().length > 0 and $('#email').val().length > 0 and $('#message').val().length > 0
          $('.contact').hide()
          $('.modal-body').append '<img id="contact-loader" src="/assets/ajax-loader.gif" />'
          $.ajax
            type: 'post'
            url: '/contact'
            dataType: 'html'
            data:
              name: $('#name').val()
              email: $('#email').val()
              message: $('#message').val()
            success: ->
              $('#modal-errors').prepend '<div id="contact-success" class="center alert alert-success">Message successfully sent'
              $('.controls').hide()
              $('#contact-loader').remove()
              setTimeout ->
                $('#contact-success').remove()
                $('#myModal').modal 'hide'
              , 1050
            error: ->
              alert 'Oops. Something happened. Please try again later...'

Story =
  board: (marker, content, infowindow) ->
    $('.thumb').on 'mouseenter', ->
      $('#instagram-user-profile').attr 'src', $(this).data('profile')
      $('#photo-text').html $(this).data('username') + '</a> says:<br />' + $(this).data('text')
      $('#photo-stats').html '<br />Likes: ' + $(this).data('likes') + '<br />Comments: ' + $(this).data('comments')
      if (marker and content and infowindow) isnt ''
        if $(this).data('thumb') is $(content).find('img').attr('src')
          infowindow.setContent content
          infowindow.open Google.map, marker
    $('.thumb').on 'mouseleave', ->
      if (marker and content and infowindow) isnt ''
        infowindow.close()
      $('#instagram-user-profile').attr('src', '/assets/sunglass_woman_green.png')
      $('#photo-text').html('Hover over photo for stats')
      $('#photo-stats').html ''

Google =
  map: null
  iconsArray: []
  placeMarkerArray: []
  styles: [
    featureType: 'all'
    stylers: [
      saturation: -50
    ,
      gamma: 1.51
    ]
  ,
    featureType: 'road.arterial'
    elementType: 'geometry'
    stylers: [
      hue: '#403D3A'
    ,
      saturation: 80
    ]
  ,
    featureType: 'poi.business'
    elementType: 'labels'
    stylers: [visibility: 'on']
  ]

  placeMarker: (location) ->
    current_location = []
    Google.deleteIcons Google.placeMarkerArray
    image = '/assets/custom_marker.png'
    if window.location.pathname is '/'
      marker = new google.maps.Marker
        position: location
        map: Google.map
        title: 'Your location'
        icon: image
        animation: google.maps.Animation.DROP
      Google.placeMarkerArray.push marker
      Google.map.setZoom 13
      Google.map.setCenter marker.getPosition()
    else
      find_location = $('#instagrams').data 'instagrams'
      $.each find_location, (index, value) ->
        if find_location[index].location?
          if find_location[index].location.latitude?
            current_location.push find_location[index].location if current_location.length <= 1
      if current_location[0]?
        marker = new google.maps.Marker
          position: new google.maps.LatLng current_location[0].latitude - .01, current_location[0].longitude
          map: Google.map
          title: $('.legend h1').text() + " location"
          icon: image
          animation: google.maps.Animation.DROP
        mapOptions =
          center: marker.position
          styles: Google.styles
          mapTypeId: google.maps.MapTypeId.ROADMAP
        Google.map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions)
        Google.map.setZoom 8
        Google.map.setCenter marker.getPosition()
        city = [current_location[0].latitude, current_location[0].longitude].toString()
        geocoder = new google.maps.Geocoder()
        geocoder.geocode
          address: city
        , (results, status) ->
          $('#user-location').text results[0].formatted_address
      else
        mapOptions =
          styles: Google.styles
          center: new google.maps.LatLng(40.7142, -74.0064)
          mapTypeId: google.maps.MapTypeId.ROADMAP
        Google.map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions)
        Google.map.setZoom 2
        $('#user-location').text 'Unknown'
      Slider.flexi()
      Google.placeIcon ''
      Story.board '', '', ''
      $('.thumb').on 'click', ->
        Fancy.run @

  placeIcon: (user_input) ->
    Google.deleteIcons Google.iconsArray
    image = '/assets/camera.png'
    instagrams = $('#instagrams').data('instagrams')
    infoWindow = new google.maps.InfoWindow()
    $.each instagrams, ->
      if $(this).attr('location')?
        marker = new google.maps.Marker
          position: new google.maps.LatLng $(this).attr('location').latitude, $(this).attr('location').longitude
          map: Google.map
          icon: image
          animation: google.maps.Animation.DROP
        Google.iconsArray.push marker
        content = '<div id="infowindow">' + '<img src=' + $(this).attr('images').thumbnail.url + ' /></div>'
        $('#search_area').text('Location: ' + user_input) if user_input?
        $('#search_area #search-loader').remove()
        Google.openWindow marker, content, infoWindow
      else
        Story.board '', '', ''

  deleteIcons: (array) ->
    if array
      counter = 0
      while counter < array.length
        array[counter].setMap null
        counter++
      array.length = 0

  openWindow: (marker, content, infowindow) ->
    google.maps.event.addListener marker, 'click', ->
      infowindow.close()
      infowindow.setContent content
      infowindow.open Google.map, marker
      Google.infowindowLightbox()
    Story.board(marker, content, infowindow)

  instaGeocode: ->
    geocoder = new google.maps.Geocoder()
    user_input = $('#geocode_address').val()
    $('#search_area').html 'Currently searching: ' + user_input + ' <img id="search-loader" src="/assets/ajax-loader.gif" height=25 width=25 />'
    geocoder.geocode
      address: user_input
    , (results, status) ->
      if status is google.maps.GeocoderStatus.OK
        Google.map.setZoom 14
        Google.map.setCenter results[0].geometry.location
        image = '/assets/custom_marker.png'
        marker = new google.maps.Marker
          map: Google.map
          position: results[0].geometry.location
          icon: image
          title: 'Your searched location - ' + user_input
        Instagram.ping results[0].geometry.location.Ya, results[0].geometry.location.Za, user_input
      else
        alert 'Geocode was not successful for the following reason: ' + status
        $('#search-loader').remove()

  geoPosition: (latitude, longitude) ->
    myLatlng = new google.maps.LatLng latitude, longitude
    mapOptions =
      zoom: 12
      center: myLatlng
      styles: Google.styles
      mapTypeId: google.maps.MapTypeId.ROADMAP
    Google.map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions)
    Instagram.ping myLatlng.Ya, myLatlng.Za
    google.maps.event.addListener Google.map, 'click', (event) ->
      Google.placeMarker event.latLng
      Instagram.ping event.latLng.Ya, event.latLng.Za

  infowindowLightbox: ->
    $('.street_view').click ->
      infowindow_pic = $(this).parent().find('img').attr('src')
      thumbs = $('.thumb')
      $.each thumbs, ->
        Fancy.run @ if $(this).data('thumb') is infowindow_pic

Instagram =
  ping: (latitude, longitude, user_input) ->
    myLatlng = new google.maps.LatLng latitude, longitude
    $.ajax
      type: 'get'
      url: '/places'
      dataType: 'json'
      data: lat: latitude, lng: longitude
      success: (data) ->
        $('#loader').remove()
        if data.instagram.length is 122
          # Need to implement something here...
        else
          Google.placeMarker myLatlng
        $('.imageSlider').html data.instagram
        Slider.flexi()
        $('.thumb').on 'click', ->
          Fancy.run @
        Google.placeIcon user_input
      error: ->
        return
        Google.geoPosition 40.69847032728747, -73.9514422416687
        alert 'There was an error from Instagram. By default, New York City is loaded, try searching or refreshing the page'
        $('#loader').remove()

  post: ->
    $('#post_comment').on 'click', ->
      alert 'Posting comments is currently disable while we wait for approval from Instagram'

  like: (pid) ->
    $.ajax
      type: 'get'
      url: '/like'
      dataType: 'json'
      data: id: pid
      success: (data) ->
        alert 'You\'ve liked this photo'
      error: ->
        alert 'Oops. You have to be signed in to like a photo.'
  
  follow: ->
    $('#follow-user').on 'click', ->
      $.ajax
        type: 'get'
        url: '/follow'
        dataType: 'json'
        data: username: window.location.pathname.split('/')[2]
        success: (data) ->
          $('#follow-user').text('Following')
        error: ->
          alert 'Oops. You have to be signed in to follow a user.'

  search: (user_input) ->
    window.location.replace 'http://www.instamap.it/search?term=' + user_input

  tag: (user_input) ->
    window.location.replace 'http://www.instamap.it/tag?term=' + user_input
    $.ajax
      type: 'get'
      url: '/tag'
      dataType: 'json'
      data: term: user_input
      success: (data) ->
        Slider.flexi()

Slider =
  flexi: ->
    $('.flexslider').flexslider
      animation: 'slide'
      animationLoop: true
      slideshow: false
      itemWidth: 160
      itemMargin: 5
      minItems: 1
      maxItems: 10

Fancy =
  box: (lat, lng, pid) ->
    street = undefined
    latLng = new google.maps.LatLng lat, lng
    view = new google.maps.StreetViewService()
    $('.fancybox').fancybox
      width: 1155
      height: '95%'
      maxWidth: '95%'
      maxHeight: '95%'
      openEffect: 'none'
      autoSize: true
      autoResize:  false
      closeEffect: 'fade'
      scrolling: 'auto'
      type: 'iframe'
      helpers:
        media:{}
      
      beforeShow: ->
        $('.fancybox-inner').prepend '<div id="street_view"></div>'
        $('.fancybox-inner').prepend '<div id="lightbox_comments"></div>' + '<div id="comment_box">' + '<textarea id="user_comment" class="span7 offset1"></textarea>' + '<br /><div id="post_comment" class="btn btn-small btn-success">Post comment</div></div>'
        $('.fancybox-inner').append '<div id="instagram_image"></div>'
        $('.fancybox-inner').append '<div id="instagram_user_image"></div>'
        $('#instagram_image').on 'click', ->
          Instagram.like pid
        Instagram.post()
        view.getPanoramaByLocation latLng, 100, (streetViewPanoramaData, status) ->
          if status is google.maps.StreetViewStatus.OK
            panoramaOptions =
              addressControl: true
              addressControlOptions:
                style:
                  backgroundColor: 'grey'
                  color: 'yellow'
              position: new google.maps.LatLng streetViewPanoramaData.location.latLng.Ya, streetViewPanoramaData.location.latLng.Za
              pov:
                heading: 0
                pitch: 0
                zoom: 0
            street = new google.maps.StreetViewPanorama(document.getElementById('street_view'), panoramaOptions)
          else
            panoramaOptions =
              addressControl: true
              addressControlOptions:
                style:
                  backgroundColor: 'grey'
                  color: 'yellow'
              position: new google.maps.LatLng lat, lng
              pov:
                heading: 0
                pitch: 0
                zoom: 0
            street = new google.maps.StreetViewPanorama(document.getElementById('street_view'), panoramaOptions)
            $('#street_view').html '<img id="not_available" src="/assets/not-available.png" />'
        $.ajax
          type: 'get'
          url: '/comments'
          dataType: 'json'
          data:
            id: pid
          success: (data) ->
            if data.length is 0
              $('#lightbox_comments').append '<div id="no_comments" class="center alert alert-info span8">Be the first to leave a comment</div>'
            else
              $.each data, ->
                $('#lightbox_comments').append '<a href="http://www.instamap.it/user/' + $(this)[0].from.username + '">' + $(this)[0].from.username + '</a> says: <br />' + $(this)[0].text + '<img src=' + $(this)[0].from.profile_picture + ' height=64 width=64 /><br /><br /><br />'
        $.ajax
          type: 'get'
          url: '/image'
          dataType: 'json'
          data: 
            id: pid
          success: (user) ->
            $('#instagram_user_image').append '<a href="http://www.instamap.it/user/' + user.data.user.username + '"><img id="profile_picture" class="img-polaroid" src="' + user.data.user.profile_picture + '" /></a>'
          error: ->
            alert 'You do not have the proper permissions to view this users image'

  run: (object) ->
    lat = $(object).data('lat')
    lng = $(object).data('long')
    pid = $(object).data('id')
    Fancy.box lat, lng, pid