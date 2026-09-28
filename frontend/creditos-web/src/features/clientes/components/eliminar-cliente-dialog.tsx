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
import { useEliminarCliente } from "@/features/clientes/api/eliminar-cliente"
import type { Cliente } from "@/features/clientes/types"
import { getErrorMessage } from "@/lib/api-client"

type EliminarClienteDialogProps = {
  /** Cliente a eliminar; el diálogo está abierto mientras tenga valor. */
  cliente: Cliente | null
  onClose: () => void
}

export function EliminarClienteDialog({
  cliente,
  onClose,
}: EliminarClienteDialogProps) {
  const eliminarMutation = useEliminarCliente({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Cliente eliminado.")
        onClose()
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    },
  })

  return (
    <AlertDialog
      open={cliente !== null}
      onOpenChange={(open) => {
        if (!open && !eliminarMutation.isPending) {
          onClose()
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará a <strong>{cliente?.nombreCompleto}</strong> (
            {cliente?.cedula}). Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={eliminarMutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={eliminarMutation.isPending}
            onClick={() => cliente && eliminarMutation.mutate(cliente.id)}
          >
            {eliminarMutation.isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
