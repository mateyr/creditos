import {
  PERIODOS_POR_ANIO,
  type Periodicidad,
} from "@/features/solicitudes/types"

const MESES_POR_ANIO = 12

/**
 * Cuota nivelada (misma fórmula que CalculadoraCuotaNivelada en el backend):
 * Cuota = Monto * [ i * (1 + i)^n ] / [ (1 + i)^n - 1 ],  con  i = (TasaAnual / 100) / periodos por año.
 * Devuelve null si los datos todavía no permiten calcularla.
 */
export function calcularCuotaNivelada(
  monto: number,
  tasaInteresAnual: number,
  cantidadCuotas: number,
  periodicidad: Periodicidad
): number | null {
  if (
    !(monto > 0) ||
    !(tasaInteresAnual > 0) ||
    !Number.isInteger(cantidadCuotas) ||
    cantidadCuotas < 1
  ) {
    return null
  }

  const tasaPeriodica = tasaInteresAnual / 100 / PERIODOS_POR_ANIO[periodicidad]
  const factor = (1 + tasaPeriodica) ** cantidadCuotas
  const cuota = (monto * (tasaPeriodica * factor)) / (factor - 1)

  return Math.round(cuota * 100) / 100
}

/** Plazo en meses: 24 cuotas quincenales = 12 meses. */
export function calcularPlazoMeses(
  cantidadCuotas: number,
  periodicidad: Periodicidad
) {
  return (cantidadCuotas * MESES_POR_ANIO) / PERIODOS_POR_ANIO[periodicidad]
}
