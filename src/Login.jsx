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
  const [input,   setInput]   = useState("");
  const [error,   setError]   = useState(false);
  const [shake,   setShake]   = useState(false);
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
      background: "#f4f7f4",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 20px",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>

      <div style={{ position:"fixed", top:0, left:0, right:0, background:"#008751", height:5 }} />

      <div style={{ width:"100%", maxWidth:420, animation: shake ? "shake 0.5s ease" : "none" }}>

        <div style={{
          background:"white", borderRadius:"16px 16px 0 0",
          padding:"28px 28px 24px", borderTop:"5px solid #008751", textAlign:"center",
        }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:20 }}>
            <div style={{ width:4, height:48, background:"#008751", borderRadius:2, flexShrink:0 }} />
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:11, fontWeight:600, color:"#008751", textTransform:"uppercase", letterSpacing:"1px" }}>
                Junta de Andalucía
              </div>
              <div style={{ fontSize:13, fontWeight:700, color:"#1e293b", lineHeight:1.3 }}>
                Servicio Andaluz de Salud
              </div>
              <div style={{ fontSize:11, color:"#64748b" }}>
                Atención Primaria · Marbella
              </div>
            </div>
          </div>

          <div style={{
            background:"#f0faf4", border:"1.5px solid #86efac",
            borderRadius:12, padding:"18px 20px", marginBottom:6,
          }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#008751", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:6 }}>
              Proceso Asistencial Integrado
            </div>
            <div style={{ fontSize:26, fontWeight:800, color:"#005f3a", lineHeight:1.1, marginBottom:4 }}>
              Diabetes<br/>Mellitus
            </div>
            <div style={{ fontSize:12, color:"#3f6212", marginTop:6 }}>
              Consejería de Salud · Junta de Andalucía
            </div>
          </div>
        </div>

        <div style={{
          background:"white", padding:"24px 28px 28px",
          borderRadius:"0 0 16px 16px", borderTop:"1px solid #e2e8f0",
          boxShadow:"0 8px 32px rgba(0,135,81,0.10)",
        }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#1e293b", marginBottom:4 }}>
            Acceso profesional
          </div>
          <div style={{ fontSize:12, color:"#64748b", marginBottom:18 }}>
            Introduce la contraseña para acceder a la aplicación.
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ position:"relative", marginBottom:14 }}>
              <input
                type={visible ? "text" : "password"}
                value={input}
                onChange={e => { setInput(e.target.value); setError(false); }}
                placeholder="Contraseña de acceso"
                autoFocus
                style={{
                  width:"100%", padding:"12px 44px 12px 14px", fontSize:14,
                  borderRadius:10, border:`1.5px solid ${error ? "#fca5a5" : "#d1fae5"}`,
                  background: error ? "#fff5f5" : "#f8fffe",
                  outline:"none", color:"#0f172a", fontFamily:"inherit", boxSizing:"border-box",
                }}
              />
              <button type="button" onClick={() => setVisible(v => !v)} style={{
                position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", cursor:"pointer", fontSize:16, color:"#94a3b8",
              }}>
                {visible ? "🙈" : "👁️"}
              </button>
            </div>

            {error && (
              <div style={{
                fontSize:12, color:"#dc2626", background:"#fff5f5",
                border:"1px solid #fecaca", borderRadius:8, padding:"8px 12px", marginBottom:12,
              }}>
                ⚠️ Contraseña incorrecta. Inténtalo de nuevo.
              </div>
            )}

            <button type="submit" style={{
              width:"100%", padding:"13px", background:"#008751",
              color:"white", fontSize:14, fontWeight:700,
              border:"none", borderRadius:10, cursor:"pointer", letterSpacing:"0.3px",
            }}>
              Acceder →
            </button>
          </form>

          <div style={{ marginTop:16, fontSize:11, color:"#94a3b8", textAlign:"center", lineHeight:1.6 }}>
            La sesión expira automáticamente tras {SESSION_HOURS} horas.<br />
            Uso exclusivo para profesionales del centro.
          </div>
        </div>

        <div style={{ marginTop:24, display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:0.5 }}>
          <a href="mailto:doncel.project@gmail.com" title="doncel.project@gmail.com"
            style={{ display:"flex", alignItems:"center", gap:7, textDecoration:"none" }}>
            <img src="/assets/icon-192.png" alt="Doncel Project"
              style={{ width:20, height:20, borderRadius:4, objectFit:"cover" }} />
            <span style={{ fontSize:11, fontWeight:700, color:"#475569" }}>
              doncel<span style={{ color:"#0891b2" }}>project</span>
            </span>
          </a>
        </div>

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
