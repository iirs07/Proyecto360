import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al iniciar
  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      // 🚨 CORRECCIÓN 1: Usamos el endpoint '/api/usuario' que está definido en tu Laravel.
      fetch("http://127.0.0.1:8000/api/usuario", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
            // Manejo de token expirado: si no es 200/201, asumimos fallo de token.
            if (!res.ok) throw new Error("Token inválido o expirado");
            return res.json();
        })
        // 🚨 CORRECCIÓN 2: Laravel devuelve el objeto de usuario directamente (data).
        // También normalizamos el rol a minúsculas aquí, para que el Header lo pueda usar.
        .then((data) => setUsuario({ ...data, rol: data.rol.toLowerCase() })) 
        .catch(() => {
            // Si el fetch falla (red, 401, 404), limpiamos la sesión.
            localStorage.removeItem("jwt_token");
            setUsuario(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (usuario, token) => {
    localStorage.setItem("jwt_token", token);
    // Aseguramos que el rol esté en minúsculas al iniciar sesión también
    setUsuario({ ...usuario, rol: usuario.rol.toLowerCase() });
  };

  const logout = () => {
    localStorage.removeItem("jwt_token");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usarlo fácil
export const useAuth = () => useContext(AuthContext);