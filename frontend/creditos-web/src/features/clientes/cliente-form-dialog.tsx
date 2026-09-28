import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldError, FieldGroup } from "@/components/ui/field"
import {
  actualizarCliente,
  clienteSchema,
  clientesKeys,
  crearCliente,
  type Cliente,
  type ClienteRequest,
} from "@/features/clientes/api"
import { useAppForm } from "@/hooks/use-app-form"
import { getErrorMessage } from "@/lib/api-client"

const clienteVacio: ClienteRequest = {
  cedula: "",
  nombreCompleto: "",
  correoElectronico: "",
  telefono: "",
  fechaNacimiento: "",
}

type ClienteFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Cliente a editar; si no se indica, el diálogo crea uno nuevo. */
  cliente?: Cliente
}

export function ClienteFormDialog({
  open,
  onOpenChange,
  cliente,
}: ClienteFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {cliente ? "Editar cliente" : "Nuevo cliente"}
          </DialogTitle>
          <DialogDescription>
            Información personal del cliente para el expediente de crédito.
          </DialogDescription>
        </DialogHeader>
        {/* La key reinicia el formulario al cambiar de cliente. */}
        <ClienteForm
          key={cliente?.id ?? "nuevo"}
          cliente={cliente}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function ClienteForm({
  cliente,
  onSuccess,
}: {
  cliente?: Cliente
  onSuccess: () => void
}) {
  const queryClient = useQueryClient()

  const guardarMutation = useMutation({
    mutationFn: async (request: ClienteRequest) => {
      if (cliente) {
        await actualizarCliente(cliente.id, request)
      } else {
        await crearCliente(request)
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        // Invalida todas las páginas y búsquedas de la lista.
        queryKey: clientesKeys.all,
      })
      toast.success(cliente ? "Cliente actualizado." : "Cliente registrado.")
      onSuccess()
    },
  })

  const form = useAppForm({
    defaultValues: cliente
      ? {
          cedula: cliente.cedula,
          nombreCompleto: cliente.nombreCompleto,
          correoElectronico: cliente.correoElectronico,
          telefono: cliente.telefono,
          fechaNacimiento: cliente.fechaNacimiento,
        }
      : clienteVacio,
    validators: { onSubmit: clienteSchema },
    onSubmit: async ({ value }) => {
      // parse aplica las normalizaciones del schema (trim) antes de enviar.
      await guardarMutation
        .mutateAsync(clienteSchema.parse(value))
        .catch(() => {
          // El error se muestra a partir del estado de la mutación.
        })
    },
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.AppForm>
        <FieldGroup>
          <form.AppField name="cedula">
            {(field) => (
              <field.TextField
                label="Cédula"
                placeholder="000-000000-0000A"
                autoComplete="off"
                format={(value) => value.toUpperCase()}
              />
            )}
          </form.AppField>
          <form.AppField name="nombreCompleto">
            {(field) => (
              <field.TextField label="Nombre completo" autoComplete="name" />
            )}
          </form.AppField>
          <div className="grid gap-4 sm:grid-cols-2">
            <form.AppField name="correoElectronico">
              {(field) => (
                <field.TextField
                  label="Correo electrónico"
                  type="email"
                  autoComplete="email"
                />
              )}
            </form.AppField>
            <form.AppField name="telefono">
              {(field) => (
                <field.TextField
                  label="Teléfono"
                  type="tel"
                  autoComplete="tel"
                />
              )}
            </form.AppField>
          </div>
          <form.AppField name="fechaNacimiento">
            {(field) => (
              <field.TextField label="Fecha de nacimiento" type="date" />
            )}
          </form.AppField>
          {guardarMutation.isError && (
            <FieldError>{getErrorMessage(guardarMutation.error)}</FieldError>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <form.SubmitButton>
              {cliente ? "Guardar cambios" : "Registrar cliente"}
            </form.SubmitButton>
          </DialogFooter>
        </FieldGroup>
      </form.AppForm>
    </form>
  )
}
