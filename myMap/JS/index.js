var map;
var vectorSource;
var draw;
var isDrawing = false;
var polygons = []; // Mảng chứa các polygon đã vẽ
var defaultPolygon; // Polygon ban đầu
var link = "/III.GISSTUDY/myMap/Image/";
var googleLayer;
var osmLayer;
var geojson = {};
var fromMarker = null;
var endMarker = null;
var isSelectingFrom = true;
const container = document.getElementById("popup");  
const closer = document.getElementById("popup-closer");

function readJson() {
    fetch('./VN_Huyen.geojson')
        .then(response => response.json())
        .then(data => {
            // Use the 'data' variable which now contains the JSON data
            geojson = data;
            console.log(geojson);

        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function CheckPosion(point)
{
    var features = new ol.format.GeoJSON().readFeatures(geojson, {
        featureProjection: 'EPSG:3857', // Chuyển đổi hệ tọa độ sang EPSG:3857
    });

    result=features.find(poligon=>checkPointInsidePolygon(point,poligon));
    return result;
}
function addPolygon() {
    // Kiểm tra xem vectorSource đã được tạo hay chưa
    if (!vectorSource) {
        vectorSource = new ol.source.Vector();
    }

    var features = new ol.format.GeoJSON().readFeatures(geojson, {
        featureProjection: 'EPSG:3857', // Chuyển đổi hệ tọa độ sang EPSG:3857
    });

    vectorSource.clear(); // Xóa tất cả các đối tượng trên lớp vector
    vectorSource.addFeatures(features); // Thêm các đối tượng mới vào lớp vector

    // Tùy chỉnh hiển thị bản đồ để hiển thị tất cả polygon.
    var extent = vectorSource.getExtent();
    map.getView().fit(extent, map.getSize());
}

function addPolygonByName(name) {
    // Kiểm tra xem vectorSource đã được tạo hay chưa
    if (!vectorSource) {
        vectorSource = new ol.source.Vector();
    }

    var features = new ol.format.GeoJSON().readFeatures(geojson, {
        featureProjection: 'EPSG:3857', // Chuyển đổi hệ tọa độ sang EPSG:3857
    });

    // Lọc các đối tượng có 'VARNAME_2' trùng với giá trị của biến 'name'
    var filteredFeatures = features.filter(function (feature) {
        return feature.get('VARNAME_2') === name;
    });

    vectorSource.clear(); // Xóa tất cả các đối tượng trên lớp vector

    // Tạo phong cách chỉ với đường viền màu đen
    var style = new ol.style.Style({
            stroke: new ol.style.Stroke({
            color: 'black', // Màu đen cho đường viền
            width: 2 // Độ rộng của đường viền
        })                                              
    });

    // Gán phong cách cho các đối tượng trong filteredFeatures
    filteredFeatures.forEach(function (feature) {
        feature.setStyle(style);
    });

    vectorSource.addFeatures(filteredFeatures); // Thêm các đối tượng mới vào lớp vector

    if (filteredFeatures.length > 0) {
        // Nếu có các đối tượng được tìm thấy, tùy chỉnh hiển thị bản đồ để hiển thị chúng.
        var extent = vectorSource.getExtent();
        map.getView().fit(extent, map.getSize());
    } else {
        // Xử lý trường hợp không tìm thấy đối tượng
        console.log('Không tìm thấy đối tượng có VARNAME_2 là ' + name);
    }
}


    // khởi tạo bản đồ =================================
    function createMap() {
    // Create a source for the features
    vectorSource = new ol.source.Vector();

    // Create a vector layer to display the features
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
    });

    // Create a map
    const key = "get_your_own_OpIi9ZULNHzrESv6T2vL";
    const source = new ol.source.TileJSON({
        url: `https://api.maptiler.com/maps/streets-v2/tiles.json?key=${key}`,
        tileSize: 512,
        crossOrigin: "anonymous",
    });
    const attribution = new ol.control.Attribution({
        collapsible: false,
    });

    // Google Maps Layer
    googleLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
    })
    });
    // OpenStreetMap Layer
    osmLayer = new ol.layer.Tile({
        source: new ol.source.OSM()
    });

    map = new ol.Map({
        target: "map",
        layers: [
            new ol.layer.Tile({
                source: source,
            }),
            vectorLayer, // Add the vector layer to the map
        ],
        controls: ol.control.defaults.defaults({ attribution: false }).extend([attribution]),
        view: new ol.View({
            constrainResolution: true,
            center: ol.proj.fromLonLat([107.1400, 15.4000]),
            zoom: 7,
        }),
    });

    var vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
        }),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'black',
                width: 3
            })
        })
    });

    map.addLayer(vectorLayer);

    // Tạo polygon ban đầu
    var polygonCoordinates = [
    [102.1400, 23.4000],
    [109.4600, 23.4000],
    [109.4600, 8.1800],
    [102.1400, 8.1800],
    ];

    defaultPolygon = new ol.Feature({
        geometry: new ol.geom.Polygon([polygonCoordinates]).transform('EPSG:4326', 'EPSG:3857'),
    });

    vectorSource.addFeature(defaultPolygon);
    }
    //======================================================

    

    // Kiểm tra xem có thuộc polygon không và hiển thị thuộc tỉnh nào
    function checkPointAndAddIcon(evt) {
    if (isDrawing) {
        return;
    }
    var selectedPoint = evt.coordinate;
    var a=CheckPosion(selectedPoint);
    var address
    if(a!=undefined){
        a=a.values_;
        address=a.NAME_0+','+a.NAME_1+','+a.NAME_2;
    }
    var pointInsideAnyPolygon = false; // Biến để kiểm tra điểm có thuộc vào bất kỳ polygon nào không

    // Kiểm tra điểm với polygon mặc định
    var defaultPolygonGeometry = defaultPolygon;
    if (checkPointInsidePolygon(selectedPoint,defaultPolygonGeometry)) {
        console.log("Point is inside the default polygon.");
        pointInsideAnyPolygon = true;
        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(selectedPoint),
        });

        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                src: link + "map-marker.svg",
                color: 'blue',
                scale: 0.05,
            }),
        });

        iconFeature.setStyle(iconStyle);
        vectorSource.addFeature(iconFeature);

        // Hiển thị thông tin trong popup khi click
        var popupContent = "<b>Address:</b> " + address;
        showPopup(evt.coordinate, popupContent);
    }

    function showPopup(coordinate, content) {
        var popupElement = document.getElementById('popup');
        var popupContentElement = document.getElementById('popup-content');
    
        if (popupElement && popupContentElement) {
            popupContentElement.innerHTML = content;
    
            var popup = new ol.Overlay({
                element: popupElement,
                positioning: 'bottom-center',
                stopEvent: false,
                offset: [0, -15],
            });
    
            map.addOverlay(popup);
            popup.setPosition(coordinate);
    }
    
    const overlay = new ol.Overlay({
        element: container,
        autoPan: {
          animation: {
            duration: 250,
          },
        },
        offset: [0, -30],
      });
    
    closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
  };
}

    // Kiểm tra điểm với tất cả các polygon trong mảng
    for (var i = 0; i < polygons.length; i++) {
        var polygonGeometry = polygons[i];
        if (checkPointInsidePolygon(selectedPoint,polygonGeometry)) {
            console.log("Point is inside polygon " + i + ".");
            pointInsideAnyPolygon = true;
            var iconFeature = new ol.Feature({
                geometry: new ol.geom.Point(selectedPoint),
            }); 

            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 0.5],
                    src: link + "map-marker.svg",
                    color: 'green',
                    scale: 0.05,
                }),
            });

            iconFeature.setStyle(iconStyle);
            vectorSource.addFeature(iconFeature);
            break; // Nếu điểm thuộc một polygon, không cần kiểm tra tiếp
        }
    }

    if (!pointInsideAnyPolygon) {
        console.log("Point is outside all polygons.");

        // Add an icon at the clicked location
        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(selectedPoint),
        });

        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                src: link + "map-marker.svg",
                color: 'red',
                scale: 0.05,
            }),
        });

        iconFeature.setStyle(iconStyle);
        vectorSource.addFeature(iconFeature);
    }

    var coordinateInfo = document.getElementById('coordinate-info');
    coordinateInfo.innerHTML = 'Coordinates: ' + address;
    }

    function checkPointInsidePolygon(point, polygon){
        return polygon.getGeometry().intersectsCoordinate(point);
        }
    //=======================================================

    // vẽ và lưu tọa độ polygon vào tọa độ ==================
    function startDrawing() {
    if (!isDrawing) {
        draw = new ol.interaction.Draw({
            source: vectorSource,
            type: "Polygon",
        });
        map.addInteraction(draw);
        isDrawing = true;

        // Listen to the `drawend` event to capture the drawn polygon
        draw.on("drawend", function (event) {
            var drawnPolygon = event.feature;
            polygons.push(drawnPolygon); // Thêm polygon vào mảng
            savePolygonsToGeoJSONFile();
        });
    }
    }

    function savePolygonsToGeoJSONFile() {
    // Tạo một đối tượng GeoJSON
    var geojsonObject = {
        type: "FeatureCollection",
        features: []
    };

    // Lặp qua mảng polygons và chuyển đổi chúng thành đối tượng GeoJSON
    polygons.forEach(function(polygon) {
        var format = new ol.format.GeoJSON();
        var geojsonFeature = format.writeFeature(polygon);
        geojsonObject.features.push(geojsonFeature);
    });

    // Chuyển đổi đối tượng GeoJSON sang JSON
    var geojsonContent = JSON.stringify(geojsonObject);

    // Tạo một đối tượng Blob để lưu dữ liệu GeoJSON
    var blob = new Blob([geojsonContent], { type: "application/geo+json" });

    // Tạo một URL đối tượng để tạo liên kết tải về
    var url = URL.createObjectURL(blob);

    // Tạo một thẻ a để tạo liên kết tải về
    var a = document.createElement("a");
    a.href = url;
    a.download = "polygons.geojson"; // Tên file GeoJSON
    a.click();
    }


    function stopDrawing() {
        if (isDrawing) {
            map.removeInteraction(draw);
            isDrawing = false;
        }
    }
    // =======================================================
    
    // đổi bản đồ ============================================
    function switchMap() {
        // Kiểm tra lớp nền hiện tại và chuyển đổi
        
        if (map.getLayers().getArray()[0] === googleLayer) {
            map.getLayers().setAt(0, osmLayer); // Chuyển sang OpenStreetMap
        }
        else if (map.getLayers().getArray()[0] === osmLayer) {
            map.getLayers().setAt(0, googleLayer); // Chuyển sang OpenStreetMap
        } else {
            map.getLayers().setAt(0, googleLayer); // Chuyển sang Google Maps
        }
    }

    //========================================================


    // Tính khoảng cách  ======================================
    function degreesToMeters(degrees) {
        var radius = 6371000; // Bán kính trái đất ở mức biển (đơn vị: mét)
        return degrees * (Math.PI / 180) * radius;
    }
    
    function Distance(from, end) {
        var line = new ol.geom.LineString([from, end]);
        var distanceInDegrees = line.getLength();
        var distanceInMeters = degreesToMeters(distanceInDegrees);
        var distanceInKilometers = distanceInMeters / 1000;
        return distanceInKilometers;
    }

    function handleMapDoubleClick(event) {
        var coordinates = event.coordinate;
        var markerStyle = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({ color: 'blue' }),
                stroke: new ol.style.Stroke({ color: 'black', width: 3 }),
            }),
        });
    
        if (isSelectingFrom) {
            fromMarker = createMarker(coordinates, markerStyle);
            isSelectingFrom = false;
        } else {
            endMarker = createMarker(coordinates, markerStyle);
            var distance = Distance(fromMarker.getGeometry().getCoordinates(), endMarker.getGeometry().getCoordinates());
            var distanceinfo = document.getElementById('distance-info');
            distanceinfo.innerHTML = 'Distance: ' + distance + " kilometer";
            isSelectingFrom = true;
        }
    }

    function createMarker(coordinates, style) {
        var marker = new ol.Feature({
            geometry: new ol.geom.Point(coordinates)
        });
    
        marker.setStyle(style);
    
        var markerLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [marker],
            }),
        });
    
        map.addLayer(markerLayer);
    
        return marker;
    }
    //=========================================================

    
