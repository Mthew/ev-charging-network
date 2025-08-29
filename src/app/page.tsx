"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MapPin, Car, Zap, Plus, Phone, Mail, User } from "lucide-react";
import GoogleMaps from "@/components/GoogleMaps";
import GooglePlacesAutocomplete from "@/components/GooglePlacesAutocomplete";
import {
  AVERAGE_KMS_PER_DAY,
  CHARGER_TYPES,
  COST_PER_KWH,
  PREFERENCE_CONNECTOR,
  PRIMARY_CHARGING_LOCATION,
  USAGE_TYPE,
  USUAL_CHARGING_SCHEDULE,
  VEHICLE_TYPES,
} from "@/config/constants";

const formSchema = z.object({
  // Vehicle Information
  vehicleType: z.string().min(1, "Selecciona el tipo de vehículo"),
  brandModel: z.string().min(1, "Ingresa la marca/modelo"),
  usageType: z.string().min(1, "Selecciona el tipo de uso"),
  averageKmsPerDay: z.string().min(1, "Ingresa los kilómetros promedio"),
  preferenceConnector: z.string().min(1, "Selecciona el conector preferido"),
  usualChargingSchedule: z
    .string()
    .min(1, "Ingresa el horario de carga habitual"),

  // Current Charging Location
  primaryChargingLocation: z
    .string()
    .min(1, "Selecciona la ubicación principal"),
  chargingAddress: z.string().min(1, "Ingresa la dirección"),
  chargerType: z.string().min(1, "Selecciona el tipo de cargador"),
  costPerKmCharged: z.string().min(1, "Ingresa el costo por km cargado"),

  // Desired New Station Location (optional - will be validated separately)
  newStationIdentifier: z.string().optional(),
  newStationAddress: z.string().optional(),

  // Contact Information
  fullName: z.string().min(1, "Ingresa tu nombre completo"),
  phone: z.string().min(1, "Ingresa tu teléfono"),
  email: z.email("Ingresa un correo electrónico válido"),
  privacyPolicy: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar la política de privacidad para continuar",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function Home() {
  const router = useRouter();
  const [desiredLocations, setDesiredLocations] = useState<
    Array<{
      id: string;
      identifier: string;
      address: string;
      lat?: number;
      lng?: number;
    }>
  >([]);
  const [currentChargingLocation, setCurrentChargingLocation] = useState<{
    lat?: number;
    lng?: number;
  }>({});

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleType: "",
      brandModel: "",
      // licensePlate: "",
      usageType: "",
      preferenceConnector: "",
      usualChargingSchedule: "",
      averageKmsPerDay: "",
      primaryChargingLocation: "",
      chargingAddress: "",
      chargerType: "",
      costPerKmCharged: "",
      newStationIdentifier: "",
      newStationAddress: "",
      fullName: "",
      phone: "",
      email: "",
      privacyPolicy: false,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [desiredLocationsError, setDesiredLocationsError] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      recaptchaRef.current?.reset();
    }
  }, [form.formState.isSubmitSuccessful]);

  const onSubmit = async (data: FormData) => {
    // Validate that at least one desired location has been added
    if (desiredLocations.length === 0) {
      setDesiredLocationsError(
        "Debes agregar al menos una ubicación deseada para la nueva estación"
      );
      return;
    }

    if (!recaptchaToken) {
      alert("Por favor, verifica que no eres un robot.");
      return;
    }

    // Clear any previous error
    setDesiredLocationsError("");
    setIsSubmitting(true);

    try {
      console.log("Submitting form with data:", {
        email: data.email,
        vehicleType: data.vehicleType,
        desiredLocationsCount: desiredLocations.length,
      });

      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          desiredLocations: desiredLocations,
          currentChargingLocation: currentChargingLocation,
          recaptchaToken,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `¡Formulario enviado exitosamente!\n\n\n📧 Email: ${
            result.data.email
          }\n📍 Ubicaciones deseadas: ${
            result.data.desiredLocationsCount
          }\n📅 Fecha: ${new Date(result.data.timestamp).toLocaleString(
            "es-CO"
          )}\n\n¡Gracias por ayudarnos a planificar la red de carga para vehículos eléctricos!`
        );

        form.reset();
        setDesiredLocations([]);
        setCurrentChargingLocation({});
        setPendingLocation({});
        setDesiredLocationsError("");
      } else {
        console.error("Form submission failed:", result);
        alert(
          `Error al enviar el formulario: ${
            result.message || "Error desconocido"
          }. Por favor intenta de nuevo.`
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(
        "Error de conexión al enviar el formulario. Verifica tu conexión a internet e intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const [pendingLocation, setPendingLocation] = useState<{
    lat?: number;
    lng?: number;
  }>({});

  const addDesiredLocation = () => {
    const identifier = form.getValues("newStationIdentifier");
    const address = form.getValues("newStationAddress");

    if (identifier && address) {
      setDesiredLocations([
        ...desiredLocations,
        {
          id: Date.now().toString(),
          identifier,
          address,
          lat: pendingLocation.lat,
          lng: pendingLocation.lng,
        },
      ]);
      form.setValue("newStationIdentifier", "");
      form.setValue("newStationAddress", "");
      setPendingLocation({});

      // Clear error when location is added
      setDesiredLocationsError("");
    }
  };

  const handleNewStationPlaceSelect = (place: {
    address: string;
    lat: number;
    lng: number;
    placeId: string;
  }) => {
    setPendingLocation({ lat: place.lat, lng: place.lng });
    form.setValue("newStationAddress", place.address);
  };

  const handleChargingLocationPlaceSelect = (place: {
    address: string;
    lat: number;
    lng: number;
    placeId: string;
  }) => {
    setCurrentChargingLocation({ lat: place.lat, lng: place.lng });
    form.setValue("chargingAddress", place.address);
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-sm">OG</span>
          </div>
          <span className="text-white font-semibold">oasisgroup</span>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:text-primary"
          >
            <Phone className="w-4 h-4 mr-2" />
            Contacto
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
                ¿Quieres tener un{" "}
                <span className="text-primary">punto de carga</span> más cerca
                de ti?
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-6 md:mb-8 max-w-3xl leading-relaxed">
                Parte de los retos en el despliegue de nueva infraestructura, va
                de la mano de realizar inversiones en nuevas estaciones sin
                saber qué impacto tendrá en los usuarios que la necesita.
              </p>
              <p className="text-md sm:text-lg text-primary font-semibold">
                ¡Ayúdanos a estar más cerca de tus necesidades!
              </p>
            </div>
            <div className="hidden md:block">
              <Image
                src="/assets/images/hero-electric-car.jpg"
                alt="Electric Car"
                width={800}
                height={600}
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>

          {/* API Key Notice */}
          {(!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ===
              "your_google_maps_api_key_here") && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <MapPin className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">
                  Configure Google Maps API
                </span>
              </div>
              <p className="text-yellow-300 text-sm text-center mb-3">
                Para activar la funcionalidad completa de mapas y autocompletado
                de direcciones
              </p>
              <div className="text-center">
                <Button
                  onClick={() => window.open("/api-key-setup", "_blank")}
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Configurar API Key →
                </Button>
              </div>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
            {/* Vehicle Information Section */}
            <div className="form-section grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="hidden md:block md:col-span-1">
                    <Image
                      src="/assets/images/form-car.jpg"
                      alt="Car"
                      width={800}
                      height={600}
                      className="rounded-lg shadow-2xl aspect-video object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center mb-6">
                      <Car className="w-8 h-8 text-primary mr-3" />
                      <h2 className="section-heading">¿Qué vehículo tienes?</h2>
                    </div>
                    <p className="section-description">
                      Con esta información entenderemos las condiciones técnicas
                      para seleccionar los equipos y características más
                      apropiadas para tu vehículo.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Tipo Vehículo
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="custom-input">
                              <SelectValue placeholder="Ej: SUV" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {VEHICLE_TYPES.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Marca/Modelo
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ej: Renault / Zoe"
                            className="custom-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <FormField
                    control={form.control}
                    name="licensePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Placa</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ej: KYZ902"
                            className="custom-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

                  <FormField
                    control={form.control}
                    name="usageType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Tipo de Uso
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="custom-input">
                              <SelectValue placeholder="Particular" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {USAGE_TYPE.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="averageKmsPerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Promedio de kilometros por dia
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="custom-input">
                              <SelectValue placeholder="Hasta 50 Kms/día" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {AVERAGE_KMS_PER_DAY.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferenceConnector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Conector de preferencia
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="custom-input">
                              <SelectValue placeholder="Selecciona un conector" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PREFERENCE_CONNECTOR.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="usualChargingSchedule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Horario de carga habitual
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="custom-input">
                              <SelectValue placeholder="Selecciona un horario" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {USUAL_CHARGING_SCHEDULE.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Current Charging Location Section */}
            <div className="form-section grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
                  <div className="md:col-span-1">
                    <div className="flex items-center mb-6">
                      <Zap className="w-8 h-8 text-primary mr-3" />
                      <h2 className="section-heading">
                        ¿Como recargas tu vehículo?
                      </h2>
                    </div>
                    <p className="section-description">
                      Con esta información crearemos un perfil de carga inicial
                      para buscar eficiencia en el costo del kwh y tiempos de
                      recarga.
                    </p>
                  </div>
                  <div className="hidden md:block md:col-span-1">
                    <Image
                      src="/assets/images/form-charging-station.jpg"
                      alt="Charging Station"
                      width={800}
                      height={600}
                      className="rounded-lg shadow-2xl aspect-video object-cover"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <FormField
                    control={form.control}
                    name="primaryChargingLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Ubicación donde realizas la mayoría de tus recargas
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="custom-input">
                              <SelectValue placeholder="Ej: Casa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PRIMARY_CHARGING_LOCATION.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chargingAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Ingresa la dirección o sitio en Google Maps
                        </FormLabel>
                        <FormControl>
                          <GooglePlacesAutocomplete
                            value={field.value}
                            onChange={field.onChange}
                            onPlaceSelect={handleChargingLocationPlaceSelect}
                            placeholder="Ej: Urbanización Villas del Valle"
                            className="custom-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chargerType"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-white">
                          Tipo de Cargador
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="custom-input">
                              <SelectValue placeholder="Ej: Portátil AC 35kw" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CHARGER_TYPES.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="costPerKmCharged"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-white">
                          Valor por Km Cargado
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="custom-input">
                              <SelectValue placeholder="Ej: Portátil AC 35kw" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COST_PER_KWH.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Desired New Station Location Section */}
            <div className="form-section">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <MapPin className="w-8 h-8 text-primary mr-3" />
                  <h2 className="section-heading">
                    ¿Dónde deseas una nueva estación?
                  </h2>
                </div>
                {desiredLocations.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-400 font-medium">
                      {desiredLocations.length} ubicación
                      {desiredLocations.length !== 1 ? "es" : ""} agregada
                      {desiredLocations.length !== 1 ? "s" : ""}
                    </span>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                )}
              </div>
              <p className="section-description">
                Con esta información crearemos un plano interactivo para
                seleccionar una nueva ubicación para tus necesidades de recarga.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6">
                <FormField
                  control={form.control}
                  name="newStationIdentifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Identificador de la nueva ubicación
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="custom-input">
                            <SelectValue placeholder="Casa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="home">Casa</SelectItem>
                          <SelectItem value="work">Trabajo</SelectItem>
                          <SelectItem value="university">
                            Universidad
                          </SelectItem>
                          <SelectItem value="shopping">
                            Centro Comercial
                          </SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newStationAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Dirección o sitio en Google Maps
                      </FormLabel>
                      <FormControl>
                        <GooglePlacesAutocomplete
                          value={field.value || ""}
                          onChange={field.onChange}
                          onPlaceSelect={handleNewStationPlaceSelect}
                          placeholder="Ej: Urbanización Villas del Valle"
                          className="custom-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="button"
                onClick={addDesiredLocation}
                className="mb-6 bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Ubicación
              </Button>

              {/* Error message for desired locations */}
              {desiredLocationsError && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                  <p className="text-red-400 text-sm">
                    {desiredLocationsError}
                  </p>
                </div>
              )}

              {/* Display added locations */}
              {desiredLocations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-4">
                    Ubicaciones agregadas:
                  </h3>
                  <div className="space-y-2">
                    {desiredLocations.map((location) => (
                      <Card
                        key={location.id}
                        className="p-4 bg-white/5 border-white/10"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-primary font-medium">
                              {location.identifier}
                            </span>
                            <p className="text-gray-300">{location.address}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newLocations = desiredLocations.filter(
                                (l) => l.id !== location.id
                              );
                              setDesiredLocations(newLocations);
                              // If no locations left, show error again when form is submitted
                              if (newLocations.length === 0) {
                                setDesiredLocationsError("");
                              }
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Map */}
              <div className="h-64 sm:h-96">
                <GoogleMaps
                  locations={desiredLocations
                    .filter((loc) => loc.lat && loc.lng)
                    .map((loc) => ({
                      id: loc.id,
                      lat: loc.lat!,
                      lng: loc.lng!,
                      title: loc.identifier,
                      description: loc.address,
                      type: "desired",
                    }))}
                  className="rounded-lg border border-white/20 h-full"
                />
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="form-section">
              <div className="flex items-center mb-6">
                <User className="w-8 h-8 text-primary mr-3" />
                <h2 className="section-heading">
                  ¿Cómo te contactamos cuando instalemos la estación?
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Nombre Completo
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Tu nombre completo"
                          className="custom-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Teléfono</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Número de teléfono"
                          className="custom-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Correo Electrónico
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="tu@email.com"
                          className="custom-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center space-y-4">
              <FormField
                control={form.control}
                name="privacyPolicy"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-white/5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-white">
                        Acepto la{" "}
                        <Link
                          href="https://oasisgroup.online/politica-de-tratamiento-de-datos-personales/"
                          target="_blank"
                          className="text-primary hover:underline"
                        >
                          política de tratamiento de datos personales
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={
                    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
                    "YOUR_RECAPTCHA_SITE_KEY"
                  }
                  onChange={(token) => setRecaptchaToken(token)}
                  theme="dark"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white px-12 py-4 text-lg font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  "Enviar Información"
                )}
              </Button>

              {isSubmitting && (
                <p className="text-sm text-gray-300 mt-2">
                  Guardando tu información en la base de datos...
                </p>
              )}
            </div>
          </form>
        </Form>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/10 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">OG</span>
            </div>
            <span className="text-white font-semibold">oasisgroup</span>
          </div>
          <p className="text-gray-400 text-sm">
            Copyright 2024 | GRUPO EMPRESARIAL O&C SAS
          </p>
        </footer>
      </div>
    </div>
  );
}
