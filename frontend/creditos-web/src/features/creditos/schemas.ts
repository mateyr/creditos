import { z } from "zod"

import { BANCOS } from "@/features/creditos/types"

// Mismas reglas que DesembolsarCredito.Validator en el backend.
export const desembolsoSchema = z
  .object({
    // El select empieza vacío (""): se valida el texto contra los bancos permitidos.
    banco: z.string().pipe(z.enum(BANCOS, "Selecciona el banco destino.")),
    numeroCuenta: z
      .string()
      .trim()
      .min(1, "El número de cuenta es requerido.")
      .regex(
        /^\d{8,20}$/,
        "El número de cuenta debe tener entre 8 y 20 dígitos, sin espacios ni guiones."
      ),
    confirmacionCuenta: z.string().trim(),
  })
  // Se pide dos veces para evitar transferir a una cuenta mal digitada.
  .refine((datos) => datos.numeroCuenta === datos.confirmacionCuenta, {
    message: "Los números de cuenta no coinciden.",
    path: ["confirmacionCuenta"],
  })

export type DesembolsoFormValues = z.input<typeof desembolsoSchema>
export type DesembolsoRequest = Pick<
  z.output<typeof desembolsoSchema>,
  "banco" | "numeroCuenta"
>
