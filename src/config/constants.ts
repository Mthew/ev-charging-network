export const CHARGER_TYPES = [
  "Cargador portatil a 110V",
  "Cargador de pared AC 7 - 22kw",
  "Cargador DC hasta 50Kw",
] as const;

export const VEHICLE_TYPES = [
  "Automóvil",
  "SUV",
  "Vehiculo comercial/carga de menos de 4Ton",
  "ebike",
  "Bicicleta",
  "Scooter",
] as const;

export const USAGE_TYPE = [
  "personal",
  "Trabajo",
  "Domicilios",
  "Taxi",
] as const;

export const AVERAGE_KMS_PER_DAY = [
  "Menos de 10Km",
  "Más de 10Km y menos de 50Km",
  "Por encima de 50Km",
];

export const PRIMARY_CHARGING_LOCATION = [
  "Casa",
  "Trabajo",
  "Comercio",
  "Academia/Gym",
  "Parqueadero Publico",
] as const;

export const COST_PER_KWH = [
  "Gratis",
  "Menos de $1000 COP",
  "Entre $1000 y $2000 COP",
  "Más de $2000 COP",
];

export const MAP_DARK_STYLE = [
  // Dark theme for the map
  {
    elementType: "geometry",
    stylers: [{ color: "#212121" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#212121" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "administrative.land_parcel",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#181818" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1b1b1b" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#2c2c2c" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8a8a8a" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#373737" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3c3c3c" }],
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [{ color: "#4e4e4e" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3d3d3d" }],
  },
];
