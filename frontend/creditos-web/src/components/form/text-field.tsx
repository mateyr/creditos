import { useFieldContext } from "@/components/form/form-context"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type TextFieldProps = Omit<
  React.ComponentProps<typeof Input>,
  "id" | "name" | "value" | "onChange" | "onBlur"
> & {
  label: string
  /** Normaliza el texto al escribir (p. ej. pasar a mayúsculas). */
  format?: (value: string) => string
}

/** Input de texto enlazado al campo actual de TanStack Form, con etiqueta y errores. */
export function TextField({ label, format, ...props }: TextFieldProps) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) =>
          field.handleChange(
            format ? format(event.target.value) : event.target.value
          )
        }
        aria-invalid={isInvalid}
        {...props}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
