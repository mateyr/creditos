import { z } from "zod"

import { PERIODICIDADES, TIPOS_EMPLEO } from "@/features/solicitudes/types"

/** Texto de un input numérico: requerido y convertido a número antes de validar el rango. */
const numeroRequerido = (mensaje: string) =>
  z.string().trim().min(1, mensaje).pipe(z.coerce.number<string>(mensaje))

// Mismas reglas que CrearSolicitudValidator en el backend.
export const solicitudSchema = z.object({
  clienteId: z
    .number()
    .nullable()
    .pipe(z.number("Selecciona un cliente.").int().positive()),
  // Los selects empiezan vacíos (""): se valida el texto contra los valores permitidos.
  tipoEmpleo: z
    .string()
    .pipe(z.enum(TIPOS_EMPLEO, "Selecciona el tipo de empleo.")),
  lugarTrabajo: z
    .string()
    .trim()
    .min(1, "La empresa o lugar de trabajo es requerido.")
    .max(150, "El lugar de trabajo no puede superar los 150 caracteres."),
  antiguedadLaboral: numeroRequerido(
    "La antigüedad laboral es requerida."
  ).pipe(
    z
      .number()
      .int("La antigüedad laboral debe ser un número entero de años.")
      .min(0, "La antigüedad laboral no puede ser negativa.")
  ),
  ingresoMensual: numeroRequerido("El ingreso mensual es requerido.").pipe(
    z.number().positive("El ingreso mensual debe ser mayor que 0.")
  ),
  montoSolicitado: numeroRequerido("El monto solicitado es requerido.").pipe(
    z.number().positive("El monto solicitado debe ser mayor que 0.")
  ),
  cantidadCuotas: numeroRequerido("La cantidad de cuotas es requerida.").pipe(
    z
      .number()
      .int("La cantidad de cuotas debe ser un número entero.")
      .min(1, "Debe haber al menos 1 cuota.")
      .max(360, "La cantidad de cuotas no puede superar 360.")
  ),
  tasaInteresAnual: numeroRequerido("La tasa de interés es requerida.").pipe(
    z
      .number()
      .positive("La tasa de interés debe ser mayor que 0.")
      .max(100, "La tasa de interés no puede superar el 100 %.")
  ),
  periodicidad: z
    .string()
    .pipe(z.enum(PERIODICIDADES, "Selecciona la periodicidad de pago.")),
})

export type SolicitudFormValues = z.input<typeof solicitudSchema>
export type CrearSolicitudRequest = z.output<typeof solicitudSchema>

export const dictamenSchema = z.object({
  observaciones: z
    .string()
    .trim()
    .min(1, "Las observaciones son requeridas para emitir el dictamen.")
    .max(500, "Las observaciones no pueden superar los 500 caracteres."),
})

export type DictamenRequest = z.output<typeof dictamenSchema>
