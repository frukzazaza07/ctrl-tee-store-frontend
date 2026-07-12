"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/features/auth/actions";
import { Input } from "@/components/ui/Input";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="w-full max-w-sm space-y-4">
      <Input label="Email" name="email" type="email" autoComplete="username" required />
      <Input label="Password" name="password" type="password" autoComplete="current-password" required />
      {state.error ? <p className="text-sm text-accent">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className={cn(buttonVariants({ size: "lg", className: "w-full disabled:opacity-70" }))}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
