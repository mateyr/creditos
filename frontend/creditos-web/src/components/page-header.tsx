/** Título de una pantalla con su descripción y, a la derecha, las acciones principales. */
export function PageHeader({
  title,
  description,
  badge,
  children,
}: {
  title: string
  description?: React.ReactNode
  /** Se muestra junto al título, p. ej. el estado del registro. */
  badge?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-medium">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
