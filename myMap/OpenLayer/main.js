const geoJsonPath = "../VN_Huyen.geojson";

var geoJsonData = {};
var markers = [];
var polygons = [];
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
      center: ol.proj.fromLonLat([108.21189433194873, 16.05173085320807]),
      zoom: 10,
    }),
  });
}
window.onload = function () {
  createMap();
  readGeoJson();
  map.on("click", function (evt) {
    var coords = ol.proj.toLonLat(evt.coordinate);
    console.log("toLonLat:>> ", coords);
    console.log("evt.coordinate:>> ", evt.coordinate);
    createMarker(evt.coordinate);
  });
};
function readGeoJson() {
  fetch(geoJsonPath)
    .then((response) => response.json())
    .then((data) => {
      geoJsonData = data;
      console.log("data :>> ", data);
      console.log("geoJsonData :>> ", geoJsonData);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
function showListMarker() {
  console.log("Show list markers :>> ", markers);
}
function createMarker(coordinate) {
  const marker = new ol.Feature({
    geometry: new ol.geom.Point(coordinate),
  });

  // Add the marker to a vector layer
  const markerLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [marker],
    }),
  });

  map.addLayer(markerLayer);
  markers.push(markerLayer);
  // Define a select interaction with a custom click event handler
  //   const select = new ol.interaction.Select({
  //     layers: [markerLayer], // Set the layer to select features from
  //   });

  //   map.addInteraction(select);
  //   select.on("select", function (event) {
  //     if (event.selected.length > 0) {
  //       // Get the coordinates of the clicked marker
  //       const selectedFeature = event.selected[0];
  //       const geometry = selectedFeature.getGeometry();
  //       const coordinates = geometry.getCoordinates();

  //       // Marker was clicked
  //       console.log("Marker clicked:>> ", coordinates);
  //       //   const popup = new ol.Overlay({
  //       //     position: coordinates,
  //       //     element: document.getElementById('popup'),
  //       //   });

  //       //   // Set the content of the popup
  //       //   document.getElementById('popup-content').innerHTML = "message";

  //       //   // Add the popup overlay to the map
  //       //   map.addOverlay(popup);

  //       //   // Show the popup
  //       //   popup.setPosition(coordinates);
  //     }
  //   });
}
function showDetailMarker(marker) {
  console.log(marker);
}
function deleteMarker(latLng) {
  markers.forEach((element) => {
    if (element.latLng == latLng) {
      map.removeLayer(element);
    }
  });
}
function deleteMarkers() {
  markers.forEach((element) => {
    map.removeLayer(element);
    // markers.shift();
  });
  markers = [];
  console.log("Delete markers.");
}

function showListPolygon() {}
function createPolygon(name) {
  const selectPoly = geoJsonData.features.find((element) => element.properties.VARNAME_2 === name);
  console.log("selectPoly :>> ", selectPoly);
  if (selectPoly === undefined) return;
  const transformedCoordinates = selectPoly.geometry.coordinates.map((polygonCoords) =>
    polygonCoords.map((linearRingCoords) =>
      linearRingCoords.map((coord) => ol.proj.transform(coord, "EPSG:4326", "EPSG:3857"))
    )
  );
  console.log("transformedCoordinates :>> ", transformedCoordinates);
  // Create a vector source with the transformed features
  const vectorSource = new ol.source.Vector({
    features: [
      new ol.Feature({
        geometry: new ol.geom.MultiPolygon(transformedCoordinates),
        properties: selectPoly.properties,
      }),
    ],
  });
  console.log("vectorSource :>> ", vectorSource.getFeatures()[0].getProperties());
  // Create a vector layer
  const vectorLayer = new ol.layer.Vector({
    source: vectorSource,
  });
  console.log("vectorLayer :>> ", vectorLayer.getSource().getFeatures()[0].getProperties().properties);
  // Add the vector layer to the map
  map.addLayer(vectorLayer);
  polygons.push(vectorLayer);
}
function createPolygons() {
  const transformedFeatures = geoJsonData.features.map((feature) => {
    let transformedCoordinates;
    transformedCoordinates = feature.geometry.coordinates.map((polygonCoords) => {
      return polygonCoords.map((linearRingCoords) =>
        linearRingCoords.map((coord) => ol.proj.transform(coord, "EPSG:4326", "EPSG:3857"))
      );
    });

    return new ol.Feature({
      geometry: new ol.geom.MultiPolygon(transformedCoordinates),
      properties: feature.properties,
    });
  });
  console.log("transformedFeatures :>> ", transformedFeatures);
  console.log("transformedCoordinates :>> ", transformedCoordinates);
  // Create a vector source with the transformed features
  // transformedFeatures.forEach((element) => {
  //   const vectorSource = new ol.source.Vector({
  //     features: element,
  //     zIndex: 0,
  //   });

  //   // Create a vector layer
  //   const vectorLayer = new ol.layer.Vector({
  //     source: vectorSource,
  //   });

  //   // Add the vector layer to the map
  //   map.addLayer(vectorLayer);
  //   polygons.push(vectorLayer);
  // });
  const vectorSource = new ol.source.Vector({
    features: transformedFeatures,
    zIndex: 0,
  });

  // Create a vector layer
  const vectorLayer = new ol.layer.Vector({
    source: vectorSource,
  });

  // Add the vector layer to the map
  map.addLayer(vectorLayer);
  polygons.push(vectorLayer);
}
function showDetailPolygon() {}
function deletePolygon(name) {
  console.log("polygons", polygons);
}
function deletePolygons() {
  console.log("polygons", polygons);

  polygons.forEach((element) => {
    map.removeLayer(element);
    // polygons.shift();
  });
  polygons = [];
  console.log("Delete polygons.");
}

