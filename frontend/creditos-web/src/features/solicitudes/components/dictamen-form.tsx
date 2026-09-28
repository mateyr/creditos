import { CheckIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import {
  useDictaminarSolicitud,
  type AccionDictamen,
  type Dictamen,
} from "@/features/solicitudes/api/dictaminar-solicitud"
import { dictamenSchema } from "@/features/solicitudes/schemas"
import { useAppForm } from "@/hooks/use-app-form"
import { getErrorMessage } from "@/lib/api-client"

const confirmaciones: Record<
  AccionDictamen,
  { titulo: string; descripcion: string; boton: string; pendiente: string }
> = {
  aprobar: {
    titulo: "¿Aprobar el crédito?",
    descripcion:
      "Se creará el crédito con su número y su plan de pagos. La solicitud pasará a Aprobada y el dictamen no se podrá modificar.",
    boton: "Sí, aprobar",
    pendiente: "Aprobando...",
  },
  rechazar: {
    titulo: "¿Rechazar la solicitud?",
    descripcion:
      "La solicitud pasará a Rechazada con el motivo indicado. El dictamen no se podrá modificar.",
    boton: "Sí, rechazar",
    pendiente: "Rechazando...",
  },
}

/**
 * Dictamen del comité. Las observaciones son obligatorias en ambos casos y cada acción
 * se confirma antes de enviarse, porque no se puede deshacer.
 */
export function DictamenForm({
  solicitudId,
  className,
}: {
  solicitudId: number
  className?: string
}) {
  // Dictamen validado que espera confirmación; mientras tenga valor, el diálogo está abierto.
  const [porConfirmar, setPorConfirmar] = useState<Dictamen | null>(null)

  const dictamenMutation = useDictaminarSolicitud({
    mutationConfig: {
      onSuccess: (credito) => {
        if (credito) {
          toast.success(`Crédito ${credito.numeroCredito} aprobado.`, {
            description: `Se generó el plan de pagos con ${credito.cantidadCuotas} cuotas.`,
          })
        } else {
          toast.success("Solicitud rechazada.")
        }
      },
      onSettled: () => setPorConfirmar(null),
    },
  })

  const form = useAppForm({
    defaultValues: { observaciones: "" },
    validators: { onSubmit: dictamenSchema },
    // Los dos botones envían el mismo formulario; la acción viaja como metadato.
    onSubmitMeta: { accion: "aprobar" as AccionDictamen },
    onSubmit: ({ value, meta }) => {
      dictamenMutation.reset()
      setPorConfirmar({
        solicitudId,
        accion: meta.accion,
        ...dictamenSchema.parse(value),
      })
    },
  })

  const confirmacion = porConfirmar && confirmaciones[porConfirmar.accion]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Dictamen del comité</CardTitle>
        <CardDescription>
          Justifica la aprobación o indica el motivo del rechazo.
        </CardDescription>
      </CardHeader>
      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit({ accion: "aprobar" })
        }}
      >
        <form.AppForm>
          <CardContent className="flex flex-col gap-4">
            <form.AppField name="observaciones">
              {(field) => (
                <field.TextareaField
                  label="Observaciones"
                  rows={5}
                  maxLength={500}
                  placeholder="Ej.: capacidad de pago suficiente, historial crediticio favorable..."
                />
              )}
            </form.AppField>
            {dictamenMutation.isError && (
              <FieldError>{getErrorMessage(dictamenMutation.error)}</FieldError>
            )}
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-3 border-t">
            <Button
              type="button"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => void form.handleSubmit({ accion: "rechazar" })}
            >
              <XIcon />
              Rechazar crédito
            </Button>
            <Button type="submit">
              <CheckIcon />
              Aprobar crédito
            </Button>
          </CardFooter>
        </form.AppForm>
      </form>

      <AlertDialog
        open={porConfirmar !== null}
        onOpenChange={(open) => {
          if (!open && !dictamenMutation.isPending) {
            setPorConfirmar(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmacion?.titulo}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmacion?.descripcion}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {porConfirmar && (
            <blockquote className="rounded-md border-l-2 bg-muted/50 px-3 py-2 text-sm whitespace-pre-line">
              {porConfirmar.observaciones}
            </blockquote>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={dictamenMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant={
                porConfirmar?.accion === "rechazar" ? "destructive" : "default"
              }
              disabled={dictamenMutation.isPending}
              onClick={() =>
                porConfirmar && dictamenMutation.mutate(porConfirmar)
              }
            >
              {dictamenMutation.isPending
                ? confirmacion?.pendiente
                : confirmacion?.boton}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
