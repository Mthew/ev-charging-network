import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Filter } from "lucide-react";
import {
  PRIMARY_CHARGING_LOCATION,
  USAGE_TYPE,
  VEHICLE_TYPES,
} from "@/config/constants";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";

const formSchema = z.object({
  vehicleType: z.optional(z.string()),
  usageType: z.optional(z.string()),
  locationType: z.optional(z.string()),
});

type FormData = z.infer<typeof formSchema>;

const FormFieldItem = ({
  name,
  title,
  form,
  list,
}: {
  name: keyof FormData;
  title: string;
  form: ReturnType<typeof useForm<FormData>>;
  list: readonly string[];
}) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-white">{title}</FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <FormControl>
            <SelectTrigger className="custom-input">
              <SelectValue placeholder={list[0]} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem key={"all"} value={"all"}>
              Todos
            </SelectItem>
            {list.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
);

interface DashboardFiltersProps {
  isLoading: boolean;
  applyFilters: (data: FormData) => Promise<void>;
}

export const DashboardFilters = ({
  isLoading,
  applyFilters,
}: DashboardFiltersProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleType: "all",
      usageType: "all",
      locationType: "all",
    },
  });

  const handlers = {
    submit: async (data: FormData) => {
      setIsSubmitting(true);
      await applyFilters(data)
        .catch((error) => {
          console.error(error);
          return null;
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    },
    resetFilters: async () => {
      form.setValue("locationType", "all");
      form.setValue("vehicleType", "all");
      form.setValue("usageType", "all");

      handlers.submit({
        vehicleType: "all",
        usageType: "all",
        locationType: "all",
      });
    },
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handlers.submit)}
        className="space-y-12"
      >
        <Card className="mb-6 bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Filter className="w-5 h-5 mr-2 text-primary" />
              Filtros de Ubicación
            </CardTitle>
            <CardDescription className="text-gray-300">
              Filtra los datos por Casa, Trabajo, Tercer Lugar, etc.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormFieldItem
                name="locationType"
                title="Tipo de Ubicación"
                form={form}
                list={PRIMARY_CHARGING_LOCATION}
              />
              <FormFieldItem
                name="vehicleType"
                title="Tipo de Vehículo"
                form={form}
                list={VEHICLE_TYPES}
              />
              <FormFieldItem
                name="usageType"
                title="Tipo de Uso"
                form={form}
                list={USAGE_TYPE}
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
                  Consultando información...
                </>
              ) : (
                <>
                  <Filter className="w-4 h-4 mr-2" />
                  Aplicar Filtros
                </>
              )}
            </Button>
            {/* <Button
              type="button"
              size="lg"
              disabled={isSubmitting}
              onClick={handlers.resetFilters}
              className="ms-2 bg-secondary hover:bg-primary/90 disabled:bg-primary/50 text-white px-12 py-4 text-lg font-semibold"
            >
              Limpiar Filtros
            </Button> */}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};
