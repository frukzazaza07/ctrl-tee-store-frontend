"use client";

import type { FormEvent, ReactNode } from "react";

interface ConfirmFormProps {
  action: () => Promise<void>;
  confirmMessage: string;
  children: ReactNode;
  className?: string;
}

/** Wraps a server-action form so the submit is confirmed with the user first. */
export function ConfirmForm({ action, confirmMessage, children, className }: ConfirmFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(confirmMessage)) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
}
