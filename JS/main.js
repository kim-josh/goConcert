'use strict';
const SOUNDKICK_SEARCH_URL = "https://api.songkick.com/api/3.0/events.json?apikey=sMCqbLWZn5ZmhtpU";
const GOOGLE_MAPS_KEY = "AIzaSyCpMq0b-qbj6GQGQhcJoloo6SZr6NnKDkU";
var concertInfo = [];
(function($) {
  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 48)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Collapse the navbar when page is scrolled
  $(window).scroll(function() {
    if ($("#mainNav").offset().top > 100) {
      $("#mainNav").addClass("navbar-shrink");
    } else {
      $("#mainNav").removeClass("navbar-shrink");
    }
  });

})(jQuery);

// AJAX call to songkick API
function getDataFromSongkickApi(searchArtist, callback) {
  console.info("Inside SongkickAPI function");
  const settings = {
    url: SOUNDKICK_SEARCH_URL,
    dataType: "json",
    type: "GET",
    data: {
      artist_name: searchArtist
    },
    success: callback,
    timeout: 5000,
    error: function() {
      alert('Error retrieving data');
    }
  };
  $.ajax(settings);
};

// Renders the results page
function renderConcertResults(result) {
  return `
   <div class="result-container">
     <h3 class="render-text"><a href="${result.uri}" target="_blank">${result.displayName}</a></h3>
     <h4 class="render-text">${result.start.date}</h4>
     <p class="render-text"><strong>${result.venue.displayName}</strong>, ${result.location.city}</p>
   </div>
 `;
}

// Callback function for Songkick API
function displaySongkickData(data) {
  console.log(data);
  const songkickData = data.resultsPage.results.event;
  const searchArtist = $('.search-input').val();
  if (songkickData != undefined) {
    const results = songkickData.map((item, index) => renderConcertResults(item));
    $('.js-search-results').html(results); // Stores Songkick data in global variable, concertInfo
    concertInfo = songkickData.map((item, index) => {
      return item;
    });
    // Redirects user to a visible results page with a map below
    $('#results').show();
    $('#map').show();
    location.href = "#results";
  } else if (songkickData == undefined && searchArtist.length > 0) {
    swal({
      title: 'Oops',
      text: 'Sorry, we were unable to find any upcoming concerts for that artist.',
      type: 'info'
    })
  }
  initMap();
}

// Google map scripts
function initMap() {
  console.log("Rendering MAP");
  console.log(concertInfo);
  var bounds = new google.maps.LatLngBounds();
  var mapOptions = {
    center: new google.maps.LatLng(34.052, -118.244),
    zoom: 7,
    minZoom: 2,
    styles: [{
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 17
      }]
    }, {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 20
      }]
    }, {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 17
      }]
    }, {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 29
      }, {
        "weight": 0.2
      }]
    }, {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 18
      }]
    }, {
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 16
      }]
    }, {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 21
      }]
    }, {
      "elementType": "labels.text.stroke",
      "stylers": [{
        "visibility": "on"
      }, {
        "color": "#000000"
      }, {
        "lightness": 16
      }]
    }, {
      "elementType": "labels.text.fill",
      "stylers": [{
        "saturation": 36
      }, {
        "color": "#000000"
      }, {
        "lightness": 40
      }]
    }, {
      "elementType": "labels.icon",
      "stylers": [{
        "visibility": "off"
      }]
    }, {
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 19
      }]
    }, {
      "featureType": "administrative",
      "elementType": "geometry.fill",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 20
      }]
    }, {
      "featureType": "administrative",
      "elementType": "geometry.stroke",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 17
      }, {
        "weight": 1.2
      }]
    }]
  };
  // Creates and displays a map
  var map = new google.maps.Map(document.getElementById('map'), mapOptions);
  // Creates an array to hold params for map markers
  var markers = concertInfo.map(function(item) {
    return [item.venue.displayName, item.venue.lat, item.venue.lng];
  });
  console.log(markers);

  var infoWindow = new google.maps.InfoWindow();
  var infoWindowContent = concertInfo.map((item, index) => {
    return `
      <div class='info-container'>
        <h4 class="info-title">${item.displayName}</h3>
        <div class="info-content">
          <h4 class="info-text">${item.venue.displayName}</h3>
          <p class="info-text">${item.location.city}</p>
        </div>
      </div>
    `;
  });

  // Allows users to close info window by clicking anywhere on the map
  google.maps.event.addListener(map, 'click', function() {
    infoWindow.close();
  });

  // Loops through the array of markers and places all of them on the map
  for (var i = 0; i < markers.length; i++) {
    console.log("inside for loop" + markers);
    var latlng = new google.maps.LatLng(markers[i][1], markers[i][2]);
    // Object used to scale icon size
    var icon = {
      url: 'https://icons.iconarchive.com/icons/studiomx/leomx/256/Music-icon.png', // url
      scaledSize: new google.maps.Size(20, 20), //scaled size
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    };
    var markerOptions = {
      position: latlng,
      map: map,
      title: markers[i][0],
      icon: icon
    };
    var marker = new google.maps.Marker(markerOptions);
    // Allows each marker to have its own info window
    google.maps.event.addListener(marker, 'click', (function(marker, i) {
      return function() {
        infoWindow.setContent(infoWindowContent[i]);
        infoWindow.open(map, marker);
      };
    })(marker, i));
    bounds.extend(latlng);
  }
  // Centers the map, allowing users to view all markers
  map.fitBounds(bounds);
  // Ensures that bounds accomodate all points unless the zoom level is too low
  var listener = google.maps.event.addListenerOnce(map, "idle", function() {
    if (map.getZoom() > 16) map.setZoom(16);
  })
}

function watchSubmit() {
  $('.search-icon').on('click', function(event) {
    event.preventDefault();
    const searchArtist = $('.search-input').val();
    $('.click-icon').hide();
    getDataFromSongkickApi(searchArtist, displaySongkickData);
  });
  $('.search-input').on('keyup', function(event) {
    if (event.which == 13) {
      $('.search-icon').click();
    }
  });
}

// Animates the search form - allowing it to expand/close
function searchToggle(obj, event) {
  var container = $(obj).closest('.search-wrapper');

  if (!container.hasClass('active')) {
    container.addClass('active');
    event.preventDefault();
  } else if (container.hasClass('active') && $(obj).closest('.input-holder').length == 0) {
    container.removeClass('active');
    // clear input
    container.find('.search-input').val('');
    // clear and hide result container when we press close
    container.find('.result-container').fadeOut(100, function() {
      $(this).empty();
    });
  }
}

$(watchSubmit);
