// Your polygon coordinates as an array of [x, y] pairs
var polygonCoordinates = [
    [0, 0],
    [50, 0],
    [50, 50],
    [0, 50],
  ];
  
  // Create a polygon feature
  var polygonFeature = new ol.Feature({
    geometry: new ol.geom.Polygon([polygonCoordinates]).transform('EPSG:4326', 'EPSG:3857'),
  });
  
  // Your point coordinates as an array of [x, y]
  var pointCoordinates = [25, 25];
  
  // Create a point feature
  var pointFeature = new ol.Feature({
    geometry: new ol.geom.Point(pointCoordinates).transform('EPSG:4326', 'EPSG:3857'),
  });
  
  // Create a source for the features
  var vectorSource = new ol.source.Vector({
    features: [polygonFeature, pointFeature],
  });
  
  var vectorSource = new ol.source.Vector();

// Create a vector layer to display the features
var vectorLayer = new ol.layer.Vector({
  source: vectorSource,
});
  
  // Create a map
  var map;
const key = "get_your_own_OpIi9ZULNHzrESv6T2vL";
const source = new ol.source.TileJSON({
  url: `https://api.maptiler.com/maps/streets-v2/tiles.json?key=${key}`,
  tileSize: 512,
  crossOrigin: "anonymous",
});
const attribution = new ol.control.Attribution({
  collapsible: false,
});

  function createMap() {
    map = new ol.Map({
      target: "map",
      layers: [
        new ol.layer.Tile({
          source: source,
        }),
      ],
      controls: ol.control.defaults.defaults({ attribution: false }).extend([attribution]),
      view: new ol.View({
        constrainResolution: true,
        center: ol.proj.fromLonLat([25, 25]),
        zoom: 5,
      }),
    });
  }

  
 

  


  window.onload = function () {
    createMap();
    // Call the checkPointInsidePolygon function when you want to check
    map.addLayer(vectorLayer);
    checkPointInsidePolygon();
  };
  
  
  
  // Function to check if the point is inside the polygon
function checkPointInsidePolygon() {
  var selectedFeatures = select.getFeatures();

  if (selectedFeatures.getLength() === 2) {
    // If both the polygon and point are selected
    var polygonGeometry = selectedFeatures.getArray()[0].getGeometry();
    var pointGeometry = selectedFeatures.getArray()[1].getGeometry();

    if (polygonGeometry.intersectsCoordinate(pointGeometry.getCoordinates())) {
      console.log("Point is inside the polygon.");
    } else {
      console.log("Point is outside the polygon.");
    }
  } else {
    console.log("Select both the polygon and point to check.");
  }
}

  