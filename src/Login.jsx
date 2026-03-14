import { useState } from "react";
import { APP_PASSWORD, SESSION_HOURS } from "./config.js";

const SESSION_KEY = "pai_diabetes_session";

export function checkSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const { expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function createSession() {
  const expiry = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ expiry }));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export default function Login({ onSuccess }) {
  const [input, setInput]     = useState("");
  const [error, setError]     = useState(false);
  const [shake, setShake]     = useState(false);
  const [visible, setVisible] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === APP_PASSWORD) {
      createSession();
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setInput("");
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      {/* Logo / Título */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🩺</div>
        <div style={{
          fontSize: 22, fontWeight: 900, color: "white",
          letterSpacing: "-0.5px", marginBottom: 4,
        }}>
          PAI Diabetes Mellitus
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8" }}>
          Consejería de Salud · Servicio Andaluz de Salud
        </div>
        <div style={{
          display: "inline-block", marginTop: 10,
          fontSize: 11, color: "#38bdf8",
          background: "rgba(56,189,248,0.12)",
          border: "1px solid rgba(56,189,248,0.25)",
          borderRadius: 6, padding: "3px 10px",
        }}>
          Centro de Salud · Marbella
        </div>
      </div>

      {/* Card de login */}
      <div style={{
        background: "white",
        borderRadius: 18,
        padding: "28px 24px",
        width: "100%",
        maxWidth: 360,
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        animation: shake ? "shake 0.5s ease" : "none",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
          Acceso profesional
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>
          Introduce la contraseña para acceder a la aplicación.
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <input
              type={visible ? "text" : "password"}
              value={input}
              onChange={e => { setInput(e.target.value); setError(false); }}
              placeholder="Contraseña de acceso"
              autoFocus
              style={{
                width: "100%",
                padding: "12px 44px 12px 14px",
                fontSize: 14,
                borderRadius: 10,
                border: `1.5px solid ${error ? "#fca5a5" : "#e2e8f0"}`,
                background: error ? "#fff5f5" : "#f8fafc",
                outline: "none",
                color: "#0f172a",
                fontFamily: "inherit",
              }}
            />
            <button
              type="button"
              onClick={() => setVisible(v => !v)}
              style={{
                position: "absolute", right: 12, top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                fontSize: 16, color: "#94a3b8",
              }}
            >
              {visible ? "🙈" : "👁️"}
            </button>
          </div>

          {error && (
            <div style={{
              fontSize: 12, color: "#dc2626",
              background: "#fff5f5", border: "1px solid #fecaca",
              borderRadius: 8, padding: "8px 12px", marginBottom: 12,
            }}>
              ⚠️ Contraseña incorrecta. Inténtalo de nuevo.
            </div>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "13px",
              background: "linear-gradient(135deg, #0f172a, #1e3a5f)",
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              letterSpacing: "0.3px",
            }}
          >
            Acceder →
          </button>
        </form>

        <div style={{
          marginTop: 16, fontSize: 11, color: "#94a3b8",
          textAlign: "center", lineHeight: 1.5,
        }}>
          La sesión expira automáticamente tras {SESSION_HOURS} horas.<br/>
          Uso exclusivo para profesionales del centro.
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 24, fontSize: 11, color: "#475569", textAlign: "center" }}>
        PAI Diabetes Mellitus 3ª Ed. 2018 · Junta de Andalucía
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
