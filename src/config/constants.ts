import { CassetteTape } from "lucide-react";

export const CHARGER_TYPES = [
  { value: "Cargador portatil a 110V", label: "Cargador portatil a 110V" },
  {
    value: "Cargador de pared AC 7 - 22kw",
    label: "Cargador de pared AC 7 - 22kw",
  },
  { value: "Cargador DC hasta 50Kw", label: "Cargador DC hasta 50Kw" },
] as const;

export const VEHICLE_TYPES = [
  { value: "Automóvil", label: "Automóvil" },
  { value: "SUV", label: "SUV" },
  {
    value: "Vehiculo comercial/carga de menos de 4Ton",
    label: "Vehiculo comercial/carga de menos de 4Ton",
  },
  { value: "ebike", label: "ebike" },
  { value: "Bicicleta", label: "Bicicleta" },
  { value: "Scooter", label: "Scooter" },
] as const;

export const USAGE_TYPE = [
  { value: "personal", label: "Personal" },
  { value: "Trabajo", label: "Trabajo" },
  { value: "Domicilios", label: "Domicilios" },
  { value: "Taxi", label: "Taxi" },
] as const;

export const AVERAGE_KMS_PER_DAY = [
  {
    value: "Menos de 10Km",
    label: "Menos de 10Km",
  },
  {
    value: "Más de 10Km y menos de 50Km",
    label: "Más de 10Km y menos de 50Km",
  },
  {
    value: "Por encima de 50Km",
    label: "Por encima de 50Km",
  },
];

export const PRIMARY_CHARGING_LOCATION = [
  { value: "Casa", label: "Casa" },
  { value: "Trabajo", label: "Trabajo" },
  { value: "Comercio", label: "Comercio" },
  { value: "Academia/Gym", label: "Academia/Gym" },
  { value: "Parqueadero Publico", label: "Parqueadero Publico" },
  { value: "Scooter", label: "Scooter" },
];
