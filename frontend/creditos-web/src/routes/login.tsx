import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"

import { LoginForm } from "@/features/auth/components/login-form"
import { session } from "@/lib/session"

const loginSearchSchema = z.object({
  // Solo rutas internas ("/..." pero no "//...") para evitar redirecciones abiertas.
  redirect: z
    .string()
    .regex(/^\/(?!\/)/)
    .optional()
    .catch(undefined),
})

export const Route = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
  beforeLoad: ({ search }) => {
    if (session.get()) {
      throw redirect({ href: search.redirect ?? "/creditos" })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = Route.useNavigate()
  const { redirect: redirectTo } = Route.useSearch()

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm
          onSuccess={() => void navigate({ href: redirectTo ?? "/creditos" })}
        />
      </div>
    </div>
  )
}
