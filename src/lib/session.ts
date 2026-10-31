// Sistema de usuarios y sesiones de CanchaPro
// Almacenamiento local mediante localStorage.

const SESSION_KEY = "canchapro.session";
const ACTIVITY_KEY = "canchapro.activity";
const USERS_KEY = "canchapro.users";

export interface User {
  name: string;
  email: string;
  password: string;
}

export const getUsers = (): User[] => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
};

// Registrar una cuenta nueva
export const registerUser = (user: User) => {
  const users = getUsers();

  const exists = users.some(
    (u) => u.email.toLowerCase() === user.email.toLowerCase()
  );

  if (exists) {
    return { success: false, message: "Este correo ya está registrado." };
  }

  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  return { success: true, message: "Cuenta creada correctamente." };
};

// Verificar las credenciales
export const authenticateUser = (email: string, password: string) => {
  const users = getUsers();

  const user = users.find(
    (u) =>
      u.email.toLowerCase() === email.trim().toLowerCase() &&
      u.password === password
  );

  if (!user) {
    return { success: false, message: "Correo o contraseña incorrectos." };
  }

  return { success: true, user };
};

// Obtener sesión actual
export const getSession = (): { email: string } | null => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
};

// Iniciar sesión
export const signIn = (email: string) => {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ email })
  );
};

// Cerrar sesión
export const signOut = () => {
  localStorage.removeItem(SESSION_KEY);
};

// Registro de actividad
export type ActivityKind = "create" | "update" | "delete";

export interface Activity {
  id: string;
  kind: ActivityKind;
  text: string;
  at: number;
}

export const getActivity = (): Activity[] => {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]");
  } catch {
    return [];
  }
};

export const logActivity = (kind: ActivityKind, text: string) => {
  const next = [
    {
      id: String(Date.now() + Math.random()),
      kind,
      text,
      at: Date.now(),
    },
    ...getActivity(),
  ].slice(0, 20);

  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(next));
};
