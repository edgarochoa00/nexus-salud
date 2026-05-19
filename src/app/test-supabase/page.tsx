"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function TestSupabase() {
  const [status, setStatus] = useState("Conectando...");
  const [details, setDetails] = useState("");

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient();
        
        // Hacemos una petición de prueba al sistema de Autenticación de Supabase
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setStatus("❌ Error de conexión");
          setDetails(error.message);
        } else {
          setStatus("✅ ¡Conexión Exitosa con Supabase!");
          setDetails("Tu app se comunicó correctamente con tu proyecto en Supabase.");
        }
      } catch (err: any) {
        setStatus("❌ Error crítico de conexión");
        setDetails(err.message);
      }
    }

    testConnection();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-black/90">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-4">Prueba de Conexión</h1>
        
        <div className={`text-lg font-bold p-4 rounded-xl mb-4 ${status.includes('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {status}
        </div>
        
        <p className="text-white/70 text-sm">{details}</p>
        
        <div className="mt-8">
          <a href="/" className="text-cyan-400 hover:text-cyan-300 underline text-sm">
            Volver al Inicio
          </a>
        </div>
      </div>
    </main>
  );
}
