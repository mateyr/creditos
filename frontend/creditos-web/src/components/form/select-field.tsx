import { useFieldContext } from "@/components/form/form-context"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type SelectOption = { value: string; label: string }

type SelectFieldProps = {
  label: string
  options: readonly SelectOption[]
  placeholder?: string
}

/** Select enlazado al campo actual de TanStack Form, con etiqueta y errores. */
export function SelectField({
  label,
  options,
  placeholder = "Selecciona una opción",
}: SelectFieldProps) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Select
        // Con items, SelectValue muestra la etiqueta en lugar del valor interno.
        items={options}
        value={field.state.value || null}
        onValueChange={(value) => field.handleChange(value ?? "")}
        onOpenChange={(open) => !open && field.handleBlur()}
      >
        <SelectTrigger
          id={field.name}
          aria-invalid={isInvalid}
          className="w-full"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
