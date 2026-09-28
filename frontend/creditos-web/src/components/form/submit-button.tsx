import { useFormContext } from "@/components/form/form-context"
import { Button } from "@/components/ui/button"

/** Botón de envío que se deshabilita mientras el formulario se está enviando. */
export function SubmitButton({
  children,
  pendingText = "Guardando...",
}: {
  children: React.ReactNode
  pendingText?: string
}) {
  const form = useFormContext()

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? pendingText : children}
        </Button>
      )}
    </form.Subscribe>
  )
}
