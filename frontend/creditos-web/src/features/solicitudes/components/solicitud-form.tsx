import { useNavigate } from "@tanstack/react-router"
import { UserPlusIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { DetailItem } from "@/components/detail-item"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { ClienteFormDialog } from "@/features/clientes/components/cliente-form-dialog"
import type { Cliente } from "@/features/clientes/types"
import { useCrearSolicitud } from "@/features/solicitudes/api/crear-solicitud"
import { ClienteField } from "@/features/solicitudes/components/cliente-field"
import { CuotaResumen } from "@/features/solicitudes/components/cuota-resumen"
import {
  solicitudSchema,
  type SolicitudFormValues,
} from "@/features/solicitudes/schemas"
import {
  PERIODICIDADES,
  TIPOS_EMPLEO,
  type Periodicidad,
} from "@/features/solicitudes/types"
import { useAppForm } from "@/hooks/use-app-form"
import { getErrorMessage } from "@/lib/api-client"
import { formatCurrency, formatDate } from "@/lib/format"

const valoresIniciales: SolicitudFormValues = {
  clienteId: null,
  tipoEmpleo: "",
  lugarTrabajo: "",
  antiguedadLaboral: "",
  ingresoMensual: "",
  montoSolicitado: "",
  cantidadCuotas: "",
  tasaInteresAnual: "",
  periodicidad: "Mensual",
}

const opcionesTipoEmpleo = TIPOS_EMPLEO.map((tipo) => ({
  value: tipo,
  label: tipo,
}))

const opcionesPeriodicidad = PERIODICIDADES.map((periodicidad) => ({
  value: periodicidad,
  label: periodicidad,
}))

export function SolicitudForm() {
  const navigate = useNavigate()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [nuevoClienteOpen, setNuevoClienteOpen] = useState(false)

  const crearMutation = useCrearSolicitud({
    mutationConfig: {
      onSuccess: ({ id, cuotaNivelada }) => {
        toast.success(`Solicitud #${id} registrada.`, {
          description: `Cuota nivelada: ${formatCurrency(cuotaNivelada)}. Queda pendiente de evaluación.`,
        })
        void navigate({
          to: "/solicitudes/$solicitudId",
          params: { solicitudId: id },
        })
      },
    },
  })

  const form = useAppForm({
    defaultValues: valoresIniciales,
    validators: { onSubmit: solicitudSchema },
    onSubmit: async ({ value }) => {
      // parse convierte los textos de los inputs en números antes de enviar.
      await crearMutation
        .mutateAsync(solicitudSchema.parse(value))
        .catch(() => {
          // El error se muestra a partir del estado de la mutación.
        })
    },
  })

  return (
    <>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
        className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <form.AppForm>
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Información personal</CardTitle>
                <CardDescription>
                  Busca al cliente registrado o regístralo si es nuevo.
                </CardDescription>
                <CardAction>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNuevoClienteOpen(true)}
                  >
                    <UserPlusIcon />
                    Nuevo cliente
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <form.AppField name="clienteId">
                  {() => <ClienteField onClienteChange={setCliente} />}
                </form.AppField>
                {cliente && <ClienteResumen cliente={cliente} />}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información laboral</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup className="grid gap-4 sm:grid-cols-2">
                  <form.AppField name="tipoEmpleo">
                    {(field) => (
                      <field.SelectField
                        label="Tipo de empleo"
                        options={opcionesTipoEmpleo}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="lugarTrabajo">
                    {(field) => (
                      <field.TextField
                        label="Empresa / lugar de trabajo"
                        autoComplete="organization"
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="antiguedadLaboral">
                    {(field) => (
                      <field.TextField
                        label="Antigüedad laboral (años)"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="ingresoMensual">
                    {(field) => (
                      <field.TextField
                        label="Ingreso mensual (C$)"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                      />
                    )}
                  </form.AppField>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Condiciones del crédito</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup className="grid gap-4 sm:grid-cols-2">
                  <form.AppField name="montoSolicitado">
                    {(field) => (
                      <field.TextField
                        label="Monto solicitado (C$)"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="cantidadCuotas">
                    {(field) => (
                      <field.TextField
                        label="Cantidad de cuotas"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={360}
                        step={1}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="tasaInteresAnual">
                    {(field) => (
                      <field.TextField
                        label="Tasa de interés anual (%)"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        max={100}
                        step="0.01"
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="periodicidad">
                    {(field) => (
                      <field.SelectField
                        label="Periodicidad de pago"
                        options={opcionesPeriodicidad}
                      />
                    )}
                  </form.AppField>
                </FieldGroup>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4 lg:sticky lg:top-6">
            <form.Subscribe
              selector={(state) => ({
                monto: Number(state.values.montoSolicitado),
                tasa: Number(state.values.tasaInteresAnual),
                cuotas: Number(state.values.cantidadCuotas),
                periodicidad: state.values.periodicidad,
              })}
            >
              {({ monto, tasa, cuotas, periodicidad }) => (
                <CuotaResumen
                  monto={monto}
                  tasaInteresAnual={tasa}
                  cantidadCuotas={cuotas}
                  periodicidad={
                    PERIODICIDADES.includes(periodicidad as Periodicidad)
                      ? (periodicidad as Periodicidad)
                      : ""
                  }
                />
              )}
            </form.Subscribe>
            {crearMutation.isError && (
              <FieldError>{getErrorMessage(crearMutation.error)}</FieldError>
            )}
            <form.SubmitButton pendingText="Registrando...">
              Registrar solicitud
            </form.SubmitButton>
          </div>
        </form.AppForm>
      </form>

      {/* Fuera del <form>: el submit del diálogo no debe llegar al formulario de la solicitud. */}
      <ClienteFormDialog
        open={nuevoClienteOpen}
        onOpenChange={setNuevoClienteOpen}
      />
    </>
  )
}

function ClienteResumen({ cliente }: { cliente: Cliente }) {
  return (
    <dl className="grid gap-3 rounded-lg bg-muted/50 p-4 text-sm sm:grid-cols-3">
      <DetailItem label="Cédula" value={cliente.cedula} />
      <DetailItem
        label="Correo electrónico"
        value={cliente.correoElectronico}
      />
      <DetailItem label="Teléfono" value={cliente.telefono} />
      <DetailItem
        label="Fecha de nacimiento"
        value={formatDate(cliente.fechaNacimiento)}
      />
      <DetailItem label="Edad" value={`${cliente.edad} años`} />
    </dl>
  )
}
