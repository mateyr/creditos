const dateFormatter = new Intl.DateTimeFormat("es-NI", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

/** Formatea una fecha ISO (YYYY-MM-DD) como dd/mm/aaaa sin desfases de zona horaria. */
export function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number)
  return dateFormatter.format(new Date(year, month - 1, day))
}
