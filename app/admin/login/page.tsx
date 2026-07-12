import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 px-6 py-24">
      <div className="text-center">
        <p className="text-sm font-semibold tracking-widest text-fg-muted">CTRL TEE</p>
        <h1 className="mt-1 text-2xl font-bold">Admin sign in</h1>
      </div>
      <LoginForm />
    </div>
  );
}
