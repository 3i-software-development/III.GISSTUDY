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
      center: ol.proj.fromLonLat([100,18]),
      zoom: 5,
    }),
  });
}

// Your polygon coordinates as an array of [x, y] pairs
var polygonCoordinates = [
  [0, 0],
  [50, 0],
  [50, 50],
  [0, 50],
];

var polygonFeature = new ol.Feature({
  geometry: new ol.geom.Polygon([polygonCoordinates]).transform("EPSG:4326", "EPSG:3857"),
});
// var polygonFeature = new ol.Feature({
//   geometry: new ol.geom.Polygon([polygonCoordinates]),
// });
// Your point coordinates as an array of [x, y]
var pointCoordinates = [18,18];

var olCoordinate = ol.proj.fromLonLat(pointCoordinates);

// Create a point feature
var pointFeature = new ol.Feature({
  // geometry: new ol.geom.Point(ol.proj.toLonLat(pointCoordinates)),
  geometry: new ol.geom.Point(pointCoordinates).transform("EPSG:4326", "EPSG:3857"),
});

// var isInside = pointFeature.getGeometry().intersectsCoordinate(pointFeature.getGeometry().getCoordinates());
// console.log("isInside", isInside);

var polygonGeometry = pointFeature.getGeometry();
var coords = pointFeature.getGeometry().getCoordinates();

console.log("point", pointFeature.getGeometry());
// console.log("polygonGeometry", polygonGeometry);

polygonGeometry.intersectsCoordinate(pointFeature);
console.log("is inside", polygonGeometry.intersectsCoordinate(coords));

// var polygon = new ol.geom.Polygon([
//   [ol.proj.fromLonLat([0, 0]), ol.proj.fromLonLat([50, 0]), ol.proj.fromLonLat([50, 50]), ol.proj.fromLonLat([0, 50])],
// ]);
// var point = new ol.geom.Point(ol.proj.fromLonLat([100, 100]));

// console.log("point", point);
// // console.log("polygon", polygon);

// console.log("compare point", point === pointFeature.getGeometry());

// var isInside = polygon.intersectsCoordinate(point.getCoordinates());
// console.log(isInside);

// Create a source for the features
var vectorSource = new ol.source.Vector({
  features: [polygonFeature, pointFeature],
});

// Create a vector layer to display the features
var vectorLayer = new ol.layer.Vector({
  source: vectorSource,
});

window.onload = function () {
  createMap();
  // Call the checkPointInsidePolygon function when you want to check
  map.addLayer(vectorLayer);
  var selectInteraction = new ol.interaction.Select();

  // Add the select interaction to the map
  map.addInteraction(selectInteraction);

  // Listen for the "select" event to check if the point is inside the polygon
  selectInteraction.on("select", function (event) {
    var selectedFeatures = event.selected;
    console.log("event.selected :>> ", event.selected);
    console.log("getGeometry :>> ", event.selected[0].getGeometry());
    if (selectedFeatures.length === 2) {
      // Both the polygon and point are selected
      var polygonGeometry = selectedFeatures[0].getGeometry();
      var pointGeometry = selectedFeatures[1].getGeometry();

      console.log("polygonGeometry :>> ", polygonGeometry);
      console.log("pointGeometry :>> ", pointGeometry);

      // Use Turf.js to check if the point is inside the polygon
      var isInside = turf.booleanPointInPolygon(pointGeometry.getCoordinates(), polygonGeometry.getCoordinates()[0]);

      if (isInside) {
        console.log("Point is inside the polygon");
      } else {
        console.log("Point is outside the polygon");
      }
    }
  });
};
