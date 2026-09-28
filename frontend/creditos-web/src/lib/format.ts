const dateFormatter = new Intl.DateTimeFormat("es-NI", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

const dateTimeFormatter = new Intl.DateTimeFormat("es-NI", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const currencyFormatter = new Intl.NumberFormat("es-NI", {
  style: "currency",
  currency: "NIO",
})

const numberFormatter = new Intl.NumberFormat("es-NI", {
  maximumFractionDigits: 2,
})

/** Formatea una fecha ISO (YYYY-MM-DD) como dd/mm/aaaa sin desfases de zona horaria. */
export function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number)
  return dateFormatter.format(new Date(year, month - 1, day))
}

/** Formatea una fecha y hora ISO del backend (en UTC) en la hora local. */
export function formatDateTime(isoDateTime: string) {
  return dateTimeFormatter.format(new Date(isoDateTime))
}

/** Monto en córdobas (C$). */
export function formatCurrency(amount: number) {
  return currencyFormatter.format(amount)
}

export function formatNumber(value: number) {
  return numberFormatter.format(value)
}
