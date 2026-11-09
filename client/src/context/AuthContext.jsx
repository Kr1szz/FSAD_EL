import { createContext,useContext,useEffect,useState } from 'react';
import { api } from '../lib/api.js';
const AuthContext=createContext(null);
export function AuthProvider({children}){const [user,setUser]=useState(null),[loading,setLoading]=useState(true);useEffect(()=>{api.get('/auth/me').then(r=>setUser(r.user)).catch(()=>setUser(null)).finally(()=>setLoading(false));},[]);const logout=async()=>{await api.post('/auth/logout');setUser(null)};return <AuthContext.Provider value={{user,setUser,loading,logout}}>{children}</AuthContext.Provider>}
export const useAuth=()=>useContext(AuthContext);
