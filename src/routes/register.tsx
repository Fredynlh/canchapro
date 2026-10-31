import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/lib/session";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [{ title: "Crear cuenta — CanchaPro" }],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanEmail = email.trim();

    if (!name.trim()) return setError("Ingresa tu nombre completo.");
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return setError("Ingresa un correo válido.");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirmPassword) return setError("Las contraseñas no coinciden.");

    setError("");
    setLoading(true);

    const result = registerUser({
      name: name.trim(),
      email: cleanEmail.toLowerCase(),
      password,
    });

    setLoading(false);

    if (!result.success) {
      return setError(result.message);
    }

    navigate({ to: "/login" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-brand p-12 lg:flex lg:flex-col lg:justify-between">
        <Logo textClassName="text-primary-foreground text-xl" />
        <div className="relative z-10 max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight text-primary-foreground">
            Bienvenido a CanchaPro.
          </h2>
          <p className="mt-4 text-primary-foreground/70">
            Administra tus canchas y reservaciones desde un solo lugar.
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full border-[40px] border-accent/20" />
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <Logo className="mb-8 lg:hidden" textClassName="text-foreground text-xl" />

          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Crear cuenta
          </h1>
          <p className="mt-2 text-muted-foreground">Regístrate para acceder a CanchaPro.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="Tu nombre"
                  className="h-11 pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  className="h-11 pl-10"
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
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  className="h-11 px-10"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type={show ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                className="h-11"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
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
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
