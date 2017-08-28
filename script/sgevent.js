var map, popWindow, vm, j, c, f;
var markers = [];
var filtered = [];
var clicked_marker = null;
var event_all = [];
var ichi = new Date("2017-07-15");
var nichi = new Date("2017-07-31");
var default_marker = "http://mt.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png";

ko.bindingHandlers.dateslider = {
    init: function(element, valueAccessor, allBindingsAccessor){
        var options = valueAccessor() || {};
        var others =  allBindingsAccessor() || {};

        options.change = function(e, ui) {
            others.stdate(new Date(ui.values[0]));
            others.endate(new Date(ui.values[1]));

            f = 0;
            // Clear all markers currently on the map
            clearMarkers(filtered);
            filtered = [];
            // FIltered markers
            vm.compevents().forEach(function(k) {
                filtered[f] = k.marker;
                k.marker.setVisible(true);
                f++;
            });
        };
        $(element).slider(options);
    }
};

// View Model
var ViewModel = function() {
    var self = this;

    self.stdate = ko.observable(new Date("2017-01-01"));
    self.endate = ko.observable(new Date("2018-01-01"));
    self.name = ko.observable();
    self.events = ko.observableArray();
    self.locations = ko.observableArray();
    self.winPopVisible = ko.observable(true);
    self.eventlist = ko.observable();
    self.dlgtitle = ko.observable();
    self.dlgmsg = ko.observable();
    
    // Filtered property - based on start and end dates
    self.compevents = ko.dependentObservable(function() {
        var start = self.stdate();
        var end = self.endate();

        return ko.utils.arrayFilter(self.events(), function(el) {
            return (el.event_time >= start && el.event_time <= end);
        });
    }, ViewModel);

    // Append to locations observable array
    this.addlocation = function(vmo, mymarker) {
        self.locations.push({
            name: vmo.location_name,
            marker: mymarker,
        });
    }.bind(this);

    // Append to events observable array
    this.addevent = function(eo, mymarker) {
        self.events.push({
            event_time: new Date(eo.event_time),
            event_name: eo.event_name,
            marker: mymarker,
        });
    }.bind(this);

    // Event listener for the list of events
    this.clickmarker = function(index) {
        var cmarker = self.compevents()[index].marker;
        new google.maps.event.trigger(cmarker, 'click');
    };
};

// Initialize the application
function initialize() {
    var mapOpt = {
        zoom: 14,
        center: new google.maps.LatLng(1.3580884,103.8565863),
        mapTypeControl: false,
        panControl: false,
        zoomControl: true,
        streetViewControl: false
    };
    // Map object
    map = new google.maps.Map(document.getElementById('mapframe'), mapOpt);

    //Info window object
    popWindow = new google.maps.InfoWindow({
        content: document.getElementById('popWindow')
    });
}

// Adds a marker to the map
function dropMarker(thismarker) {
    thismarker.setMap(map);
}

// Remvoe all markers
function clearMarkers(mrkr_array) {
    for (var i = 0; i < mrkr_array.length; i++) {
      mrkr_array[i].setVisible(false);
    }
}

// Retrieves data from third-party API end point
function loadJSON() {
    // The API end point
    var jsonurl = 'https://sgnow-168404.appspot.com/allevents';

    $.ajax({
        type: "GET",
        url: jsonurl,
        dataType: "text",
        jsonp: false,
        success: function(packet) {
            var data = JSON.parse(packet);
            j = 0;
            c = 0;

            data.result.forEach(function(k) {
                if (k.event) {
                    // Creates a new position object
                    thislatlng = new google.maps.LatLng(k.lat, k.lng);
                    // Feeds the position object into the creation of the marker
                    markers[j] = new google.maps.Marker({
                        position: thislatlng,
                        animation: google.maps.Animation.DROP,
                        name: k.location_name,
                        events: k.event,
                    });
                    filtered = markers;
                    
                    // Adds all events to the observable array
                    k.event.forEach(function(m) {
                        vm.addevent(m, markers[j]);
                        event_all[c] = {
                            eventdata: m,
                            eventmarker: markers[j],
                        };
                        c++;
                    });
                    // Adds the location to the observable array
                    vm.addlocation(k, markers[j]);
                    // Adds the marker
                    dropMarker(markers[j]);
                    // Sets the event listener for the marker
                    google.maps.event.addListener(markers[j], 'click', makePopVisible);
                    j++;
                }
            });
        }
    });
}

//Error handling
function googleError() {
    vm.winPopVisible(false);
    vm.dlgtitle("Map loading failed!");
    vm.dlgmsg("Oops, something went wrong! Please check your connection and refresh the page!");
    $( "#dialog" ).dialog();
}

// Displays the info window to the selected marker
function makePopVisible() {
    var marker = this;

    if (clicked_marker !== null){
        clicked_marker.setIcon(default_marker);
    }

    clicked_marker = marker;

    this.setIcon(pinSymbol('blue'));
    // Creates the html output of the list of events of the selected location
    var itinerary = genEventList(marker.events);

    /*jshint multistr: true */
    var infotext = '<div id="popWindow" visible=true >\
                    <h3>' + marker.name + '</h3>\
                    <div>' + itinerary + '</div>\
                </div>';

    // Centers the map on the selected marker and opens the info window
    map.setCenter(marker.getPosition());
    map.panBy(0, -150);
    popWindow.setContent(infotext);
    popWindow.open(map, marker);
}

// Creates the html output of the list of events of the selected location
function genEventList(listevent){
    var events = '<p id="eventtime">';

    listevent.forEach(function(m){
        //create children divs for display and append to InfoWindow
        events = events + m.event_time + '</p><p id="eventname">' + m.event_name + '</p>';
    });
    return events;
}

function resetPin(){
    return {
        path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
        scale: 1,
        icon: default_marker
    };
}

function pinSymbol(color) {
    return {
        path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#000',
        strokeWeight: 2,
        scale: 1
    };
}

function loadapp() {
    initialize();
    loadJSON();
}

vm = new ViewModel();
ko.applyBindings(vm);