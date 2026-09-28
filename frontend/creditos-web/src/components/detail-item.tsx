import { cn } from "cn"

/** Par etiqueta/valor de solo lectura; se usa dentro de un <dl>. */
export function DetailItem({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-0.5", className)}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium whitespace-pre-line">{value}</dd>
    </div>
  )
}
