import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import {
  clientesKeys,
  eliminarCliente,
  type Cliente,
} from "@/features/clientes/api"
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
  const queryClient = useQueryClient()

  const eliminarMutation = useMutation({
    mutationFn: eliminarCliente,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        // Invalida todas las páginas y búsquedas de la lista.
        queryKey: clientesKeys.all,
      })
      toast.success("Cliente eliminado.")
      onClose()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
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
