var map, popWindow, vm, j, c, f;
var markers = [];
var filtered = [];
var event_all = [];
var ichi = new Date("2017-07-15");
var nichi = new Date("2017-07-31");

// View Model
var ViewModel = function() {
    var self = this;

    self.name = ko.observable();
    self.events = ko.observableArray();
    self.locations = ko.observableArray();
    self.winPopVisible = ko.observable(false);
    self.eventlist = ko.observable();
    self.stdate = ko.observable(ichi);
    self.endate = ko.observable(nichi);
    
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
            winPopVisible: false,
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

    // Sets the visibility flag of the info window
    this.popvisible = function() {
        self.winPopVisible = ko.observable(true);
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
function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
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
        },
        // Error handling logic provided by Learner on 
        // https://stackoverflow.com/questions/377644/jquery-ajax-error-handling-show-custom-exception-messages
        error: function (response) {
          var r = jQuery.parseJSON(response.responseText);
          alert("Message: " + r.Message);
          alert("StackTrace: " + r.StackTrace);
          alert("ExceptionType: " + r.ExceptionType);
        }
    });
}

// Loads API data from static file instead of the API end point for testing
// Avoids hitting the end point repeatedly
function loadStatic() {
    // Path to file
    var jsonfile = '/script/sample_data.json';

    // Loads the json file
    var jsondata = $.getJSON(jsonfile)
    .done(function(data) {
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
                // Adds the marker
                google.maps.event.addListener(markers[j], 'click', makePopVisible);
                j++;
            }
        });
    });
}

// Displays the info window to the selected marker
function makePopVisible() {
    var marker = this;
    // Creates the html output of the list of events of the selected location
    var itinerary = genEventList(marker.events);
    // Sets the html content to the observable and sets visibility to true
    vm.eventlist(itinerary);
    vm.name(marker.name);
    vm.winPopVisible(true);
    // Centers the map on the selected marker and opens the info window
    map.setCenter(marker.getPosition());
    map.panBy(0, -150);
    popWindow.setContent($('#popWindow').html());
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

$(document).ready(function(){
    initialize();

    vm = new ViewModel();
    loadJSON();
/*    loadStatic();*/
    ko.applyBindings(vm);
});