import { createFormHook } from "@tanstack/react-form"

import { fieldContext, formContext } from "@/components/form/form-context"
import { SubmitButton } from "@/components/form/submit-button"
import { TextField } from "@/components/form/text-field"

/**
 * useForm con los campos de la aplicación ya registrados:
 * `<form.AppField name="x">{(field) => <field.TextField label="X" />}</form.AppField>`.
 */
export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField },
  formComponents: { SubmitButton },
})