// var select = new ol.interaction.Select();

// // Add the interaction to the map
// map.addInteraction(select);
// function checkPointInsidePolygon() {
//   var selectedFeatures = select.getFeatures();
//   var isInside = selectedFeatures.getLength() === 2; // If both the polygon and point are selected, the point is inside the polygon
//   if (isInside) {
//     console.log("Point is inside the polygon.");
//   } else {
//     console.log("Point is outside the polygon.");
//   }
// }
function getAllLayers() {
  console.log("Get All Layers");
  
  console.log(map.getAllLayers());
}
const btnShowMarkers = document.getElementById("btnShowMarkers");
btnShowMarkers.addEventListener("click", function () {
  showListMarker();
});
const btnDelMarkers = document.getElementById("btnDelAllMarker");
btnDelMarkers.addEventListener("click", function () {
  deleteMarkers();
});
const btnDelPolygon = document.getElementById("btnDelPolygon");
btnDelPolygon.addEventListener("click", function () {
  deletePolygons();
});
const btnDrawAllPolygon = document.getElementById("drawAllPolygon");
btnDrawAllPolygon.addEventListener("click", function () {
  createPolygons();
});
const btnGetAllLayers = document.getElementById("btnGetAllLayers");
btnGetAllLayers.addEventListener("click", function () {
  getAllLayers();
});
{
  // JavaScript code to handle form submission
  document.addEventListener("DOMContentLoaded", function () {
    // Get references to form and input elements
    var form = document.getElementById("formDrawPolygonByName");
    var inputName = document.getElementById("inputName");
    var btnSubmit = document.getElementById("btnSubmitFormDrawPolygonByName");

    // Add an event listener to the form for submission
    form.addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent the default form submission

      // Get the value of the input field
      var name = inputName.value;

      // You can perform any desired actions with the 'name' variable here
      // For now, let's just log the name to the console
      console.log("Name submitted: " + name);
      // if (name != null)
      createPolygon(name);
      // Clear the input field
      inputName.value = "";
    });

    // Add an event listener to the Submit button
    btnSubmit.addEventListener("click", function () {
      //   form.submit(); // Trigger the form submission when the button is clicked
      form.dispatchEvent(new Event("submit"));
    });
  });
}
{
  // JavaScript code to handle form submission
  document.addEventListener("DOMContentLoaded", function () {
    // Get references to form and input elements
    var form = document.getElementById("formDelPolygonByName");
    var inputName = document.getElementById("inputNameDell");
    var btnSubmit = document.getElementById("btnSubmitFormDelPolygonByName");

    // Add an event listener to the form for submission
    form.addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent the default form submission

      // Get the value of the input field
      var name = inputName.value;

      // You can perform any desired actions with the 'name' variable here
      // For now, let's just log the name to the console
      console.log("Name submitted: " + name);
      deletePolygon(name);
      // Clear the input field
      inputName.value = "";
    });

    // Add an event listener to the Submit button
    btnSubmit.addEventListener("click", function () {
      //   form.submit(); // Trigger the form submission when the button is clicked
      form.dispatchEvent(new Event("submit"));
    });
  });
}
