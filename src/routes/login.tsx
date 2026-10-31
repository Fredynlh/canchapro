import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, authenticateUser } from "@/lib/session";
export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — CanchaPro" },
      { name: "description", content: "Accede al panel de administración de CanchaPro." },
      { property: "og:title", content: "Iniciar sesión — CanchaPro" },
      { property: "og:description", content: "Accede al panel de administración de CanchaPro." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanEmail = email.trim();

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return setError("Ingresa un correo electrónico válido.");
    }

    if (!password) {
      return setError("Ingresa tu contraseña.");
    }

    setError(null);
    setLoading(true);

    const result = authenticateUser(cleanEmail, password);

    if (!result.success) {
      setError(result.message || "Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    signIn(cleanEmail);
    navigate({ to: "/" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-brand p-12 lg:flex lg:flex-col lg:justify-between">
        <Logo textClassName="text-primary-foreground text-xl" />
        <div className="relative z-10 max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight text-primary-foreground">
            Administra tus canchas con orden y claridad.
          </h2>
          <p className="mt-4 text-primary-foreground/70">
            Canchas y reservaciones, todo en un solo lugar.
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full border-[40px] border-accent/20" />
        <div className="pointer-events-none absolute right-24 top-24 h-40 w-40 rounded-full bg-accent/10" />
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <Logo className="mb-8 lg:hidden" textClassName="text-foreground text-xl" />
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-muted-foreground">
            Ingresa tus datos para continuar-texto cabiado.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  className="h-11 bg-card pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-11 bg-card px-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button
              type="submit"
              variant="accent"
              className="h-11 w-full text-base"
              disabled={loading}
            >
              {loading ? "Ingresando…" : "Iniciar sesión"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
