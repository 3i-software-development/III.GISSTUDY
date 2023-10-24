var map;
var vectorSource;
var draw;
var isDrawing = false;
var polygons = []; // Mảng chứa các polygon đã vẽ
var defaultPolygon; // Polygon ban đầu
var link = "/Image/";
var googleLayer;
var osmLayer;
var geojson = {};
var fromMarker = null;
var endMarker = null;
var isSelectingFrom = true;
//Thuộc tính Popup
var ShowPopup=false;
var container = document.getElementById("popup");  
var closer = document.getElementById("popup-closer");
var popupElement = document.getElementById('popup');
var popupContentElement = document.getElementById('popup-content');
//hệ tọa độ
const PIXEL="EPSG:3857"
const LONLAT="EPSG:4326"

var popup = new ol.Overlay({
    element: popupElement,
    positioning: 'bottom-center',
    stopEvent: false,
    offset: [0, -15],
});
closer.onclick = function (event) {
    event.stopPropagation(); // Ngăn chặn sự kiện click lan toả
    popup.setPosition(undefined);
    map.removeOverlay(popup); // Loại bỏ overlay khi đóng popup
    ShowPopup=false;
    closer.blur();
    return false;
};
// Tạo polygon ban đầu
var polygonCoordinates = [
    [102.1400, 23.4000],
    [109.4600, 23.4000],
    [109.4600, 8.1800],
    [102.1400, 8.1800],
    ];      
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
function CongNghiepAPolygon() {
    fetch('../JS/CongNghiepA.json')
        .then(response => response.json())
        .then(data => {
            // Use the 'data' variable which now contains the JSON data
            var data2 = data;
            console.log(data2);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
function DrawCylinder() {
    fetch('./cylinkers.json')
        .then(response => response.json())
        .then(data => {
            // Use the 'data' variable which now contains the JSON data
            var geojson2 = data;
            geojson2.forEach(marker=>{
                var location=[
                    marker.location.longitude,
                    marker.location.latitude
                ]
                
                var iconStyle = new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [0.5, 0.5],
                        src: link + "gasFire.png",
                        scale: 0.7,
                    }),
                });
                drawMarker(iconStyle,ol.proj.transform(location,LONLAT, PIXEL))
            })
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
function CheckPosion(point)
{
    var features = new ol.format.GeoJSON().readFeatures(geojson, {
        featureProjection: PIXEL, // Chuyển đổi hệ tọa độ sang EPSG:3857
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
        featureProjection: PIXEL, // Chuyển đổi hệ tọa độ sang EPSG:3857
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
        featureProjection: PIXEL, // Chuyển đổi hệ tọa độ sang EPSG:3857
    });

    // Lọc các đối tượng có 'VARNAME_2' trùng với giá trị của biến 'name'
    var filteredFeatures = features.filter(function (feature) {
        return feature.get('VARNAME_2') === name;
    });

    vectorSource.clear(); // Xóa tất cả các đối tượng trên lớp vector

    // Tạo phong cách chỉ với đường viền màu đen
    var style = new ol.style.Style({
            stroke: new ol.style.Stroke({
            color: 'blue', // Màu đen cho đường viền
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
            zoom: 6,
        }),
    });
    
    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.5],
            src: link + "gasFire.png",
            scale: 0.7,
        }),
    });
    var A = [105.78152087266271,21.05558941967182]; // Thay đổi lon_A và lat_A thành tọa độ của điểm A
    var B = [105.77562308451664,21.05875443266983]; // Thay đổi lon_B và lat_B thành tọa độ của điểm B
    drawMarker(iconStyle,ol.proj.transform(A,LONLAT, PIXEL))
    drawMarker(iconStyle,ol.proj.transform(B,LONLAT, PIXEL))
    loadFindWay(A,B)
    
    defaultPolygon = new ol.Feature({
        geometry: new ol.geom.Polygon([polygonCoordinates]).transform(LONLAT, PIXEL),
    });

    //vectorSource.addFeature(defaultPolygon);
    
    }
    //======================================================

    function loadFindWay(A,B){
        
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
        // // Tạo overlay cho điểm A (điểm bắt đầu)
        // var markerA = new ol.Overlay({
        //     position: ol.proj.fromLonLat(A),
        //     positioning: 'center-center',
        //     element: document.createElement('div'),
        // });
        // markerA.getElement().className = 'marker'; // Sử dụng CSS class "marker" cho hình tròn

        // // Tạo overlay cho điểm B (điểm kết thúc)
        // var markerB = new ol.Overlay({
        //     position: ol.proj.fromLonLat(B),
        //     positioning: 'center-center',
        //     element: document.createElement('div'),
        // });
        // markerB.getElement().className = 'marker'; // Sử dụng CSS class "marker" cho hình tròn

        // // Thêm các overlay vào bản đồ
        // map.addOverlay(markerA);
        // map.addOverlay(markerB);

        map.addLayer(vectorLayer);
        // Gửi yêu cầu lấy đường đi từ OpenRouteService
        var url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
        var apiKey = '5b3ce3597851110001cf6248889645833c6d4bfdbb493ecfb3f2590e'; // Thay thế YOUR_API_KEY bằng API key của bạn
        var requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey,
            },
            body: JSON.stringify({
                'coordinates': [A, B],
            }),
        };

        fetch(url, requestOptions)
            .then(response => response.json())
            .then(data => {
                // Lấy đường đi từ dữ liệu trả về
                var route = data.features[0];
                console.log(route);
                // Thêm đường đi vào lớp Vector
                vectorLayer.getSource().addFeature(new ol.Feature({
                    geometry: new ol.format.GeoJSON().readGeometry(route.geometry).transform(LONLAT, PIXEL),
                }));

                // Điều chỉnh bản đồ để hiển thị toàn bộ đường đi
                // var extent = vectorLayer.getSource().getExtent();
                // map.getView().fit(extent, map.getSize());
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    // Kiểm tra xem có thuộc polygon không và hiển thị thuộc tỉnh nào
    function checkPointAndAddIcon(evt) {
        if (isDrawing) {
            return;
        }
        const marker = map.forEachFeatureAtPixel(evt.pixel, (feature) => {
            if (feature.getGeometry() instanceof ol.geom.Point) {
                console.log(feature)

                return feature; // Đây là một marker
            }
        });
        if(marker){
            ShowPopup=false;
        }
        if (ShowPopup) {
            return;
        }
        var selectedPoint = evt.coordinate;
        //List điạ chỉ
        var features = new ol.format.GeoJSON().readFeatures(geojson, {
            featureProjection: PIXEL, // Chuyển đổi hệ tọa độ sang EPSG:3857
        });

        var a=CheckPosion(selectedPoint, features);
        var address=ol.proj.transform(selectedPoint, PIXEL, LONLAT);
        //Lấy điạ chỉ
        if(a!=undefined){
            a=a.values_;    
            address=a.NAME_0+','+a.NAME_1+','+a.NAME_2;
        }
        
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                src: link + "gasFire.png",
                scale: 0.7,
            }),
        });

        if (marker) {
            showPopup(selectedPoint, address);
            selectedFeature=marker;
        } else {
            drawMarker(iconStyle,selectedPoint);
            showPopup(selectedPoint, address);
        }
    }

    function drawMarker(markerStyle,coordinate){
        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(coordinate),
        });

        iconFeature.setStyle(markerStyle);
        vectorSource.addFeature(iconFeature);
        
        console.log(coordinate)
    }

    function showPopup(coordinate, content) {
        ShowPopup=true;
        popupContentElement.innerHTML = content;
        map.addOverlay(popup);
        popup.setPosition(coordinate);
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

    // Định nghĩa hàm mô phỏng chuyển động của marker
function simulateMarkerMovement() {
    var markers = [];
    var time = 0;
    var dr = true;

    var listLonLat = [
        [-43.19821603433218, -22.906235579377366],
            [-43.19787271157827, -22.90637393840575],
            [-43.1976795925292, -22.906907607621335],
            [-43.197228981414696, -22.906966904071183],
            [-43.19664962426748, -22.906729718116182],
            [-43.1962204708251, -22.906630890512474],
            [-43.19564111367788, -22.906433235088983],
            [-43.19529779092398, -22.906413469530776],
            [-43.19480426446524, -22.90625534496148],
            [-43.1942034496459, -22.906097220207812],
            [-43.1936455501708, -22.905978626521517],
            [-43.19330222741689, -22.905860032731525],
            [-43.19295890466299, -22.90576120449397],
            [-43.1926370395812, -22.905642610513823],
            [-43.192207886138824, -22.905464719349112],
            [-43.191478325286774, -22.90528682795103],
            [-43.19031961099233, -22.904950810229067],
            [-43.18984754220571, -22.904713620747557],
            [-43.18909652368154, -22.904515962529388],
            [-43.18832404748526, -22.904259006415046],
            [-43.18789489404287, -22.904140411121148],
            [-43.187530113616845, -22.904061347534252],
            [-43.187165333190826, -22.903903220222162],
            [-43.186779095092675, -22.903863688365334],
            [-43.186457230010895, -22.903745092725714],
            [-43.18617828027334, -22.903606731015074],
            [-43.18585641519156, -22.903448603172905],
            [-43.185556007781884, -22.903468369163264],
            [-43.185277058044335, -22.903290475146378],
            [-43.18510539666738, -22.903250943110933],
            [-43.18493373529043, -22.90319164503616],
            [-43.184676243225, -22.90319164503616],
            [-43.18452603952017, -22.903112580896135],
            [-43.18437583581534, -22.903033516709996],
            [-43.1841183437499, -22.902954452477786],
            [-43.18388230935659, -22.90289515427338],
            [-43.183796478668114, -22.903132346935465],
            [-43.183667732635406, -22.903428837179675],
            [-43.183517528930565, -22.903745092725714],
            [-43.18343169824209, -22.904061347534252],
            [-43.18330295220938, -22.904259006415046],
            [-43.1832171215209, -22.904476430851176],
            [-43.18313129083243, -22.904654323312357],
            [-43.1831098331603, -22.904792683954156],
            [-43.18295962945547, -22.905049639057253],
            [-43.182916714111236, -22.90518799929572],
            [-43.18280942575064, -22.905444953649734],
            [-43.1826592220458, -22.905682141852054],
            [-43.18261630670157, -22.905899564006376],
            [-43.182530476013085, -22.90611698581209],
            [-43.18238027230825, -22.90637393840575],
            [-43.18214423791494, -22.906532062836746],
            [-43.182015491882225, -22.906887842132278],
            [-43.181800915161034, -22.907026200495096],
            [-43.18143613473501, -22.906927373107493],
            [-43.181243015685936, -22.906828545647855],
            [-43.18102843896475, -22.90686807664035],
            [-43.18092115060415, -22.90712502781068],
            [-43.1808567775878, -22.907421509325246],
            [-43.180770946899315, -22.907698224820592],
            [-43.180706573882965, -22.90789587840007],
            [-43.18062074319448, -22.908133062315116],
            [-43.180513454833886, -22.908409776358283],
            [-43.180449081817535, -22.90868648983667],
            [-43.18034179345694, -22.908943437560936],
            [-43.18021304742422, -22.90920038479821],
            [-43.18012721673574, -22.909398036187838],
            [-43.180041386047264, -22.909654982563566],
            [-43.17993409768667, -22.90991192845233],
            [-43.17986972467031, -22.910109578804608],
            [-43.179762436309716, -22.910366523831797],
            [-43.17965514794912, -22.91062346837198],
            [-43.17959077493277, -22.910840882602542],
            [-43.179504944244286, -22.911097826243633],
            [-43.17939765588369, -22.91149312320212],
            [-43.17924745217886, -22.911769830387215],
            [-43.17911870614615, -22.912026772267637],
            [-43.179011417785546, -22.912244184247584],
            [-43.178968502441315, -22.912540654567422],
            [-43.17888267175283, -22.912916182708386],
            [-43.178732468048004, -22.913232416125425],
            [-43.17860372201529, -22.913509119760164],
            [-43.178303314605614, -22.913667235869255],
            [-43.17815311090078, -22.91386488074626],
            [-43.177809788146874, -22.913983467534138],
            [-43.17744500772085, -22.914082289778108],
            [-43.177058769622704, -22.9141613475214],
            [-43.176758362213036, -22.91420087637576],
            [-43.17641503945914, -22.914299698461235],
            [-43.17611463204946, -22.914299698461235],
            [-43.17577130929556, -22.9141415830899],
            [-43.1755996479186, -22.913924174153166],
            [-43.17540652886953, -22.913746293854643],
        ];

    // Hàm để xóa các marker trước khi thêm marker mới
    function deleteMarkers() {
        
    }

    // Hàm để thêm marker mới và xóa marker cũ
function addMarkerAndRemovePrevious(locationS, rotationA) {
    // Xóa marker cũ
    deleteMarkers();

    // Thêm marker mới
    var marker = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [
                new ol.Feature({
                    geometry: new ol.geom.Point(locationS)
                })
            ],
        }),
        style: new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                crossOrigin: 'anonymous',
                src: link + 'car_topview.svg',
                rotation: rotationA,
            })
        })
    });

    markers.push(marker);
    map.addLayer(marker);
}

