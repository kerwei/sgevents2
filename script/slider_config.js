// Default settings for the date range slider
$("#slider").dateRangeSlider({
  "bounds": {
      min: new Date(2017, 0, 1),
      max: new Date(2018, 0, 1)
  },
      "defaultValues": {
      min: new Date(2017, 7, 9),
      max: new Date(2018, 0, 1)
  }
});

// Event listener for the date range slider
$("#slider").bind("userValuesChanged", function(e, data){
  // Start date
  vm.stdate(data.values.min);
  // End date
  vm.endate(data.values.max);
  f = 0;
  // Clear all markers currently on the map
  clearMarkers();
  filtered = [];
  // FIltered markers
  vm.compevents().forEach(function(k){
    filtered[f] = new google.maps.Marker({
        position: k.marker.position,
        animation: google.maps.Animation.DROP,
        name: k.marker.name,
        events: k.marker.events,
    });
    // Re-drop the markers
    dropMarker(filtered[f]);
    // And add back the event listener
    google.maps.event.addListener(filtered[f], 'click', makePopVisible);
    f++;
  });
});