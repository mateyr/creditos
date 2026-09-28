import { SendIcon } from "lucide-react"
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
import { useDesembolsarCredito } from "@/features/creditos/api/desembolsar-credito"
import {
  desembolsoSchema,
  type DesembolsoFormValues,
  type DesembolsoRequest,
} from "@/features/creditos/schemas"
import {
  BANCOS,
  NOMBRE_BANCO,
  type CreditoDetalle,
} from "@/features/creditos/types"
import { useAppForm } from "@/hooks/use-app-form"
import { getErrorMessage } from "@/lib/api-client"
import { formatCurrency } from "@/lib/format"

const valoresIniciales: DesembolsoFormValues = {
  banco: "",
  numeroCuenta: "",
  confirmacionCuenta: "",
}

const opcionesBanco = BANCOS.map((banco) => ({
  value: banco,
  label: NOMBRE_BANCO[banco],
}))

const soloDigitos = (valor: string) => valor.replace(/\D/g, "")

/**
 * Transferencia del crédito al cliente. La cuenta se escribe dos veces y la operación
 * se confirma antes de enviarse, porque no se puede deshacer.
 */
export function DesembolsoForm({
  credito,
  className,
}: {
  credito: CreditoDetalle
  className?: string
}) {
  // Transferencia validada que espera confirmación; mientras tenga valor, el diálogo está abierto.
  const [porConfirmar, setPorConfirmar] = useState<DesembolsoRequest | null>(
    null
  )

  const desembolsoMutation = useDesembolsarCredito({
    mutationConfig: {
      onSuccess: () =>
        toast.success(`Crédito ${credito.numeroCredito} desembolsado.`, {
          description:
            "El plan de pagos se reprogramó desde la fecha del desembolso.",
        }),
      onSettled: () => setPorConfirmar(null),
    },
  })

  const form = useAppForm({
    defaultValues: valoresIniciales,
    validators: { onSubmit: desembolsoSchema },
    onSubmit: ({ value }) => {
      const { banco, numeroCuenta } = desembolsoSchema.parse(value)
      desembolsoMutation.reset()
      setPorConfirmar({ banco, numeroCuenta })
    },
  })

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Transferencia</CardTitle>
        <CardDescription>
          Cuenta del cliente donde se depositará el crédito.
        </CardDescription>
      </CardHeader>
      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.AppForm>
          <CardContent className="flex flex-col gap-4">
            <form.AppField name="banco">
              {(field) => (
                <field.SelectField
                  label="Banco destino"
                  options={opcionesBanco}
                  placeholder="Selecciona el banco"
                />
              )}
            </form.AppField>
            <form.AppField name="numeroCuenta">
              {(field) => (
                <field.TextField
                  label="Número de cuenta"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={20}
                  placeholder="10020400096083"
                  format={soloDigitos}
                />
              )}
            </form.AppField>
            <form.AppField name="confirmacionCuenta">
              {(field) => (
                <field.TextField
                  label="Confirma el número de cuenta"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={20}
                  format={soloDigitos}
                  // Obliga a escribirla de nuevo en lugar de copiarla del campo anterior.
                  onPaste={(event) => event.preventDefault()}
                />
              )}
            </form.AppField>
            {desembolsoMutation.isError && (
              <FieldError>
                {getErrorMessage(desembolsoMutation.error)}
              </FieldError>
            )}
          </CardContent>
          <CardFooter className="border-t">
            <Button type="submit" className="w-full">
              <SendIcon />
              Desembolsar {formatCurrency(credito.monto)}
            </Button>
          </CardFooter>
        </form.AppForm>
      </form>

      <AlertDialog
        open={porConfirmar !== null}
        onOpenChange={(open) => {
          if (!open && !desembolsoMutation.isPending) {
            setPorConfirmar(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar el desembolso?</AlertDialogTitle>
            <AlertDialogDescription>
              Se transferirán <strong>{formatCurrency(credito.monto)}</strong> a{" "}
              <strong>{credito.nombreCompleto}</strong>. El crédito pasará a
              Desembolsado y la operación no se podrá deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {porConfirmar && (
            <dl className="grid grid-cols-2 gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
              <dt className="text-muted-foreground">Banco</dt>
              <dd className="font-medium">
                {NOMBRE_BANCO[porConfirmar.banco]}
              </dd>
              <dt className="text-muted-foreground">Cuenta</dt>
              <dd className="font-medium tabular-nums">
                {porConfirmar.numeroCuenta}
              </dd>
            </dl>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={desembolsoMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={desembolsoMutation.isPending}
              onClick={() =>
                porConfirmar &&
                desembolsoMutation.mutate({
                  creditoId: credito.id,
                  request: porConfirmar,
                })
              }
            >
              {desembolsoMutation.isPending
                ? "Desembolsando..."
                : "Sí, desembolsar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
