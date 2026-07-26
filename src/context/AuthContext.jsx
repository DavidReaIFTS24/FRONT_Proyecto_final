import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.api';

// Creamos el contexto. Empieza en null porque al arrancar no sabemos si hay usuario.
const AuthContext = createContext(null);

/**
 * PROVEEDOR DE AUTENTICACIÓN
 * Envolvemos toda la aplicación con este componente para que 
 * el estado del usuario esté disponible en cualquier parte.
 */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true); // Evita parpadeos de redirección al recargar la página.

  /**
   * PERSISTENCIA DE SESIÓN
   * Este efecto corre una sola vez al cargar la app.
   * Verifica si ya existe un token en el navegador para re-loguear al usuario.
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Si hay token, pedimos al servidor los datos actualizados del perfil.
      authApi.getPerfil()
        .then((res) => {
          setUsuario(res.data.data);
        })
        .catch(() => {
          // Si el token expiró o es inválido, limpiamos todo.
          localStorage.removeItem('token');
          setUsuario(null);
        })
        .finally(() => {
          setCargando(false); // Terminamos de validar, la app ya puede mostrarse.
        });
    } else {
      setCargando(false); // No había token, el usuario es invitado.
    }
  }, []);

  /**
   * FUNCIÓN DE LOGIN
   * Recibe credenciales, las valida en el servidor y guarda la sesión.
   */
  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token, usuario: user } = res.data.data;
    
    // Guardamos el token para futuras visitas.
    localStorage.setItem('token', token);
    
    // Actualizamos el estado global.
    setUsuario(user);
    
    return user;
  };

  /**
   * FUNCIÓN DE LOGOUT
   * Limpia rastro de la sesión en el navegador y en el estado de React.
   */
  const logout = () => {
    localStorage.removeItem('token');
    setUsuario(null);
  };

  // El "value" contiene todo lo que los demás componentes podrán usar.
  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {/* Si estamos cargando el perfil, podríamos mostrar un spinner global aquí 
         o dejar que los componentes hijos manejen el estado 'cargando'.
      */}
      {children}
    </AuthContext.Provider>
  );
}

/**
 * HOOK PERSONALIZADO: useAuth
 * Facilita el acceso al contexto. En lugar de importar AuthContext y useContext,
 * simplemente llamamos a useAuth() en nuestros componentes.
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  
  // Seguridad para desarrolladores: avisa si intentamos usar auth fuera de su proveedor.
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return ctx;
};