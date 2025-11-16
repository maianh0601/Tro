import { useState, useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import { FaMapMarkerAlt } from "react-icons/fa";
// ✅ Component điều khiển định tuyến
import { renderToStaticMarkup } from "react-dom/server";

const customIcon = new L.DivIcon({
  className: "custom-icon",
  html: renderToStaticMarkup(
    <FaMapMarkerAlt style={{ color: "#007BFF", fontSize: "30px" }} />
  ),
});

const iconMe = new L.DivIcon({
  className: "custom-icon",
  html: renderToStaticMarkup(
    <FaMapMarkerAlt style={{ color: "#0008FF", fontSize: "30px" }} />
  ),
});
function RoutingControl({ start, end }) {
  const map = useMap();

  useEffect(() => {
    if (!start || !end) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      createMarker: () => null,
      showAlternatives: false,
      routeWhileDragging: false,
    }).addTo(map);

    // Zoom để hiển thị cả điểm bắt đầu và kết thúc
    const bounds = L.latLngBounds([start, end]);
    map.fitBounds(bounds, { padding: [50, 50] });

    return () => map.removeControl(routingControl);
  }, [map, start, end]);

  return null;
}

// ✅ Component giúp bản đồ bay đến vị trí hiện tại
function MyLocationUpdater({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(location, 16);
    }
  }, [location, map]);

  return null;
}

// ✅ Hàm chính MapDetail
function MapDetail({ toado }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");

  // Lấy địa chỉ từ tọa độ
  const fetchAddress = async (lat, lon, setAddress) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      setAddress(data.display_name || "Không xác định địa chỉ");
    } catch {
      setAddress("Không xác định địa chỉ");
    }
  };

  // Lấy địa chỉ đến khi component mount
  useEffect(() => {
    if (toado) {
      fetchAddress(toado[0], toado[1], setDestinationAddress);
    }
  }, [toado]);

  // Lấy vị trí hiện tại
  const handleGetMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const location = [lat, lon];
          setCurrentLocation(location);
          fetchAddress(lat, lon, setCurrentAddress);
        },
        () => {
          alert("Không thể lấy vị trí của bạn!");
        }
      );
    } else {
      alert("Trình duyệt không hỗ trợ định vị!");
    }
  };

  return (
    <div className="px-4">
      <div className="bg-gray-200 py-4 px-4 sm:px-6 flex items-center justify-center w-full sm:w-[90%] md:w-[80%] lg:w-[70%] mx-auto rounded-xl">
        <div className="bg-white py-4 px-4 sm:px-6 w-full rounded-xl">
          <MapContainer
            key={toado}
            center={toado}
            zoom={16}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution=""
            />

            {currentLocation && (
              <>
                <Marker position={currentLocation} icon={iconMe}>
                  <Popup>{currentAddress || "Vị trí của tôi"}</Popup>
                </Marker>
                <MyLocationUpdater location={currentLocation} />
              </>
            )}

            <Marker position={toado} icon={customIcon}>
              <Popup>{destinationAddress || toado.join(", ")}</Popup>
            </Marker>

            {showRoute && currentLocation && (
              <RoutingControl start={currentLocation} end={toado} />
            )}
          </MapContainer>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-10 mt-6">
        <button
          onClick={handleGetMyLocation}
          className="bg-[#23284C] font-medium py-3 px-6 text-white rounded-md w-full sm:w-auto"
        >
          Địa chỉ của tôi
        </button>
        <button
          onClick={() => setShowRoute(true)}
          className="bg-[#23284C] font-medium py-3 px-6 text-white rounded-md w-full sm:w-auto"
        >
          Vẽ đường đi
        </button>
      </div>
    </div>
  );
}

export default MapDetail;
