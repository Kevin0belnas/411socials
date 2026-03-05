// hooks/useAuth.js
import { useEffect, useState } from 'react';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;


  const checkSession = async () => {
    try {
      const res = await fetch(`${API_URL}/api/check-session`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (data.loggedIn) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Error checking session:', err);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return { user, isAuthenticated, loading, checkSession };
}


// import { useEffect, useState } from 'react';

// export default function useAuth() {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(null);

//   useEffect(() => {
//     const fetchSession = async () => {
//       try {
//         const res = await fetch('http://localhost:5000/api/check-session', {
//           credentials: 'include',
//         });
//         const data = await res.json();
//         if (data.loggedIn) {
//           setUser(data.user);
//           setIsAuthenticated(true);
//         } else {
//           setUser(null);
//           setIsAuthenticated(false);
//         }
//       } catch {
//         setUser(null);
//         setIsAuthenticated(false);
//       }
//     };

//     fetchSession();
//   }, []);

//   return { user, isAuthenticated };
// }