function setPosition() {
    if (time <= 0) {
        dr = true;
    }
    if (time >= listLonLat.length - 1) {
        dr = false;
    }

    var locationS, locationE, rotationA;

    if (dr == true) {
        locationS = ol.proj.fromLonLat([listLonLat[time][0], listLonLat[time][1]]);
        locationE = ol.proj.fromLonLat([listLonLat[time + 1][0], listLonLat[time + 1][1]]);
        rotationA = setRotation(locationS, locationE);
        time++;
    } else {
        locationS = ol.proj.fromLonLat([listLonLat[time][0], listLonLat[time][1]]);
        locationE = ol.proj.fromLonLat([listLonLat[time - 1][0], listLonLat[time - 1][1]]);
        rotationA = setRotation(locationS, locationE);
        time--;
    }

    // Sử dụng hàm addMarkerAndRemovePrevious để thêm marker mới và xóa marker cũ
    addMarkerAndRemovePrevious(locationS, rotationA);
}



function setRotation(locationS, locationE) {
        if (Math.abs(locationS[0] - locationE[0]) < 0.0000000000000000000000001) {
            return 90;
        } else {
            return Math.atan2((locationE[0] - locationS[0]), (locationE[1] - locationS[1]));
        }
}

    // Gọi setPosition để bắt đầu mô phỏng chuyển động
    setInterval(setPosition, 300);
}

// Gọi hàm simulateMarkerMovement để bắt đầu mô phỏng chuyển động của marker
simulateMarkerMovement();
var selectedFeature = null; // Biến lưu trạng thái đã chọn


// Xóa marker đã chọn
function deleteSelectedMarker() {
  if (selectedFeature) {
    vectorSource.removeFeature(selectedFeature);
    selectedFeature = null; // Đặt lại trạng thái đã chọn
  }
}
function clearAllMarkers() {
    // Lấy danh sách tất cả các lớp (layers) trên bản đồ
    var layers = map.getLayers().getArray();

    // Lặp qua các lớp để tìm và xóa lớp marker
    layers.forEach(function (layer) {
        if (layer instanceof ol.layer.Vector) {
            map.removeLayer(layer);
        }
    });

    // Sau khi xóa tất cả các lớp marker, bạn có thể tạo một lớp vector mới
    // để sử dụng cho việc vẽ marker sau này.
    vectorSource = new ol.source.Vector();
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
    });
    map.addLayer(vectorLayer);
}