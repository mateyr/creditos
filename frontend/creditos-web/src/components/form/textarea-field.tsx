import { useFieldContext } from "@/components/form/form-context"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

type TextareaFieldProps = Omit<
  React.ComponentProps<typeof Textarea>,
  "id" | "name" | "value" | "onChange" | "onBlur"
> & {
  label: string
  description?: string
}

/** Textarea enlazado al campo actual de TanStack Form, con etiqueta y errores. */
export function TextareaField({
  label,
  description,
  ...props
}: TextareaFieldProps) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        aria-invalid={isInvalid}
        {...props}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
