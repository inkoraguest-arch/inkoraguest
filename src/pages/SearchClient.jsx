import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { Loader, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './SearchClient.css';

const containerStyle = {
    width: '100%',
    height: 'calc(100vh - 140px)' // Adjust for TopBar and BottomNav
};

// Default center (Global view) if geolocation fails or before it loads
const defaultCenter = {
    lat: -23.5505, // Center on São Paulo as a better default for this project
    lng: -46.6333
};

// Haversine formula to calculate distance in KM
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

export function SearchClient() {
    const navigate = useNavigate();
    const [locations, setLocations] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [center, setCenter] = useState(defaultCenter);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showList, setShowList] = useState(false);
    const [priceFilter, setPriceFilter] = useState('all'); // 'all', '$', '$$', '$$$'
    const [ratingFilter, setRatingFilter] = useState(0); // 0, 4, 4.5
    const [map, setMap] = useState(null);

    const filteredLocations = locations.filter(loc => {
        const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (loc.role === 'artist' ? 'tatuador artist' : 'estúdio studio').includes(searchQuery.toLowerCase());

        const matchesPrice = priceFilter === 'all' || loc.priceRange === priceFilter;
        const matchesRating = loc.rating >= ratingFilter;

        return matchesSearch && matchesPrice && matchesRating;
    });

    // Initialize Google Maps
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    if (loadError) {
        console.error("GOOGLE MAPS LOAD ERROR: Check if your API Key is valid and the 'Maps JavaScript API' is enabled.", loadError);
    }

    useEffect(() => {
        // Try to get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCenter(pos);
                    setUserLocation(pos);
                    fetchLocations(pos);
                },
                (error) => {
                    console.log("Error getting location: ", error);
                    fetchLocations(null);
                }
            );
        } else {
            fetchLocations(null);
        }
    }, []);

    const fetchLocations = async (currentUserPos) => {
        try {
            // Fetch users with role 'studio' or 'artist'
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    *,
                    artists (*),
                    studios (*)
                `)
                .in('role', ['studio', 'artist']);

            if (error) {
                console.error("Search Fetch Error", error);
                throw error;
            }

            if (data && data.length > 0) {
                const mappedLocations = data.map((loc) => {
                    const artistData = Array.isArray(loc.artists) ? loc.artists[0] : loc.artists;
                    const studioData = Array.isArray(loc.studios) ? loc.studios[0] : loc.studios;
                    const profileData = artistData || studioData;

                    let styles = ['Diversos estilos'];
                    if (profileData?.primary_styles) {
                        try {
                            styles = Array.isArray(profileData.primary_styles)
                                ? profileData.primary_styles
                                : [profileData.primary_styles];
                        } catch (e) { }
                    }

                    // Use real coordinates if they exist, otherwise fallback to mock random near center
                    const hasRealCoords = loc.latitude != null && loc.longitude != null;
                    const lat = hasRealCoords ? Number(loc.latitude) : defaultCenter.lat + (Math.random() - 0.5) * 0.1;
                    const lng = hasRealCoords ? Number(loc.longitude) : defaultCenter.lng + (Math.random() - 0.5) * 0.1;

                    let distance = null;
                    if (currentUserPos) {
                        distance = calculateDistance(currentUserPos.lat, currentUserPos.lng, lat, lng);
                    }

                    return {
                        id: loc.id,
                        name: loc.full_name || (loc.role === 'artist' ? 'Artista Inkora' : 'Estúdio Inkora'),
                        role: loc.role,
                        city: loc.city || 'Local Indefinido',
                        address: loc.address || '',
                        avatar: loc.avatar_url || null,
                        location: { lat, lng },
                        distance: distance,
                        rating: loc.rating || (4 + Math.random()),
                        priceRange: profileData?.price_range || '$$',
                        styles: styles,
                        hasRealCoords: hasRealCoords
                    };
                });

                // Sort by distance if user location is available
                if (currentUserPos) {
                    mappedLocations.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));
                }

                // Diagnostic Log
                console.log(`[INKORA DEBUG] Mapa carregou ${mappedLocations.length} artistas/estúdios:`, mappedLocations.map(l => ({ name: l.name, hasRealCoords: l.hasRealCoords })));

                setLocations(mappedLocations);

                // If map is already loaded, update bounds
                if (window.google) {
                    const bounds = new window.google.maps.LatLngBounds();
                    mappedLocations.forEach(loc => bounds.extend(loc.location));
                    if (currentUserPos) bounds.extend(currentUserPos);
                }
            } else {
                setLocations([]);
            }
        } catch (error) {
            console.error('Error fetching locations for map:', error);
        }
    };

    // Update bounds when locations or map change
    useEffect(() => {
        if (map && filteredLocations.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            filteredLocations.forEach(loc => bounds.extend(loc.location));
            if (userLocation) bounds.extend(userLocation);
            map.fitBounds(bounds);

            if (filteredLocations.length === 1) {
                const listener = window.google.maps.event.addListener(map, "idle", () => {
                    if (map.getZoom() > 15) map.setZoom(15);
                    window.google.maps.event.removeListener(listener);
                });
            }
        }
    }, [map, filteredLocations, userLocation]);

    const onLoad = useCallback(function callback(mapInstance) {
        setMap(mapInstance);
    }, []);

    const onUnmount = useCallback(function callback() {
        setMap(null);
    }, []);

    return (
        <div className="search-client-page">
            <TopBar />

            <div className="map-search-header">
                <div className="search-bar-fake">
                    <MapPin size={18} />
                    <input
                        type="text"
                        placeholder="Buscar artistas (nome, cidade, cargo)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button
                    className={`toggle-list-btn ${showList ? 'active' : ''}`}
                    onClick={() => setShowList(!showList)}
                >
                    {showList ? 'Ver Mapa' : 'Ver Lista'}
                </button>
            </div>

            <div className="filter-chips-row">
                <div className="filter-group">
                    <span className="filter-label">Preço:</span>
                    <button className={`chip ${priceFilter === 'all' ? 'active' : ''}`} onClick={() => setPriceFilter('all')}>Tudo</button>
                    <button className={`chip ${priceFilter === '$' ? 'active' : ''}`} onClick={() => setPriceFilter('$')}>$</button>
                    <button className={`chip ${priceFilter === '$$' ? 'active' : ''}`} onClick={() => setPriceFilter('$$')}>$$</button>
                    <button className={`chip ${priceFilter === '$$$' ? 'active' : ''}`} onClick={() => setPriceFilter('$$$')}>$$$</button>
                </div>
                <div className="filter-group">
                    <span className="filter-label">Avaliação:</span>
                    <button className={`chip ${ratingFilter === 0 ? 'active' : ''}`} onClick={() => setRatingFilter(0)}>Todas</button>
                    <button className={`chip ${ratingFilter === 4 ? 'active' : ''}`} onClick={() => setRatingFilter(4)}>4.0★+</button>
                    <button className={`chip ${ratingFilter === 4.5 ? 'active' : ''}`} onClick={() => setRatingFilter(4.5)}>4.5★+</button>
                </div>
            </div>

            <div className="map-container">
                {showList ? (
                    <div className="nearest-list-view">
                        <div className="list-header">
                            <h3>Estúdios & Artistas Próximos</h3>
                            <p>{filteredLocations.length} resultados encontrados</p>
                        </div>
                        <div className="list-items">
                            {filteredLocations.map(loc => (
                                <div key={loc.id} className="list-item" onClick={() => {
                                    setSelectedLocation(loc);
                                    setCenter(loc.location);
                                    setShowList(false);
                                }}>
                                    {loc.avatar ? (
                                        <img src={loc.avatar} alt={loc.name} className="list-item-img" />
                                    ) : (
                                        <div className="list-item-img-placeholder" style={{
                                            width: '60px', height: '60px', borderRadius: '12px',
                                            background: 'var(--surface)', border: '1px solid var(--border-color)',
                                            display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px', fontWeight: 'bold'
                                        }}>
                                            {loc.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="list-item-info">
                                        <h4>{loc.name}</h4>
                                        <div className="list-item-meta">
                                            <span>{loc.address}</span>
                                            <span className="dot">•</span>
                                            <span className="rating">{loc.rating.toFixed(1)}★</span>
                                            <span className="dot">•</span>
                                            <span className="price">{loc.priceRange}</span>
                                        </div>
                                        {loc.distance !== null && (
                                            <span className="distance-badge">
                                                {loc.distance < 1 ? `${(loc.distance * 1000).toFixed(0)}m` : `${loc.distance.toFixed(1)}km`} de distância
                                            </span>
                                        )}
                                    </div>
                                    <div className={`role-badge ${loc.role}`}>
                                        {loc.role === 'artist' ? 'Tatuador' : 'Estúdio'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {!isLoaded ? (
                            <div className="map-loading">
                                <Loader className="spin" size={32} color="var(--primary)" />
                                <p>Carregando mapa...</p>
                            </div>
                        ) : (
                            <GoogleMap
                                mapContainerStyle={containerStyle}
                                center={center}
                                zoom={13}
                                onLoad={onLoad}
                                onUnmount={onUnmount}
                                options={{
                                    disableDefaultUI: true,
                                    zoomControl: true,
                                    styles: [
                                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                                        { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
                                        { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
                                        { featureType: "poi", stylers: [{ visibility: "off" }] }
                                    ]
                                }}
                            >
                                {/* User Location Marker */}
                                {userLocation && (
                                    <Marker
                                        position={userLocation}
                                        icon={{
                                            path: window.google.maps.SymbolPath.CIRCLE,
                                            scale: 8,
                                            fillColor: "#4285F4",
                                            fillOpacity: 1,
                                            strokeColor: "white",
                                            strokeWeight: 2,
                                        }}
                                        title="Você está aqui"
                                    />
                                )}

                                {/* Render Markers */}
                                {filteredLocations.map(loc => (
                                    <Marker
                                        key={loc.id}
                                        position={loc.location}
                                        onClick={() => setSelectedLocation(loc)}
                                        icon={loc.avatar ? {
                                            url: loc.avatar,
                                            scaledSize: new window.google.maps.Size(40, 40),
                                            anchor: new window.google.maps.Point(20, 20),
                                            labelOrigin: new window.google.maps.Point(20, 45)
                                        } : {
                                            path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                                            scale: 5,
                                            fillColor: "#E52020",
                                            fillOpacity: 1,
                                            strokeWeight: 1,
                                            strokeColor: "white",
                                            labelOrigin: new window.google.maps.Point(0, 5)
                                        }}
                                        label={{
                                            text: loc.name,
                                            color: "white",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            className: "map-marker-label"
                                        }}
                                    />
                                ))}
                            </GoogleMap>
                        )}
                    </>
                )}

                {/* Detail Overlay when a marker is clicked */}
                {selectedLocation && (
                    <div className="studio-map-card">
                        <img src={selectedLocation.avatar} alt={selectedLocation.name} className="studio-map-img" />
                        <div className="studio-map-info">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {selectedLocation.name}
                                <span style={{ fontSize: 10, backgroundColor: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 12, fontWeight: 'normal' }}>
                                    {selectedLocation.role === 'artist' ? 'Tatuador' : 'Estúdio'}
                                </span>
                            </h3>
                            <p className="studio-map-city">{selectedLocation.city}</p>
                            {selectedLocation.address && <p className="studio-map-address">{selectedLocation.address}</p>}
                            <button
                                className="view-studio-btn"
                                onClick={() => navigate(`/artist/${selectedLocation.id}`)}
                            >
                                Ver Perfil
                            </button>
                        </div>
                        <button className="close-studio-card" onClick={() => setSelectedLocation(null)}>×</button>
                    </div>
                )}
            </div>
        </div>
    );
}
