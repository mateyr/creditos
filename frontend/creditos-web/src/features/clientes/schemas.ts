import { z } from "zod"

/** Fecha local de hoy en formato YYYY-MM-DD, comparable como texto con el valor de un input date. */
const hoy = () => new Date().toLocaleDateString("en-CA")

// Mismas reglas que ClienteRequestValidator en el backend.
export const clienteSchema = z.object({
  cedula: z
    .string()
    .trim()
    .min(1, "La cédula es requerida.")
    .regex(
      /^\d{3}-\d{6}-\d{4}[A-Z]$/,
      "La cédula debe tener el formato 000-000000-0000A."
    ),
  nombreCompleto: z
    .string()
    .trim()
    .min(1, "El nombre completo es requerido.")
    .max(150, "El nombre completo no puede superar los 150 caracteres."),
  correoElectronico: z
    .email("El correo electrónico no es válido.")
    .max(150, "El correo electrónico no puede superar los 150 caracteres."),
  telefono: z
    .string()
    .trim()
    .min(1, "El teléfono es requerido.")
    .max(20, "El teléfono no puede superar los 20 caracteres."),
  fechaNacimiento: z.iso
    .date("La fecha de nacimiento es requerida.")
    .refine((fecha) => fecha < hoy(), "La fecha de nacimiento no es válida."),
})

export type ClienteRequest = z.infer<typeof clienteSchema>
