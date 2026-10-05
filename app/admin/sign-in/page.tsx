import { AdminLoginForm } from "./AdminLoginForm";
import { LoginNotice } from "./LoginNotice";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-[2rem] border bg-background/80 p-7 shadow-sm backdrop-blur">
        <span role="img" aria-label="Hussain.Art" className="hm-wordmark h-12" />

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Admin</h1>

        <LoginNotice />

        <AdminLoginForm />
      </div>
    </main>
  );
}
