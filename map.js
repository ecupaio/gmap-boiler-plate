$(document).ready(function() {
    //Map Styles
    var styledMapType = new google.maps.StyledMapType(
            [{
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#f5f5f5"
                    }]
                },
                {
                    "elementType": "labels.icon",
                    "stylers": [{
                        "visibility": "off"
                    }]
                },
                {
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#616161"
                    }]
                },
                {
                    "elementType": "labels.text.stroke",
                    "stylers": [{
                        "color": "#f5f5f5"
                    }]
                },
                {
                    "featureType": "administrative.land_parcel",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#bdbdbd"
                    }]
                },
                {
                    "featureType": "administrative.province",
                    "elementType": "geometry.stroke",
                    "stylers": [{
                            "color": "#b2b2b2"
                        },
                        {
                            "visibility": "on"
                        },
                        {
                            "weight": 3
                        }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#eeeeee"
                    }]
                },
                {
                    "featureType": "poi",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#757575"
                    }]
                },
                {
                    "featureType": "poi.park",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#e5e5e5"
                    }]
                },
                {
                    "featureType": "poi.park",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#9e9e9e"
                    }]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#ffffff"
                    }]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#757575"
                    }]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#dadada"
                    }]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#616161"
                    }]
                },
                {
                    "featureType": "road.local",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#9e9e9e"
                    }]
                },
                {
                    "featureType": "transit.line",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#e5e5e5"
                    }]
                },
                {
                    "featureType": "transit.station",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#eeeeee"
                    }]
                },
                {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#c9c9c9"
                    }]
                },
                {
                    "featureType": "water",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#9e9e9e"
                    }]
                }
            ], {
                name: 'Styled Map'
            });
    //Geocoder for points without lat/lng
    var geocoder = new google.maps.Geocoder();
    //Info windows for markers
    var infowindow = new google.maps.InfoWindow();
    //Get bounds of map for centering
    var bounds = new google.maps.LatLngBounds();
    var marker;
    //Create map
    var map = new google.maps.Map(document.getElementById("sample-map"), {
            zoom: 8,
            scrollwheel: false
    });
    //Add styles to map
    map.mapTypes.set('styled_map', styledMapType);
    map.setMapTypeId('styled_map');

    //get points for map
    $.ajax({
        url: 'sample-data.json',
        method: 'GET',
        success: function(data) {
            //Data var, redefine for your results
            var mapData = data.results;
            //only plot points if data is available
            if (mapData.length > 0) {
                //position map to fit markers
                function fitMarkers() {
                    bounds.extend(marker.getPosition());
                    map.fitBounds(bounds);
                }
                //Create Infowinows
                function infoWindows() {
                    google.maps.event.addListener(marker, 'click', function() {
                        if (infowindow !== null) {
                            infowindow.close();
                        }
                        //Infowinow HTML
                        var windowContent = "<div class='info'>" +
                                                "<div class='address-line-1'>" + this.addr + "</div>" +
                                                "<div class='address-city-st'>" + this.city + ", " + this.state + " " + this.zip + "</div>" +
                                            "</div>";
                        infowindow.setContent(windowContent);
                        infowindow.open(map, this);
                    });
                }
                for (var i = 0; mapData.length > i; i++) {
                    //Create vars for markers and info windows, redefine for your json
                    var lat = mapData[i].lat;
                    var lng = mapData[i].lng;
                    var addr = mapData[i].address;
                    var city = mapData[i].city;
                    var state = mapData[i].state;
                    var zip = mapData[i].zip;
                    //Create maker if lat/long coords available
                    if (lat && lng) {
                        marker = new google.maps.Marker({
                            position: new google.maps.LatLng(
                                lat,
                                lng
                            ),
                            map: map,
                            addr: addr,
                            city: city,
                            state: state,
                            zip: zip
                        });
                        fitMarkers();
                        infoWindows();
                    } else {
                        //Geocode address in order to create markers
                        var address = addr+' '+city+' '+' '+state+' '+zip;
                        geocoder.geocode({'address': address}, function(addr, city, state, zip) {
                            return(function(results,status) {
                                if (status == "OK") {
                                    var latlng = results[0].geometry.location;
                                    marker = new google.maps.Marker({
                                        position: latlng,
                                        map: map,
                                        addr: addr,
                                        city: city,
                                        state: state,
                                        zip: zip
                                    });
                                    fitMarkers();
                                    infoWindows();
                                }
                            });
                        }(addr, city, state, zip));
                    }
                }//end for loop
            }
        }, error: function(data) {
            console.log('didnt get it');
        }
    });
});
