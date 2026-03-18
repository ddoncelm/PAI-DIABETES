import { useState, useCallback } from "react";
import Login, { checkSession, clearSession } from "./Login.jsx";

// ─── NAVEGACIÓN — PAI primero, herramientas al final ──────────────────────────
const MOMENTOS = [
  { id: "prevencion",     label: "Prevención",       icon: "🛡️", color: "#0ea5e9" },
  { id: "cribado",        label: "Cribado",          icon: "🔍", color: "#8b5cf6" },
  { id: "diagnostico",    label: "Diagnóstico",      icon: "📋", color: "#f59e0b" },
  { id: "complicaciones", label: "Complicaciones",   icon: "⚠️", color: "#ef4444" },
  { id: "plan",           label: "Plan Terapéutico", icon: "🩺", color: "#10b981" },
  { id: "seguimiento",    label: "Seguimiento",      icon: "📅", color: "#6366f1" },
  // ── Herramientas al final ──
  { id: "insulinas",      label: "Insulinas",        icon: "💉", color: "#0891b2", herramienta: true },
  { id: "ado",            label: "ADO",              icon: "💊", color: "#7c3aed", herramienta: true },
  { id: "regicor",        label: "REGICOR",          icon: "🧮", color: "#e11d48", herramienta: true },
];

// ─── BADGE COLORS ─────────────────────────────────────────────────────────────
const BC = {
  "AG":          { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
  "B":           { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
  "A NICE":      { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  "NICE":        { bg: "#f5f3ff", text: "#6b21a8", border: "#e9d5ff" },
  "NICE Fuerte": { bg: "#fdf2f8", text: "#9d174d", border: "#fbcfe8" },
  "NICE AG":     { bg: "#f5f3ff", text: "#6b21a8", border: "#e9d5ff" },
  "E AG":        { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
};

// ─── INSULINAS DATA ───────────────────────────────────────────────────────────
const INSULINAS_TIPOS = [
  { categoria: "Ultrarrápidas (análogos)", color: "#0891b2", items: [
    { nombre: "Lispro (Humalog®)",    inicio: "5–15 min",  pico: "30–90 min", duracion: "3–5 h",  notas: "Análogo rápido. Administrar justo antes o con la comida." },
    { nombre: "Aspart (NovoRapid®)",  inicio: "5–15 min",  pico: "30–90 min", duracion: "3–5 h",  notas: "Elección en embarazo. Análogo rápido." },
    { nombre: "Glulisina (Apidra®)",  inicio: "5–15 min",  pico: "30–60 min", duracion: "3–4 h",  notas: "Inicio muy rápido. Administrar 15 min antes o tras la comida." },
  ]},
  { categoria: "Rápida (humana)", color: "#0369a1", items: [
    { nombre: "Insulina regular (Actrapid®, Humulin R®)", inicio: "30–60 min", pico: "2–4 h", duracion: "5–8 h", notas: "Administrar 30 min antes de comer. Usada en bomba IV hospitalaria." },
  ]},
  { categoria: "Intermedia (NPH)", color: "#6366f1", items: [
    { nombre: "NPH (Insulatard®, Humulin N®)", inicio: "1–2 h", pico: "4–8 h", duracion: "12–18 h", notas: "Insulina basal de elección en embarazo. Opción coste-efectiva en bajo riesgo de hipoglucemia." },
  ]},
  { categoria: "Basales lentas (análogos)", color: "#7c3aed", items: [
    { nombre: "Glargina 100 U/ml (Lantus®, Abasaglar®)", inicio: "2–4 h",    pico: "Sin pico",  duracion: "20–24 h", notas: "1 vez/día a la misma hora. No mezclar. Biosimilar disponible." },
    { nombre: "Glargina 300 U/ml (Toujeo®)",             inicio: "6 h",       pico: "Sin pico",  duracion: ">24 h",   notas: "Indicada si dosis >40 UI/día. ⚠️ No intercambiable unidad a unidad con Glargina 100." },
    { nombre: "Detemir (Levemir®)",                       inicio: "1–3 h",    pico: "Mínimo",    duracion: "12–20 h", notas: "Puede precisar 2 dosis/día. Elección en embarazo junto a NPH." },
    { nombre: "Degludec (Tresiba®)",                      inicio: "30–90 min",pico: "Sin pico",  duracion: ">42 h",   notas: "Mayor flexibilidad horaria. Menor riesgo hipoglucemia nocturna." },
  ]},
  { categoria: "Premezcladas", color: "#b45309", items: [
    { nombre: "Bifásica 30/70 (Mixtard®, Humulin M3®)", inicio: "30 min",    pico: "2–8 h",    duracion: "10–16 h", notas: "30% rápida + 70% NPH. 2 dosis/día. Menos flexible." },
    { nombre: "Mix 25/50 (Humalog Mix®)",                inicio: "5–15 min",  pico: "30–70 min", duracion: "12–16 h", notas: "25–50% lispro + 75–50% protamina lispro. Justo antes de comer." },
    { nombre: "NovoMix 30 (BiAsp 30®)",                  inicio: "5–15 min",  pico: "1–4 h",    duracion: "14–24 h", notas: "30% aspart libre + 70% aspart cristalizada." },
  ]},
];

const AJUSTE_INSULINA = [
  { titulo: "🏃 Actividad física", color: "#0891b2", items: [
    "Ejercicio moderado (<60 min): reducir dosis rápida previa un 20–30%",
    "Ejercicio intenso o prolongado (>60 min): reducir basal 20% día anterior + rápida previa 30–50%",
    "Aumentar HC 15–30g por cada 30 min de ejercicio moderado si no se reduce insulina",
    "Vigilar glucemias post-ejercicio hasta 24h (efecto retardado)",
    "Objetivo glucemia antes de ejercicio: 120–180 mg/dl. No ejercicio si >250 mg/dl con cetosis",
  ]},
  { titulo: "🤒 Enfermedad intercurrente (sick-day rules)", color: "#dc2626", items: [
    "NUNCA suspender la insulina basal aunque no se coma",
    "Aumentar frecuencia de autocontroles (cada 2–4 horas)",
    "Si glucemia >250 mg/dl: medir cetonas. Si cetonas >0,6 mmol/l → contactar equipo sanitario",
    "Mantener hidratación abundante",
    "Si vómitos persistentes o no tolera líquidos → derivar a urgencias",
    "En DMT2 con TNI: suspender metformina y iSGLT2 si fiebre alta o deshidratación",
  ]},
  { titulo: "🏥 Insulina en hospitalización", color: "#7c3aed", items: [
    "Tratamiento de elección en paciente no crítico: régimen bolo-basal-corrección",
    "Objetivo glucemia críticos: 140–180 mg/dl",
    "Objetivo glucemia no críticos: preprandial 100–140 mg/dl · postprandial <180 mg/dl",
    "Retirar fármacos no insulínicos durante la hospitalización",
    "⛔ No usar pautas en escala (sliding scales) como tratamiento único",
    "Al alta: reevaluación en AP en 1 semana",
  ]},
];

// ─── ADO DATA ─────────────────────────────────────────────────────────────────
const ADO_FAMILIAS = [
  { familia: "Biguanidas", color: "#0891b2", farmacos: [
    { nombre: "Metformina", mecanismo: "↓ producción hepática glucosa · ↑ sensibilidad periférica a insulina",
      dosis: "425–500 mg/día inicio · máx 2.000–3.000 mg/día en 2–3 tomas",
      hba1c: "↓ 1–1,5%", peso: "Neutro", hipoglucemia: "No",
      cv: "✅ Superioridad en sobrepeso/obesidad",
      precauciones: "Contraindicada FG <30 ml/min. Precaución FG 30–45 ml/min. Suspender con contraste IV si FG <60. Puede causar déficit B12.",
      renal: "Ajustar FG 30–45 · Contraindicada FG <30" },
  ]},
  { familia: "iDPP-4 (Gliptinas)", color: "#6366f1", farmacos: [
    { nombre: "Sitagliptina (Januvia®)", mecanismo: "Inhibe DPP-4 → ↑ GLP-1 e GIP endógenos",
      dosis: "100 mg/día · 50 mg si FG 30–49 · 25 mg si FG <30",
      hba1c: "↓ 0,7%", peso: "Neutro", hipoglucemia: "No", cv: "Neutro",
      precauciones: "Riesgo pancreatitis (poco frecuente). Ajuste renal obligatorio.",
      renal: "Reducir dosis según FG" },
    { nombre: "Linagliptina (Trajenta®)", mecanismo: "Igual. Eliminación biliar → sin ajuste renal",
      dosis: "5 mg/día. Sin ajuste en ERC.",
      hba1c: "↓ 0,7%", peso: "Neutro", hipoglucemia: "No", cv: "Neutro",
      precauciones: "Elección preferente en ERC. Riesgo pancreatitis (poco frecuente).",
      renal: "✅ Sin ajuste de dosis" },
    { nombre: "Saxagliptina (Onglyza®)", mecanismo: "Igual que sitagliptina",
      dosis: "5 mg/día · 2,5 mg/día si FG <50 ml/min",
      hba1c: "↓ 0,7%", peso: "Neutro", hipoglucemia: "No",
      cv: "⚠️ ↑ riesgo hospitalización por insuficiencia cardíaca",
      precauciones: "⚠️ Evitar en insuficiencia cardíaca. No usar FG <15 ni diálisis.",
      renal: "Reducir a 2,5 mg si FG <50" },
    { nombre: "Alogliptina (Vipidia®)", mecanismo: "Igual que sitagliptina",
      dosis: "25 mg/día · 12,5 mg si FG 30–59 · 6,25 mg si FG <30",
      hba1c: "↓ 0,7%", peso: "Neutro", hipoglucemia: "No",
      cv: "⚠️ ↑ riesgo hospitalización por insuficiencia cardíaca",
      precauciones: "⚠️ Evitar en insuficiencia cardíaca. Ajuste renal obligatorio.",
      renal: "Reducir dosis según FG" },
  ]},
  { familia: "iSGLT-2 (Gliflozinas)", color: "#0369a1", farmacos: [
    { nombre: "Empagliflozina (Jardiance®)", mecanismo: "Inhibe reabsorción renal glucosa → glucosuria. Independiente de insulina.",
      dosis: "10 mg/día · puede subirse a 25 mg/día",
      hba1c: "↓ 0,7–1%", peso: "↓ Moderada", hipoglucemia: "No",
      cv: "✅ Superioridad CV en EVA previa (EMPA-REG) · ✅ Protección renal",
      precauciones: "⚠️ No iniciar FG <60. Suspender FG <45. Riesgo ITU y candidiasis. Cetoacidosis euglucémica (raro). Suspender en cirugía o enfermedad grave.",
      renal: "No iniciar FG <60 · Suspender FG <45" },
    { nombre: "Dapagliflozina (Forxiga®)", mecanismo: "Igual que empagliflozina",
      dosis: "10 mg/día",
      hba1c: "↓ 0,7–1%", peso: "↓ Moderada", hipoglucemia: "No",
      cv: "✅ Protección renal y cardíaca (DAPA-HF, DAPA-CKD)",
      precauciones: "⚠️ No usar si cáncer de vejiga. No iniciar FG <60. Mismos riesgos que empagliflozina.",
      renal: "No iniciar FG <60 · Sin efecto glucémico FG <45" },
    { nombre: "Canagliflozina (Invokana®)", mecanismo: "Igual que empagliflozina",
      dosis: "100 mg/día · 300 mg si FG ≥60",
      hba1c: "↓ 0,7–1%", peso: "↓ Moderada", hipoglucemia: "No",
      cv: "✅ Reducción eventos CV en EVA previa (CANVAS)",
      precauciones: "⚠️ ↑ riesgo fracturas y amputaciones de miembros inferiores. Mismos riesgos que otros iSGLT2.",
      renal: "Suspender FG <45" },
  ]},
  { familia: "aRGLP-1 (Agonistas receptor GLP-1)", color: "#059669", farmacos: [
    { nombre: "Liraglutida (Victoza®)", mecanismo: "Mimetiza GLP-1 → ↑ insulina glucosa-dependiente · ↓ glucagón · ↓ vaciamiento gástrico · ↑ saciedad",
      dosis: "0,6 mg/día SC inicio → 1,2 mg/día → máx 1,8 mg/día",
      hba1c: "↓ 1,0–1,5%", peso: "↓↓ Pérdida significativa", hipoglucemia: "No",
      cv: "✅ Superioridad CV en EVA previa (LEADER) · ✅ Protección renal",
      precauciones: "SC diario. Náuseas/vómitos al inicio. ⚠️ No usar en pancreatitis ni carcinoma medular de tiroides.",
      renal: "Precaución FG <15" },
    { nombre: "Semaglutida SC (Ozempic®)", mecanismo: "Igual que liraglutida. T½ larga → semanal",
      dosis: "0,25 mg/sem SC (4 sem) → 0,5 mg/sem → máx 1 mg/sem",
      hba1c: "↓ 1,5–2%", peso: "↓↓↓ Mayor pérdida ponderal", hipoglucemia: "No",
      cv: "✅ Superioridad CV (SUSTAIN-6)",
      precauciones: "Semanal. Mismos que liraglutida. Alta eficacia ponderal.",
      renal: "Sin ajuste renal" },
    { nombre: "Dulaglutida (Trulicity®)", mecanismo: "Igual. T½ larga → semanal. Pluma precargada.",
      dosis: "0,75 mg/sem SC → 1,5 mg/sem",
      hba1c: "↓ 1,0–1,5%", peso: "↓ Moderada", hipoglucemia: "No",
      cv: "✅ Beneficio CV (REWIND)",
      precauciones: "Semanal. Pluma fácil de usar. Mismos que liraglutida.",
      renal: "Sin ajuste. Precaución FG <15" },
    { nombre: "Exenatida semanal (Bydureon®)", mecanismo: "Igual. Liberación prolongada.",
      dosis: "2 mg/sem SC",
      hba1c: "↓ 1,0%", peso: "↓ Moderada", hipoglucemia: "No", cv: "Neutro (EXSCEL)",
      precauciones: "Requiere reconstitución. Nodulillo SC frecuente. No usar FG <45 ml/min.",
      renal: "Contraindicada FG <45" },
  ]},
  { familia: "Sulfonilureas", color: "#d97706", farmacos: [
    { nombre: "Gliclazida MR (Diamicron MR®) ✅ PREFERENTE", mecanismo: "Estimula secreción insulina por células β (secretagogo).",
      dosis: "30–120 mg/día (MR, 1 toma)",
      hba1c: "↓ 0,8%", peso: "↑ Leve", hipoglucemia: "Ligero-moderado", cv: "Sin datos de superioridad",
      precauciones: "Preferente por menor riesgo hipoglucemia. Precaución en ancianos, IR, IH, ayuno.",
      renal: "Usar con precaución. Reducir en IR moderada." },
    { nombre: "Glimepirida (Amaryl®) ✅ PREFERENTE", mecanismo: "Igual que gliclazida",
      dosis: "1–4 mg/día (1 toma)",
      hba1c: "↓ 0,8%", peso: "↑ Leve", hipoglucemia: "Moderado", cv: "Sin datos de superioridad",
      precauciones: "Preferente frente a glibenclamida. Riesgo hipoglucemia.",
      renal: "Precaución en IR. No recomendada FG <30." },
    { nombre: "Glibenclamida ⛔ NO RECOMENDADA", mecanismo: "T½ larga y metabolito activo acumulable",
      dosis: "No recomendada",
      hba1c: "↓ 0,8%", peso: "↑↑", hipoglucemia: "Alto (incluyendo hipoglucemia grave prolongada)", cv: "Sin datos de superioridad",
      precauciones: "⛔ NO USAR según PAI Diabetes 2018 y NICE. Riesgo de hipoglucemia grave y prolongada, especialmente en ancianos e IR.",
      renal: "Contraindicada en IR" },
  ]},
  { familia: "Meglitinidas", color: "#92400e", farmacos: [
    { nombre: "Repaglinida (Novonorm®)", mecanismo: "Secretagogo de acción corta. Estimula insulina solo con la ingesta.",
      dosis: "0,5–4 mg antes de cada comida principal (2–3 veces/día)",
      hba1c: "↓ 0,7%", peso: "↑ Leve", hipoglucemia: "Ligero-moderado", cv: "Sin datos de superioridad",
      precauciones: "Útil en horario irregular de comidas. Omitir si no se va a comer. Ajustar en IH.",
      renal: "Sin ajuste renal necesario" },
  ]},
  { familia: "Tiazolidindionas (Glitazonas)", color: "#9f1239", farmacos: [
    { nombre: "Pioglitazona (Actos®)", mecanismo: "Agonista PPAR-γ → ↑ sensibilidad insulínica en tejido adiposo y muscular",
      dosis: "15–45 mg/día (1 toma)",
      hba1c: "↓ 0,8%", peso: "↑↑ (edema)", hipoglucemia: "No", cv: "Neutro",
      precauciones: "⛔ Contraindicada en IC. ⛔ Contraindicada en IH. ⛔ Suspender si cáncer vejiga activo. ⚠️ ↑ riesgo fracturas en mujeres. Efecto lento (6–12 sem).",
      renal: "Sin ajuste renal" },
  ]},
  { familia: "Inhibidores alfa-glucosidasa", color: "#475569", farmacos: [
    { nombre: "Acarbosa (Glucobay®)", mecanismo: "Inhibe alfa-glucosidasas intestinales → retrasa absorción HC → ↓ pico postprandial",
      dosis: "50 mg 3 veces/día (primer bocado) → máx 100 mg 3 veces/día",
      hba1c: "↓ 0,6%", peso: "Neutro", hipoglucemia: "No", cv: "Sin datos relevantes",
      precauciones: "Frecuentes efectos GI (flatulencia, diarrea). Si hipoglucemia concomitante: tratar con glucosa pura (no sacarosa).",
      renal: "Contraindicada FG <25 ml/min" },
  ]},
];

const INTERACCIONES = [
  { grupo: "Fármacos que ↑ glucemia (hiperglucemiantes)", color: "#dc2626", items: [
    "Corticoides (efecto intenso, especialmente postprandial)",
    "Tiazidas a dosis altas",
    "Betabloqueantes (enmascaran hipoglucemia y pueden ↑ glucemia)",
    "Antipsicóticos atípicos (olanzapina, clozapina, quetiapina)",
    "Anticonceptivos orales con estrógenos",
    "Inhibidores de proteasa (antirretrovirales)",
    "Tacrolimus / ciclosporina",
  ]},
  { grupo: "Fármacos que ↓ glucemia (hipoglucemiantes)", color: "#16a34a", items: [
    "AINEs (potencian sulfonilureas)",
    "Alcohol (inhibe gluconeogénesis + enmascara síntomas)",
    "Fluconazol (inhibe metabolismo de sulfonilureas)",
    "Fibratos (potencian efecto hipoglucemiante)",
    "IECAs / ARA II (mejoran sensibilidad insulínica)",
    "Claritromicina (inhibe CYP3A4 → ↑ niveles repaglinida)",
  ]},
  { grupo: "Contraindicaciones absolutas clave", color: "#9333ea", items: [
    "Metformina + FG <30 ml/min → CONTRAINDICADA",
    "Metformina + contraste yodado IV → suspender 48h antes si FG <60",
    "iSGLT2 + FG <45 ml/min → suspender (sin eficacia y riesgo)",
    "Pioglitazona + insuficiencia cardíaca → CONTRAINDICADA",
    "Pioglitazona + cáncer de vejiga activo → CONTRAINDICADA",
    "Glibenclamida + adulto mayor o IR → CONTRAINDICADA (PAI)",
    "Saxagliptina/alogliptina + IC descompensada → evitar",
    "aRGLP-1 + pancreatitis activa → CONTRAINDICADA",
    "aRGLP-1 + carcinoma medular tiroides (antecedentes) → CONTRAINDICADA",
  ]},
];

// ─── PAI CLINICAL DATA ────────────────────────────────────────────────────────
const DATA = {
  prevencion: {
    titulo: "Prevención de la DMT2",
    descripcion: "Identificación y manejo de personas en riesgo de desarrollar diabetes tipo 2.",
    medico: [
      { titulo: "Identificar personas en riesgo (Prediabetes)", badge: "AG", items: [
        "GBA: glucemia en ayunas 100–125 mg/dl",
        "TAG: glucemia 140–199 mg/dl a las 2h de SOG con 75g",
        "HbA1c entre 5,7% y 6,4%",
      ]},
      { titulo: "Otros factores de riesgo", badge: "AG", items: [
        "Antecedentes familiares DMT2 en 1er grado",
        "Sobrepeso/Obesidad (IMC ≥ 25 kg/m²)",
        "HTA (PA ≥ 140/90 mmHg o tratamiento antihipertensivo)",
        "Dislipemia (CT > 250, HDL < 35 o TG > 250 mg/dl)",
        "DMG previa o patología obstétrica relacionada",
      ]},
      { titulo: "Programa de estilos de vida saludables", badge: "A NICE", highlight: true, items: [
        "Reducción calórica si exceso de peso (objetivo: pérdida ≥ 5%)",
        "Actividad física aeróbica moderada (50–70% FCM): ≥ 150 min/semana",
        "Seguimiento presencial y virtual (Salud Responde)",
      ]},
      { titulo: "⛔ NO HACER", badge: "NICE", tipo: "noHacer", items: [
        "No se recomienda el uso de fármacos en la prevención de la DMT2 en personas con prediabetes",
      ]},
    ],
    enfermera: [
      { titulo: "Valoración inicial en persona de riesgo", badge: "AG", items: [
        "Anamnesis: antecedentes familiares/personales, FRV, fármacos",
        "Exploración física: IMC, perímetro abdominal, PA",
        "Valoración hábitos tóxicos",
        "Cuestionario dieta mediterránea (Anexo 3)",
        "Cuestionario IPAQ de actividad física (Anexo 2)",
        "Valoración motivacional para modificar estilos de vida",
      ]},
      { titulo: "Consejo antitabaco si procede", badge: "AG", items: [
        "Seguir PAI Atención a Personas Fumadoras",
        "Recursos: Teléfono gratuito Tabaquismo y Salud Responde",
      ]},
      { titulo: "Mujeres con DMG previa", badge: "AG", items: [
        "Informar sobre riesgo de DMG en futuros embarazos",
        "Ofrecer despistaje de DM cuando planeen futuros embarazos",
      ]},
    ],
  },
  cribado: {
    titulo: "Cribado de la Diabetes",
    descripcion: "Detección oportunista de DMT2 y cribado de diabetes gestacional.",
    medico: [
      { titulo: "Cribado oportunista DMT2", badge: "AG", highlight: true, items: [
        "Glucemia en plasma venoso tras 8h de ayuno",
        "ANUALMENTE a cualquier edad: prediabetes u otros FRV",
        "CADA 3 AÑOS a partir de 45 años: contexto programa prevención cardiovascular (PAI Riesgo Vascular)",
      ]},
      { titulo: "⛔ NO HACER", badge: "NICE", tipo: "noHacer", items: [
        "La glucemia capilar y la HbA1c capilar NO se recomiendan como pruebas de cribado",
      ]},
    ],
    enfermera: [
      { titulo: "Cribado diabetes gestacional — Test de O'Sullivan", badge: "AG", items: [
        "Sin necesidad de ayuno",
        "1er trimestre: mujeres con FRV de DMG (IMC ≥30, macrosomía previa, DMG anterior, DM familiar) o GBA/TAG",
        "2º trimestre (sem 24–28): todas las gestantes como cribado universal",
        "Negativo: < 140 mg/dl | Positivo (≥ 140 mg/dl): realizar SOG con 100g",
      ]},
    ],
  },
  diagnostico: {
    titulo: "Diagnóstico y Clasificación",
    descripcion: "Criterios diagnósticos de diabetes y clasificación del tipo.",
    medico: [
      { titulo: "Criterios diagnósticos de DM", badge: "AG", highlight: true, items: [
        "Glucemia basal ≥ 126 mg/dl (7.0 mmol/l)",
        "Glucemia tras SOG ≥ 200 mg/dl (11.1 mmol/l)",
        "HbA1c ≥ 6,5% (laboratorio certificado NGSP/DCCT)",
        "Glucemia al azar ≥ 200 mg/dl + síntomas clásicos (poliuria, polidipsia, pérdida de peso)",
        "⚠️ Repetir prueba para confirmar diagnóstico (excepto en el 4º supuesto)",
      ]},
      { titulo: "Clasificación como DMT2 (> 30 años)", badge: "AG", items: [
        "Aparición insidiosa · Antecedentes familiares DMT2",
        "Antecedentes DMG · Sobrepeso u obesidad",
        "Ausencia de cetonemia y cetonuria",
      ]},
      { titulo: "⚠️ Sospecha de DMT1 — Derivar a AH", badge: "AG", tipo: "alerta", items: [
        "Derivar a AH para confirmación diagnóstica y plan terapéutico",
        "Dispositivo según situación clínica (urgencias, HDD o consultas externas)",
        "Preferible régimen Hospital de Día de Diabetes (HDD)",
      ]},
      { titulo: "Valoración al diagnóstico", badge: "AG", items: [
        "Medicación habitual e interacciones (fármacos hiperglucemiantes) ⚠️",
        "Hábitos: alimentación, ejercicio, nivel de conocimientos",
        "Peso, talla, PA · Analítica: HbA1c, creatinina, lípidos, orina, EUA",
      ]},
      { titulo: "⛔ NO HACER", badge: "NICE", tipo: "noHacer", items: [
        "Glucemia capilar y HbA1c capilar NO son pruebas diagnósticas de DM ni de DMG",
      ]},
    ],
    enfermera: [
      { titulo: "Diagnóstico de DMG", badge: "AG", items: [
        "Con SOG 100g: ≥ 2 valores superados (basal: 105 / 1h: 190 / 2h: 165 / 3h: 145 mg/dl)",
        "Sin SOG: glucemia basal ≥ 126 mg/dl (2 veces) o glucemia ocasional ≥ 200 mg/dl",
      ]},
      { titulo: "Información al paciente y familia", badge: "AG", items: [
        "Informar sobre diagnóstico y tipo de diabetes",
        "Explicar necesidad de seguimiento periódico · Recursos: Salud Responde",
      ]},
    ],
  },
  complicaciones: {
    titulo: "Cribado y Diagnóstico de Complicaciones Crónicas",
    descripcion: "Detección precoz de nefropatía, pie diabético, retinopatía y enfermedad vascular.",
    medico: [
      { titulo: "Inicio del cribado de complicaciones", badge: "AG", highlight: true, items: [
        "DMT2: en el momento del diagnóstico",
        "DMT1 — ERC: a partir de 5 años de evolución",
        "DMT1 — Pie: a partir de 30 años o > 10 años de evolución",
        "DMT1 — RD: a partir de 5 años de evolución",
      ]},
      { titulo: "🩺 ERC — Cribado ANUAL", badge: "B", items: [
        "FG: fórmula CKD-EPI (o MDRD / Cockcroft-Gault)",
        "EUA: cociente albúmina/creatinina en muestra simple ≥ 30 mg/g",
        "Confirmar en ≥ 2 de 3 determinaciones en 3–6 meses",
        "ERC si FG < 60 ml/min/1.73m² mantenido ≥ 3 meses",
      ]},
      { titulo: "🦶 Pie Diabético — Cribado", badge: "AG", items: [
        "Monofilamento Semmes-Weinstein 10g: 1er dedo, base 1er y 5º metatarsiano",
        "Diapasón 128 Hz: cabeza 1er metatarsiano y maléolo tibial",
        "Valoración EAP: anamnesis + palpación pulsos + ITB si precisa",
      ]},
      { titulo: "🦶 Categorización riesgo de pie", badge: "AG", items: [
        "ALTO: úlcera/amputación previa, isquemia (ITB <0.9 o >1.3), neuropatía → cada 1–3 meses",
        "MODERADO: tabaquismo, limitaciones autocuidado, alteraciones pie → semestral",
        "BAJO: ninguno de los anteriores → anual",
      ]},
      { titulo: "👁️ Retinopatía Diabética — Retinografía digital", badge: "AG", items: [
        "Con midriasis (tropicamida), excepto glaucoma agudo o pilocarpina",
        "Valoración en primer nivel en < 1 mes",
        "Normal → anual (> 10 años DM) o trienal (< 10 años sin FRV adicionales)",
        "Cualquier grado de RD → derivar a oftalmología",
      ]},
      { titulo: "❤️ EVA — Detección y estratificación", badge: "AG", items: [
        "Anamnesis: EVA coronaria, cerebrovascular o periférica previa",
        "Antecedentes familiares EVA precoz (varones < 55a, mujeres < 65a)",
        "FRV: tabaquismo, HTA, dislipemia, obesidad",
        "Prevención Secundaria si hay EVA previa documentada",
        "🧮 Calcular RV con REGICOR en prevención primaria, al menos cada 3 años (35–75 años)",
      ]},
    ],
    enfermera: [
      { titulo: "ET en pie de alto riesgo", badge: "NICE", items: [
        "NIC 5603: Enseñanza cuidados de los pies (individual)",
        "NOC 1902: Control del riesgo",
        "Derivar a podólogo si callo/uña encarnada o riesgo moderado",
        "Derivar a cirujano vascular si isquemia",
      ]},
    ],
  },
  plan: {
    titulo: "Plan Terapéutico",
    descripcion: "Tratamiento individualizado: ET, farmacología y control de FRV.",
    medico: [
      { titulo: "Objetivo de control metabólico", badge: "A NICE", highlight: true, items: [
        "HbA1c < 7% para la mayoría de adultos",
        "HbA1c < 6,5% en pacientes seleccionados (estadios iniciales, larga expectativa, bajo RV) sin hipoglucemias",
        "Menos estricto: edad avanzada, comorbilidad, hipoglucemias graves previas",
        "Control FRV: tabaquismo, obesidad, HTA, dislipemia",
      ]},
      { titulo: "Tratamiento inicial — Metformina", badge: "NICE Fuerte", highlight: true, items: [
        "Si estilos de vida insuficientes tras 3–6 meses → iniciar metformina",
        "Dosis bajas: 425–500 mg/día con escalado progresivo",
        "Ajustar si FG < 45 ml/min; retirar si FG < 30 ml/min",
      ]},
      { titulo: "1ª Intensificación (si monoterapia insuficiente en 3–6 meses)", badge: "NICE", items: [
        "Añadir: iDPP4 / iSGLT2 / Pioglitazona / Repaglinida / Sulfonilurea (gliclazida o glimepiride)",
        "Elegir según: riesgo hipoglucemia, peso, EVA previa, comorbilidades, coste",
      ]},
      { titulo: "2ª Intensificación / Insulinoterapia", badge: "NICE", items: [
        "Triple terapia o insulina si doble terapia oral insuficiente",
        "aRGLP-1 en IMC ≥ 30 + intervención dietética intensiva",
        "Continuar aRGLP-1 solo si HbA1c ↓ ≥ 1% y peso ↓ ≥ 3% en 6 meses",
        "Insulina basal inicial (NPH o análogo lento) · añadir rápida si basal insuficiente",
      ]},
      { titulo: "⛔ NO HACER", badge: "NICE", tipo: "noHacer", items: [
        "No usar glibenclamida",
        "No recomendar AGC de rutina en DMT2 estable sin insulina ni secretagogos",
        "No usar doble bloqueo IECA + ARA II para HTA",
      ]},
      { titulo: "HTA — Tratamiento", badge: "NICE", items: [
        "Objetivo PA: < 140/90 mmHg (< 130/80 con ERC, retinopatía o ictus previo)",
        "1ª elección: IECA (o ARA II si intolerancia)",
        "Si insuficiente: añadir diurético tiazídico + antagonista del calcio",
      ]},
      { titulo: "Hipolipemiantes", badge: "AG", items: [
        "1ª elección: estatinas",
        "Intensidad moderada (simvastatina 20–40 mg): prevención secundaria salvo post-SCA, RV alto",
        "Intensidad alta (atorvastatina 80 mg): post-SCA",
      ]},
      { titulo: "Antiagregación", badge: "NICE Fuerte", items: [
        "AAS 75–150 mg/día: prevención secundaria (obligatoria)",
        "Alternativa: clopidogrel 75 mg/día",
        "Prevención primaria: valorar en varones > 50a o mujeres > 60a con RV muy alto",
      ]},
      { titulo: "Vacunaciones", badge: "AG", items: [
        "Antigripal ANUAL",
        "Antineumocócica (pauta adaptada a edad)",
      ]},
    ],
    enfermera: [
      { titulo: "Educación Terapéutica estructurada", badge: "AG", highlight: true, items: [
        "NOC 1820: Conocimiento control de la diabetes",
        "NIC 5602: Enseñanza proceso de la enfermedad",
        "NIC 5616: Enseñanza medicamentos prescritos",
        "NIC 5614: Enseñanza dieta prescrita",
        "NIC 5612: Enseñanza actividad/ejercicio prescrito",
        "NIC 2130: Manejo de la hipoglucemia",
        "NIC 2120: Manejo de la hiperglucemia",
        "NIC 5603: Enseñanza cuidados de los pies",
      ]},
      { titulo: "Autoanálisis glucemia capilar (AGC)", badge: "NICE AG", items: [
        "DMT2 sin insulina/secretagogos estable: NO de rutina",
        "TNI sin riesgo hipoglucemia: máx. 7/semana como herramienta educativa",
        "Con secretagogos (SU/meglitinidas): 1–3/semana estable",
        "Insulina basal: 1/día · bifásica: 2/día · basal-bolo: 3–4/día",
        "Situaciones especiales: infanto-juvenil, ISCI, DMG, trabajos de riesgo",
      ]},
    ],
  },
  seguimiento: {
    titulo: "Seguimiento y Recaptación",
    descripcion: "Periodicidad, contenidos mínimos y criterios de derivación.",
    medico: [
      { titulo: "Revisión inicial tras plan terapéutico", badge: "AG", highlight: true, items: [
        "Con medidas no farmacológicas: revisión en 2–3 meses",
        "Con TNI: revisión en 1 semana",
        "Con insulina: revisión en 1–3 días",
        "Revaloración clínica y analítica a los 3 meses mínimo",
      ]},
      { titulo: "Seguimiento periódico (mínimo semestral)", badge: "AG", items: [
        "DMT1: consultas externas AH (Endocrinología/Medicina Interna/Pediatría)",
        "DMT2: en Atención Primaria",
      ]},
      { titulo: "Contenidos mínimos del seguimiento", badge: "AG", items: [
        "Intervención antitabaco si procede",
        "Control ponderal (IMC) en cada visita si sobrepeso/obesidad",
        "HbA1c SEMESTRAL",
        "Valoración FRV y estimación RV ANUALES",
        "PA en cada visita si HTA · EUA y FG ANUALES",
        "Exploración de pies según riesgo · Retinografía según circuito",
      ]},
      { titulo: "⚠️ Criterios de derivación AP → AH", badge: "AG", tipo: "alerta", items: [
        "Pie diabético de evolución tórpida",
        "Inestabilidad metabólica · Gestación · Diabetes no filiada",
        "Mal control crónico a pesar de insulinización (HbA1c > 9%)",
        "Hipoglucemias inadvertidas, frecuentes o graves",
      ]},
      { titulo: "💉 Hipoglucemia — Manejo", badge: "E AG", items: [
        "Consciente y puede ingerir: 15–20g glucosa oral, repetir a los 15 min si persiste",
        "Inconsciente o no puede ingerir: glucosado IV o glucagón IM/SC",
        "Persistente: derivar a urgencias hospitalarias",
        "Prescribir glucagón a pacientes con insulina o riesgo de hipoglucemia grave",
      ]},
    ],
    enfermera: [
      { titulo: "Evaluación educativa", badge: "AG", items: [
        "Evaluación de ET anual y siempre que surjan complicaciones o cambios de tratamiento",
        "NOC 1619: Autocontrol de la diabetes",
        "Reevaluar conocimientos y habilidades en autocontrol",
      ]},
      { titulo: "Gestora de Casos (EGC) — Indicaciones", badge: "AG", items: [
        "Perfil de reingresos frecuentes relacionados con diabetes",
        "Alta complejidad que comprometa adherencia",
        "Pérdida de autonomía por limitación funcional grave",
        "Menores de 8 años o no autónomos en centros educativos",
      ]},
    ],
  },
};

// ─── REGICOR ──────────────────────────────────────────────────────────────────
function calcularREGICOR({ sexo, edad, colTotal, colHDL, pas, tabaco, diabetes }) {
  const lnE = Math.log(edad), lnC = Math.log(colTotal),
        lnH = Math.log(colHDL), lnP = Math.log(pas),
        t = tabaco ? 1 : 0, d = diabetes ? 1 : 0;
  let s, b, m;
  if (sexo === "H") { s = 3.06117*lnE+1.12370*lnC-0.93263*lnH+1.99881*lnP+0.65451*t+0.57367*d; b=0.88936; m=23.9802; }
  else              { s = 2.32888*lnE+1.20904*lnC-0.70833*lnH+2.76157*lnP+0.52873*t+0.69154*d; b=0.94833; m=26.1931; }
  return Math.max(0.1, Math.min((1-Math.pow(b, Math.exp(s-m)))*100, 99.9));
}
function clsRiesgo(r) {
  if (r<5)  return { nivel:"MUY BAJO", color:"#16a34a", bg:"#f0fdf4", border:"#86efac", emoji:"🟢" };
  if (r<10) return { nivel:"BAJO",     color:"#65a30d", bg:"#f7fee7", border:"#bef264", emoji:"🟡" };
  if (r<15) return { nivel:"MODERADO", color:"#d97706", bg:"#fffbeb", border:"#fcd34d", emoji:"🟠" };
  return     { nivel:"ALTO",    color:"#dc2626", bg:"#fef2f2", border:"#fca5a5", emoji:"🔴" };
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Tarjeta({ item, id, expandido, toggle }) {
  const open = expandido[id]||false;
  const nh = item.tipo==="noHacer", al = item.tipo==="alerta";
  const b = BC[item.badge]||BC["AG"];
  return (
    <div style={{ background: nh?"#fff5f5":al?"#fffbeb":item.highlight?"#f0f9ff":"#fff", border:`1.5px solid ${nh?"#fecaca":al?"#fde68a":item.highlight?"#bae6fd":"#e5e7eb"}`, borderRadius:12, marginBottom:10, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
      <button onClick={()=>toggle(id)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:"transparent", border:"none", cursor:"pointer", textAlign:"left", gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, minWidth:0 }}>
          <span style={{ fontSize:11, fontWeight:700, background:b.bg, color:b.text, border:`1px solid ${b.border}`, borderRadius:6, padding:"2px 7px", whiteSpace:"nowrap", flexShrink:0 }}>{item.badge}</span>
          <span style={{ fontSize:13, fontWeight:600, lineHeight:1.3, color:nh?"#b91c1c":al?"#92400e":"#1e293b" }}>{item.titulo}</span>
        </div>
        <span style={{ fontSize:16, color:"#94a3b8", flexShrink:0, transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▾</span>
      </button>
      {open && (
        <div style={{ padding:"4px 14px 14px" }}>
          {item.items.map((it,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"5px 0", borderTop:i>0?"1px solid #f1f5f9":"none" }}>
              <span style={{ color:nh?"#ef4444":"#0ea5e9", fontSize:12, marginTop:3, flexShrink:0 }}>{nh?"✕":"▸"}</span>
              <span style={{ fontSize:13, color:"#374151", lineHeight:1.5 }}>{it}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SliderInput({ label, campo, min, max, step=1, value, onChange, color="#0891b2" }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:12, fontWeight:600, color:"#374151", marginBottom:5 }}>{label}: <strong style={{ color }}>{value}</strong></div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))} style={{ flex:1, accentColor:color }} />
        <span style={{ minWidth:50, textAlign:"center", fontSize:13, fontWeight:700, color:"#0f172a", background:"#f1f5f9", borderRadius:7, padding:"4px 6px", border:"1px solid #e2e8f0" }}>{value}</span>
      </div>
    </div>
  );
}

function ToggleBtn({ valor, opA, labelA, opB, labelB, onChange, color="#3b82f6" }) {
  return (
    <div style={{ display:"flex", gap:8 }}>
      {[[opA,labelA],[opB,labelB]].map(([v,l])=>(
        <button key={String(v)} onClick={()=>onChange(v)} style={{ padding:"7px 16px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", border:`1.5px solid ${valor===v?color:"#e2e8f0"}`, background:valor===v?`${color}18`:"#f8fafc", color:valor===v?color:"#6b7280", transition:"all 0.15s" }}>{l}</button>
      ))}
    </div>
  );
}

// ─── MFG/MCG DATA (Resolución SAS 2018+2022, BOJA) ───────────────────────────
const MFG_DATA = {
  mfg_dm1: {
    titulo: "Sistema Flash (MFG) — DMT1",
    color: "#0891b2",
    indicaciones: [
      "DMT1 con edad ≥ 4 años (pediátrico hasta 17 años, mantenido de forma indefinida al superar los 18 años)",
      "Control glucémico no óptimo: HbA1c persistente > 8%",
      "Hipoglucemias graves de repetición: > 2 episodios en los últimos 2 años",
      "Hipoglucemias no graves de repetición: > 4 episodios leves/semana o >10% del tiempo",
      "Hipoglucemias inadvertidas confirmadas",
      "Mujeres con control metabólico no óptimo antes o durante la gestación (HbA1c > 6,5%)",
    ],
    requisitos: [
      "Supervisión por cuidador mayor de 18 años si el paciente es menor o no tiene autonomía",
      "Nivel adecuado de educación diabetológica (paciente o cuidadores)",
      "Buena adherencia a las recomendaciones del equipo sanitario",
      "Cumplimiento de visitas de seguimiento programadas",
      "Situación clínica estable a criterio del equipo sanitario",
    ],
    notas: "Resolución SAS 17/04/2018 (BOJA nº78). Los datos del sensor se integran en la Historia Clínica Digital del SSPA (LibreView → HSAP/Diraya).",
  },
  mfg_dm2: {
    titulo: "Sistema Flash (MFG) — DMT2",
    color: "#059669",
    indicaciones: [
      "DMT2 con pauta intensiva de insulina: régimen bolo-basal (insulina lenta o análogo lento + rápida)",
      "Necesidad de realizar 6 o más autocontroles de glucemia capilar al día",
      "Discapacidad funcional o dependencia que dificulte los autocontroles capilares",
      "Hipoglucemias frecuentes no graves de repetición",
      "Formas de diabetes insulinopénicas distintas a DMT1 (desde enero 2021)",
    ],
    requisitos: [
      "Supervisión por cuidador mayor de 18 años si el paciente es menor o no tiene autonomía",
      "Nivel adecuado de educación diabetológica",
      "Buena adherencia a las recomendaciones del equipo sanitario",
      "Programa educativo estructurado en la primera implantación del sensor",
    ],
    notas: "Resolución SAS 01/04/2022 (BOJA nº75). Implantación en todos los Centros de Salud de AP del SSPA. Financiado por el SAS — FreeStyle Libre® (Abbott). Sensor en parte posterior del brazo, reemplazable cada 14 días.",
  },
  mcg: {
    titulo: "Monitorización Continua (MCG) — Sistema integrado con bomba ISCI",
    color: "#7c3aed",
    indicaciones: [
      "Portadores de ISCI (bomba de insulina) con control glucémico no óptimo (HbA1c > 8% persistente)",
      "Hipoglucemias graves de repetición (> 2 episodios en 2 últimos años) pese a terapia ISCI",
      "Hipoglucemias no graves de repetición (> 4 leves/semana o > 10% del tiempo) pese a terapia ISCI",
      "Hipoglucemias inadvertidas confirmadas (test de Clarke ≥ 4 en adultos)",
      "Mujeres con HbA1c > 6,5% antes o durante la gestación pese a ISCI",
    ],
    requisitos: [
      "Centro autorizado para terapia ISCI en el SSPA",
      "Equipo especializado en endocrinología o pediatría con experiencia en diabetes",
      "Programa educativo estructurado específico para sistema integrado",
      "Uso del sensor al menos el 70% del tiempo",
      "La terapia sólo se mantiene si se objetiva efectividad",
    ],
    notas: "El sistema MCG incorpora la función de suspensión automática por hipoglucemia. Los centros autorizados para MCG son UGCs de Endocrinología y Pediatría de hospitales del SSPA designados. Centros en Málaga: Hospital Virgen de la Victoria y Hospital Regional de Málaga.",
  },
};

// ─── MÓDULO INSULINAS ─────────────────────────────────────────────────────────
function ModuloInsulinas() {
  const [tab, setTab] = useState("tipos");
  const [glucemia, setGlucemia] = useState(220);
  const [objetivo, setObjetivo] = useState(120);
  const [dosis, setDosis] = useState(40);
  const [raciones, setRaciones] = useState(4);
  const [exp, setExp] = useState({});
  const toggle = k => setExp(p=>({...p,[k]:!p[k]}));
  const fs = Math.round(1800/dosis);
  const dc = Math.round((glucemia-objetivo)/fs);
  const ratio = (450/dosis).toFixed(1);
  const insulComida = Math.round(raciones/Number(ratio));
  const subtabs = [{ id:"tipos",label:"Tipos" },{ id:"correctora",label:"Dosis correctora" },{ id:"ratio",label:"Ratio IC" },{ id:"mfg",label:"MFG / MCG" },{ id:"ajuste",label:"Ajustes" }];
  return (
    <div>
      <div style={{ background:"linear-gradient(135deg,#ecfeff,#cffafe)", border:"1.5px solid #a5f3fc", borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
        <div style={{ fontSize:16, fontWeight:800, color:"#0f172a" }}>💉 Insulinas</div>
        <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>Tipos, perfiles de acción, calculadoras de dosis y ajustes clínicos</div>
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:14, overflowX:"auto", paddingBottom:2 }}>
        {subtabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:600, border:`1.5px solid ${tab===t.id?"#0891b2":"#e2e8f0"}`, background:tab===t.id?"#ecfeff":"#f8fafc", color:tab===t.id?"#0891b2":"#6b7280", cursor:"pointer", whiteSpace:"nowrap" }}>{t.label}</button>
        ))}
      </div>

      {tab==="tipos" && (
        <div>
          {INSULINAS_TIPOS.map((cat,ci)=>(
            <div key={ci} style={{ marginBottom:14 }}>
              <div style={{ padding:"6px 10px", borderRadius:8, marginBottom:8, background:`${cat.color}15`, border:`1px solid ${cat.color}40`, fontSize:12, fontWeight:700, color:cat.color }}>{cat.categoria}</div>
              {cat.items.map((ins,ii)=>{
                const k=`ins-${ci}-${ii}`, open=exp[k];
                return (
                  <div key={ii} style={{ background:"white", border:"1.5px solid #e5e7eb", borderRadius:10, marginBottom:8, overflow:"hidden" }}>
                    <button onClick={()=>toggle(k)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px", background:"transparent", border:"none", cursor:"pointer", textAlign:"left" }}>
                      <span style={{ fontSize:13, fontWeight:600, color:"#1e293b" }}>{ins.nombre}</span>
                      <span style={{ fontSize:15, color:"#94a3b8", transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▾</span>
                    </button>
                    {open && (
                      <div style={{ padding:"0 12px 12px", borderTop:"1px solid #f1f5f9" }}>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, margin:"10px 0" }}>
                          {[["⚡ Inicio",ins.inicio],["📈 Pico",ins.pico],["⏱️ Duración",ins.duracion]].map(([l,v])=>(
                            <div key={l} style={{ background:"#f8fafc", borderRadius:8, padding:8, textAlign:"center", border:"1px solid #e2e8f0" }}>
                              <div style={{ fontSize:10, color:"#64748b", marginBottom:2 }}>{l}</div>
                              <div style={{ fontSize:12, fontWeight:700, color:"#0f172a" }}>{v}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ fontSize:12, color:"#374151", lineHeight:1.5, padding:8, background:"#f0f9ff", borderRadius:8, border:"1px solid #bae6fd" }}>💡 {ins.notas}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {tab==="correctora" && (
        <div>
          <div style={{ background:"white", border:"1.5px solid #e5e7eb", borderRadius:12, padding:14, marginBottom:12 }}>
            <SliderInput label="💉 Dosis total diaria (UI/día)" campo="dosis" min={10} max={120} step={2} value={dosis} onChange={setDosis} color="#0891b2" />
            <SliderInput label="🩸 Glucemia actual (mg/dl)" campo="glucemia" min={80} max={400} step={5} value={glucemia} onChange={setGlucemia} color="#ef4444" />
            <SliderInput label="🎯 Glucemia objetivo (mg/dl)" campo="objetivo" min={80} max={180} step={5} value={objetivo} onChange={setObjetivo} color="#16a34a" />
          </div>
          <div style={{ display:"grid", gap:10, marginBottom:12 }}>
            {[{ label:"Regla 1800 (análogo rápido / insulina regular)", color:"#0891b2" }].map(({ label, color })=>(
              <div key={label} style={{ background:`${color}10`, border:`1.5px solid ${color}30`, borderRadius:12, padding:14 }}>
                <div style={{ fontSize:12, fontWeight:700, color, marginBottom:8 }}>{label}</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:11, color:"#64748b" }}>Factor sensibilidad (1800 ÷ DTD)</div>
                    <div style={{ fontSize:22, fontWeight:900, color }}>{fs} mg/dl/UI</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:11, color:"#64748b" }}>Dosis correctora</div>
                    <div style={{ fontSize:28, fontWeight:900, color:dc>0?color:"#94a3b8" }}>{dc>0?`+${dc}`:dc} UI</div>
                  </div>
                </div>
                <div style={{ fontSize:11, color:"#64748b", background:"white", borderRadius:8, padding:"6px 8px" }}>
                  ({glucemia} - {objetivo}) ÷ {fs} = <strong>{dc} UI</strong>
                  {dc<=0 && <span style={{ color:"#16a34a" }}> ✓ Sin corrección necesaria</span>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:"white", border:"1.5px solid #e5e7eb", borderRadius:12, padding:14 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#0f172a", marginBottom:10 }}>Tabla orientativa por rangos (factor sensibilidad: {fs} mg/dl/UI)</div>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead><tr style={{ background:"#f1f5f9" }}>
                <th style={{ padding:"7px 10px", textAlign:"left" }}>Glucemia (mg/dl)</th>
                <th style={{ padding:"7px 10px", textAlign:"center" }}>Corrección</th>
                <th style={{ padding:"7px 10px", textAlign:"left" }}>Acción</th>
              </tr></thead>
              <tbody>
                {[[objetivo,objetivo+fs,"0–1","Vigilar","#6b7280"],[objetivo+fs,objetivo+2*fs,"1–2","Corregir","#d97706"],[objetivo+2*fs,objetivo+3*fs,"2–3","Corregir + valorar causa","#ea580c"],[objetivo+3*fs,999,">3","⚠️ Valorar cetonas","#dc2626"]].map(([min,max,corr,acc,col],i)=>(
                  <tr key={i} style={{ background:i%2===0?"#fafafa":"white" }}>
                    <td style={{ padding:"6px 10px", color:"#374151" }}>{min}–{max===999?"↑":max}</td>
                    <td style={{ padding:"6px 10px", textAlign:"center", fontWeight:700, color:col }}>{corr}</td>
                    <td style={{ padding:"6px 10px", color:col, fontWeight:600 }}>{acc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="ratio" && (
        <div>
          <div style={{ background:"white", border:"1.5px solid #e5e7eb", borderRadius:12, padding:14, marginBottom:12 }}>
            <SliderInput label="💉 Dosis total diaria (UI/día)" campo="dosis" min={10} max={120} step={2} value={dosis} onChange={setDosis} color="#0891b2" />
            <SliderInput label="🍞 Raciones de HC en esta comida" campo="raciones" min={1} max={15} step={0.5} value={raciones} onChange={setRaciones} color="#f59e0b" />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            <div style={{ background:"#ecfeff", border:"1.5px solid #a5f3fc", borderRadius:12, padding:14, textAlign:"center" }}>
              <div style={{ fontSize:11, color:"#0891b2", fontWeight:700, marginBottom:4 }}>RATIO IC (Regla 450)</div>
              <div style={{ fontSize:28, fontWeight:900, color:"#0891b2" }}>1:{ratio}</div>
              <div style={{ fontSize:11, color:"#64748b", marginTop:4 }}>1 UI cubre {ratio} raciones HC</div>
            </div>
            <div style={{ background:"#f0fdf4", border:"1.5px solid #86efac", borderRadius:12, padding:14, textAlign:"center" }}>
              <div style={{ fontSize:11, color:"#16a34a", fontWeight:700, marginBottom:4 }}>INSULINA PRANDIAL</div>
              <div style={{ fontSize:28, fontWeight:900, color:"#16a34a" }}>{insulComida} UI</div>
              <div style={{ fontSize:11, color:"#64748b", marginTop:4 }}>{raciones} rac ÷ {ratio} (sin corrección)</div>
            </div>
          </div>
          <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:10, padding:12 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#9a3412", marginBottom:6 }}>📌 Recordatorio clínico</div>
            {[
              "El ratio IC es orientativo: ajustar individualmente según glucemias postprandiales",
              "Regla 450: para análogos de insulina rápida (lispro, aspart, glulisina) — más precisa para la mayoría",
              "Regla 500: alternativa para insulina regular humana o si ratio 450 resulta demasiado agresivo",
              "Para DMT2 iniciando insulina: comenzar con ratio conservador y ajustar semanalmente",
              "Añadir dosis correctora si glucemia preprandial fuera de objetivo",
              "En DMT1: contaje de raciones es fundamental (NIC 5614 del PAI)",
            ].map((t,i)=>(
              <div key={i} style={{ fontSize:12, color:"#92400e", display:"flex", gap:6, marginBottom:3 }}><span>▸</span><span>{t}</span></div>
            ))}
          </div>
        </div>
      )}

      {tab==="mfg" && (
        <div>
          <div style={{ background:"linear-gradient(135deg,#f0f9ff,#e0f2fe)", border:"1.5px solid #7dd3fc", borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:800, color:"#0f172a" }}>📡 Monitorización Flash (MFG) y Continua (MCG)</div>
            <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>Criterios de indicación y requisitos — Cartera de Servicios SSPA</div>
            <div style={{ fontSize:11, color:"#0369a1", marginTop:4, background:"#e0f2fe", borderRadius:6, padding:"3px 8px", display:"inline-block" }}>
              Resoluciones SAS 2018 · 2022 · BOJA · Ampliado a todos los Centros de Salud de AP
            </div>
          </div>

          {Object.values(MFG_DATA).map((sec, si) => {
            const k = `mfg-${si}`, open = exp[k];
            return (
              <div key={si} style={{ background:"white", border:`1.5px solid ${sec.color}30`, borderRadius:12, marginBottom:12, overflow:"hidden" }}>
                <button onClick={()=>toggle(k)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:`${sec.color}10`, border:"none", cursor:"pointer", textAlign:"left" }}>
                  <span style={{ fontSize:13, fontWeight:700, color:sec.color }}>{sec.titulo}</span>
                  <span style={{ fontSize:16, color:"#94a3b8", transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▾</span>
                </button>
                {open && (
                  <div style={{ padding:"12px 14px 14px" }}>
                    <div style={{ marginBottom:10 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:sec.color, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>✅ Indicaciones</div>
                      {sec.indicaciones.map((it,j)=>(
                        <div key={j} style={{ display:"flex", gap:8, padding:"4px 0", borderTop:j>0?"1px solid #f1f5f9":"none" }}>
                          <span style={{ color:sec.color, fontSize:12, marginTop:3, flexShrink:0 }}>▸</span>
                          <span style={{ fontSize:13, color:"#374151", lineHeight:1.5 }}>{it}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginBottom:10, padding:"10px 12px", background:"#fffbeb", borderRadius:10, border:"1px solid #fde68a" }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"#92400e", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>⚠️ Requisitos indispensables</div>
                      {sec.requisitos.map((it,j)=>(
                        <div key={j} style={{ display:"flex", gap:8, padding:"3px 0" }}>
                          <span style={{ color:"#d97706", fontSize:12, marginTop:3, flexShrink:0 }}>▸</span>
                          <span style={{ fontSize:12, color:"#92400e", lineHeight:1.5 }}>{it}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize:11, color:"#64748b", background:"#f8fafc", borderRadius:8, padding:"8px 10px", border:"1px solid #e2e8f0", lineHeight:1.6 }}>
                      📋 {sec.notas}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:10, padding:12, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#166534", marginBottom:6 }}>💡 Integración en Historia Clínica Digital (HSAP/Diraya)</div>
            {[
              "El SAS es pionero en España en integrar los datos de MFG en la Historia Clínica Digital",
              "Los pacientes autorizados pueden vincular su sensor FreeStyle Libre® con el sistema 'Freestyle' del SAS",
              "Los profesionales sanitarios acceden a las mediciones desde cualquier ámbito asistencial (AP y AH)",
              "Aplicación FreeStyle LibreView: plataforma para análisis de datos de glucosa por profesional y paciente",
              "FreeStyle LibreLinkUp: seguimiento remoto por cuidadores (útil en edad pediátrica)",
            ].map((it,i)=>(
              <div key={i} style={{ fontSize:12, color:"#166534", display:"flex", gap:6, marginBottom:3 }}>
                <span>▸</span><span>{it}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="ajuste" && (
        <div>
          {AJUSTE_INSULINA.map((sec,i)=>{
            const k=`aj-${i}`, open=exp[k];
            return (
              <div key={i} style={{ background:"white", border:`1.5px solid ${sec.color}30`, borderRadius:12, marginBottom:10, overflow:"hidden" }}>
                <button onClick={()=>toggle(k)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:`${sec.color}08`, border:"none", cursor:"pointer", textAlign:"left" }}>
                  <span style={{ fontSize:14, fontWeight:700, color:sec.color }}>{sec.titulo}</span>
                  <span style={{ fontSize:16, color:"#94a3b8", transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▾</span>
                </button>
                {open && (
                  <div style={{ padding:"4px 14px 14px" }}>
                    {sec.items.map((it,j)=>(
                      <div key={j} style={{ display:"flex", gap:8, padding:"5px 0", borderTop:j>0?"1px solid #f1f5f9":"none" }}>
                        <span style={{ color:sec.color, fontSize:12, marginTop:3, flexShrink:0 }}>▸</span>
                        <span style={{ fontSize:13, color:"#374151", lineHeight:1.5 }}>{it}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── MÓDULO ADO ───────────────────────────────────────────────────────────────
function ModuloADO() {
  const [tab, setTab] = useState("familias");
  const [exp, setExp] = useState({});
  const [fg, setFg] = useState(60);
  const toggle = k => setExp(p=>({...p,[k]:!p[k]}));
  return (
    <div>
      <div style={{ background:"linear-gradient(135deg,#faf5ff,#ede9fe)", border:"1.5px solid #c4b5fd", borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
        <div style={{ fontSize:16, fontWeight:800, color:"#0f172a" }}>💊 Antidiabéticos Orales (ADO)</div>
        <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>Tabla por familias, dosis, perfil clínico e interacciones</div>
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:14 }}>
        {[{ id:"familias",label:"Familias y dosis" },{ id:"interacciones",label:"Interacciones y CI" },{ id:"novedades",label:"🆕 Novedades" }].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:600, border:`1.5px solid ${tab===t.id?"#7c3aed":"#e2e8f0"}`, background:tab===t.id?"#faf5ff":"#f8fafc", color:tab===t.id?"#7c3aed":"#6b7280", cursor:"pointer", whiteSpace:"nowrap" }}>{t.label}</button>
        ))}
      </div>
      <div style={{ background:"white", border:"1.5px solid #e5e7eb", borderRadius:10, padding:"10px 14px", marginBottom:14 }}>
        <div style={{ fontSize:12, fontWeight:600, color:"#374151", marginBottom:5 }}>
          🩺 FG del paciente: <strong style={{ color:fg>=60?"#16a34a":fg>=30?"#d97706":"#dc2626" }}>{fg} ml/min/1.73m²</strong>
          <span style={{ marginLeft:8, fontSize:11, fontWeight:700, color:fg>=60?"#16a34a":fg>=45?"#d97706":fg>=30?"#ea580c":"#dc2626" }}>
            {fg>=60?"G1–G2":fg>=45?"G3a":fg>=30?"G3b":fg>=15?"G4":"G5 Fallo renal"}
          </span>
        </div>
        <input type="range" min={5} max={120} step={5} value={fg} onChange={e=>setFg(Number(e.target.value))} style={{ width:"100%", accentColor:"#7c3aed" }} />
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#94a3b8", marginTop:2 }}>
          <span>5</span><span>30</span><span>45</span><span>60</span><span>90</span><span>120</span>
        </div>
      </div>

      {tab==="familias" && (
        <div>
          {ADO_FAMILIAS.map((fam,fi)=>(
            <div key={fi} style={{ marginBottom:14 }}>
              <div style={{ padding:"6px 10px", borderRadius:8, marginBottom:8, background:`${fam.color}15`, border:`1px solid ${fam.color}40`, fontSize:12, fontWeight:700, color:fam.color }}>{fam.familia}</div>
              {fam.farmacos.map((f,di)=>{
                const k=`ado-${fi}-${di}`, open=exp[k], noRec=f.nombre.includes("⛔");
                return (
                  <div key={di} style={{ background:noRec?"#fff5f5":"white", border:`1.5px solid ${noRec?"#fecaca":"#e5e7eb"}`, borderRadius:10, marginBottom:8, overflow:"hidden" }}>
                    <button onClick={()=>toggle(k)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px", background:"transparent", border:"none", cursor:"pointer", textAlign:"left" }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:noRec?"#b91c1c":"#1e293b" }}>{f.nombre}</div>
                        <div style={{ fontSize:11, color:"#64748b", marginTop:1 }}>HbA1c {f.hba1c} · Hipoglucemia: {f.hipoglucemia} · Peso: {f.peso}</div>
                      </div>
                      <span style={{ fontSize:15, color:"#94a3b8", transform:open?"rotate(180deg)":"none", transition:"transform 0.2s", flexShrink:0, marginLeft:8 }}>▾</span>
                    </button>
                    {open && (
                      <div style={{ padding:"0 12px 12px", borderTop:"1px solid #f1f5f9" }}>
                        <div style={{ fontSize:12, color:"#374151", lineHeight:1.7, marginTop:8 }}>
                          <div style={{ marginBottom:5 }}><strong>⚙️ Mecanismo:</strong> {f.mecanismo}</div>
                          <div style={{ marginBottom:5 }}><strong>💊 Dosis:</strong> {f.dosis}</div>
                          <div style={{ marginBottom:6, padding:"6px 8px", background:f.cv.includes("✅")?"#f0fdf4":f.cv.includes("⚠️")?"#fffbeb":"#f8fafc", borderRadius:8 }}>
                            <strong>❤️ CV:</strong> {f.cv}
                          </div>
                          <div style={{ padding:"8px 10px", borderRadius:8, background:f.precauciones.includes("⛔")?"#fff5f5":f.precauciones.includes("⚠️")?"#fffbeb":"#f8fafc", border:`1px solid ${f.precauciones.includes("⛔")?"#fecaca":f.precauciones.includes("⚠️")?"#fde68a":"#e2e8f0"}`, marginBottom:6 }}>
                            <strong>⚠️ Precauciones:</strong> {f.precauciones}
                          </div>
                          <div style={{ padding:"6px 8px", borderRadius:8, background:"#ecfeff", border:"1px solid #a5f3fc" }}>
                            <strong>🩺 Ajuste renal:</strong> {f.renal}
                            {fg<60 && (
                              <span style={{ marginLeft:6, fontSize:11, fontWeight:700, color:f.renal.includes("Sin ajuste")?"#16a34a":f.renal.toLowerCase().includes("contraindicada")&&fg<30?"#dc2626":"#d97706" }}>
                                {f.renal.includes("Sin ajuste")?"✅ OK con FG actual":f.renal.toLowerCase().includes("contraindicada")&&fg<30?"⛔ CONTRAINDICADA con este FG":"⚠️ Revisar dosis"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {tab==="interacciones" && (
        <div>
          {INTERACCIONES.map((sec,i)=>{
            const k=`int-${i}`, open=exp[k];
            return (
              <div key={i} style={{ background:"white", border:`1.5px solid ${sec.color}30`, borderRadius:12, marginBottom:12, overflow:"hidden" }}>
                <button onClick={()=>toggle(k)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:`${sec.color}10`, border:"none", cursor:"pointer", textAlign:"left" }}>
                  <span style={{ fontSize:13, fontWeight:700, color:sec.color }}>{sec.grupo}</span>
                  <span style={{ fontSize:16, color:"#94a3b8", transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▾</span>
                </button>
                {open && (
                  <div style={{ padding:"4px 14px 14px" }}>
                    {sec.items.map((it,j)=>(
                      <div key={j} style={{ display:"flex", gap:8, padding:"5px 0", borderTop:j>0?"1px solid #f1f5f9":"none" }}>
                        <span style={{ color:sec.color, fontSize:12, marginTop:3, flexShrink:0 }}>▸</span>
                        <span style={{ fontSize:13, color:"#374151", lineHeight:1.5 }}>{it}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, padding:10 }}>
            <div style={{ fontSize:11, color:"#64748b", lineHeight:1.6 }}>
              <strong>Nota:</strong> Referencia de apoyo clínico basada en PAI Diabetes 2018 (Consejería de Salud, Junta de Andalucía) y fichas técnicas vigentes. No sustituye la ficha técnica completa ni el juicio clínico.
            </div>
          </div>
        </div>
      )}

      {tab==="novedades" && (
        <div>
          <div style={{ background:"linear-gradient(135deg,#fdf4ff,#f5f3ff)", border:"1.5px solid #e9d5ff", borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:800, color:"#0f172a" }}>🆕 Novedades farmacológicas desde el PAI 2018</div>
            <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>Fármacos con evidencia relevante no recogidos en el PAI 2018 · Referencia: Guías ADA 2024, ESC 2023</div>
            <div style={{ fontSize:11, color:"#dc2626", background:"#fff5f5", borderRadius:6, padding:"4px 8px", marginTop:6, border:"1px solid #fecaca", display:"inline-block" }}>
              ⚠️ Contenido informativo. Consultar ficha técnica y posicionamiento terapéutico del SAS antes de prescribir
            </div>
          </div>

          {[
            {
              nombre: "Semaglutida oral (Rybelsus®)", familia: "aRGLP-1 oral", color: "#059669",
              hba1c: "↓ 1,0–1,4%", peso: "↓↓ Moderada-alta", hipoglucemia: "No",
              novedad: "Primer aRGLP-1 en comprimido oral. Administrar en ayunas con máx. 120 ml de agua, esperar 30 min antes de comer.",
              dosis: "3 mg/día (4 sem) → 7 mg/día → máx 14 mg/día",
              cv: "✅ No inferioridad CV (PIONEER-6). Beneficio renal emergente.",
              precauciones: "Absorción variable. No intercambiable con semaglutida SC (Ozempic®). Mismas contraindicaciones que aRGLP-1 SC.",
              renal: "Sin ajuste renal necesario",
            },
            {
              nombre: "Tirzepatida (Mounjaro®)", familia: "GIP/GLP-1 dual agonista", color: "#7c3aed",
              hba1c: "↓ 1,8–2,4%", peso: "↓↓↓↓ Muy significativa (hasta -22%)", hipoglucemia: "No",
              novedad: "Primer agonista dual GIP+GLP-1. Mayor reducción de HbA1c y peso que cualquier otro ADO. Aprobado en España 2023.",
              dosis: "2,5 mg/sem SC (4 sem) → 5 mg/sem → hasta 15 mg/sem",
              cv: "✅ Superioridad CV en pacientes con DM2 y EVA (SURPASS-CVOT). ✅ Reducción marcada de insuficiencia cardíaca.",
              precauciones: "SC semanal. Mismas contraindicaciones que aRGLP-1. Náuseas/vómitos frecuentes al inicio. Precio elevado — valorar disponibilidad en SAS.",
              renal: "Sin ajuste renal",
            },
            {
              nombre: "Finerenona (Kerendia®)", familia: "Antagonista selectivo receptor mineralocorticoide (MRA no esteroideo)", color: "#0369a1",
              hba1c: "No hipoglucemiante directo", peso: "Neutro", hipoglucemia: "No",
              novedad: "Indicación específica: DMT2 + ERC (estadios G3-G4 con albuminuria). Reduce progresión renal y eventos CV. Complementario a IECA/ARA II.",
              dosis: "10 mg/día (inicio si FG 25–60) → 20 mg/día si FG ≥60 y potasio ≤4,8 mEq/L",
              cv: "✅ Reducción hospitalización por IC y mortalidad CV (FIGARO-DKD, FIDELIO-DKD)",
              precauciones: "⚠️ Riesgo hiperpotasemia — monitorizar K+. Contraindicada con K+ >5 mEq/L. No combinar con inhibidores CYP3A4 potentes.",
              renal: "Indicación específica en ERC G3-G4. Contraindicada si FG <25 ml/min.",
            },
            {
              nombre: "Empagliflozina / Dapagliflozina en IC y ERC", familia: "iSGLT2 — indicaciones ampliadas", color: "#0891b2",
              hba1c: "↓ 0,7–1% (efecto glucémico)", peso: "↓ Moderada", hipoglucemia: "No",
              novedad: "Desde 2021–2023 las indicaciones de iSGLT2 se han ampliado a: IC con fracción de eyección reducida y preservada (independientemente de DM) y ERC crónica (DAPA-CKD, EMPEROR-Reduced/Preserved).",
              dosis: "Empagliflozina 10 mg/día · Dapagliflozina 10 mg/día",
              cv: "✅ Superioridad en IC y ERC más allá del efecto glucémico. Nueva indicación aprobada por EMA.",
              precauciones: "Mismas precauciones que iSGLT2 clásicas. La indicación en IC/ERC no requiere DM concomitante.",
              renal: "Dapagliflozina aprobada en ERC desde FG ≥25 ml/min (indicación renal)",
            },
          ].map((f, i) => {
            const k = `nov-${i}`, open = exp[k];
            return (
              <div key={i} style={{ background:"white", border:`1.5px solid ${f.color}30`, borderRadius:12, marginBottom:10, overflow:"hidden" }}>
                <button onClick={()=>toggle(k)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px", background:`${f.color}08`, border:"none", cursor:"pointer", textAlign:"left" }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:10, fontWeight:700, background:`${f.color}18`, color:f.color, border:`1px solid ${f.color}40`, borderRadius:5, padding:"1px 6px" }}>🆕 {f.familia}</span>
                    </div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#1e293b", marginTop:3 }}>{f.nombre}</div>
                    <div style={{ fontSize:11, color:"#64748b", marginTop:1 }}>HbA1c {f.hba1c} · Hipoglucemia: {f.hipoglucemia} · Peso: {f.peso}</div>
                  </div>
                  <span style={{ fontSize:15, color:"#94a3b8", transform:open?"rotate(180deg)":"none", transition:"transform 0.2s", flexShrink:0, marginLeft:8 }}>▾</span>
                </button>
                {open && (
                  <div style={{ padding:"0 12px 12px", borderTop:"1px solid #f1f5f9" }}>
                    <div style={{ fontSize:12, color:"#374151", lineHeight:1.7, marginTop:10 }}>
                      <div style={{ marginBottom:8, padding:"8px 10px", background:`${f.color}10`, borderRadius:8, border:`1px solid ${f.color}30` }}>
                        <strong>✨ Novedad:</strong> {f.novedad}
                      </div>
                      <div style={{ marginBottom:5 }}><strong>💊 Dosis:</strong> {f.dosis}</div>
                      <div style={{ marginBottom:6, padding:"6px 8px", background:f.cv.includes("✅")?"#f0fdf4":"#f8fafc", borderRadius:8 }}>
                        <strong>❤️ CV / Renal:</strong> {f.cv}
                      </div>
                      <div style={{ padding:"8px 10px", borderRadius:8, background:f.precauciones.includes("⚠️")?"#fffbeb":"#f8fafc", border:`1px solid ${f.precauciones.includes("⚠️")?"#fde68a":"#e2e8f0"}`, marginBottom:6 }}>
                        <strong>⚠️ Precauciones:</strong> {f.precauciones}
                      </div>
                      <div style={{ padding:"6px 8px", borderRadius:8, background:"#ecfeff", border:"1px solid #a5f3fc" }}>
                        <strong>🩺 Ajuste renal:</strong> {f.renal}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, padding:10, marginTop:4 }}>
            <div style={{ fontSize:11, color:"#64748b", lineHeight:1.6 }}>
              <strong>Referencias:</strong> ADA Standards of Care 2024 · ESC Guidelines Cardiovascular Disease in Diabetes 2023 · Guía Farmacoterapéutica SSPA · Fichas técnicas EMA. El PAI Diabetes del SSPA (3ª ed. 2018) no recoge estos fármacos por fecha de publicación. Para posicionamiento terapéutico oficial del SAS consultar AEMPS e IPT vigentes.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MÓDULO REGICOR ───────────────────────────────────────────────────────────
function ModuloREGICOR() {
  const [f, setF] = useState({ sexo:"H", edad:55, colTotal:220, colHDL:45, pas:135, tabaco:false, diabetes:true });
  const [res, setRes] = useState(null);
  const [calc, setCalc] = useState(false);
  const set = (k,v) => { setF(p=>({...p,[k]:v})); setCalc(false); };
  const calcular = useCallback(() => {
    if (f.edad<35||f.edad>75) { setRes(null); setCalc(true); return; }
    setRes(calcularREGICOR(f)); setCalc(true);
  }, [f]);
  const cls = (calc&&res!==null) ? clsRiesgo(res) : null;
  return (
    <div>
      <div style={{ background:"linear-gradient(135deg,#fff1f2,#fce7f3)", border:"1.5px solid #fecdd3", borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
        <div style={{ fontSize:16, fontWeight:800, color:"#0f172a" }}>🧮 Calculadora REGICOR</div>
        <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>Ecuación de Framingham calibrada para España · Marrugat et al. 2003</div>
        <div style={{ fontSize:11, color:"#9ca3af", marginTop:1 }}>Riesgo cardiopatía coronaria a 10 años · Válido 35–75 años</div>
      </div>
      <div style={{ background:"white", border:"1.5px solid #e5e7eb", borderRadius:12, padding:14, marginBottom:12 }}>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:12, fontWeight:600, color:"#374151", marginBottom:5 }}>Sexo biológico</div>
          <ToggleBtn valor={f.sexo} opA="H" labelA="♂ Hombre" opB="M" labelB="♀ Mujer" onChange={v=>set("sexo",v)} color="#3b82f6" />
        </div>
        <SliderInput label={`Edad: ${f.edad} años`} campo="edad" min={35} max={75} value={f.edad} onChange={v=>set("edad",v)} color="#e11d48" />
        <SliderInput label={`Colesterol total: ${f.colTotal} mg/dl`} campo="colTotal" min={140} max={320} step={5} value={f.colTotal} onChange={v=>set("colTotal",v)} color="#e11d48" />
        <SliderInput label={`Colesterol HDL: ${f.colHDL} mg/dl`} campo="colHDL" min={20} max={100} value={f.colHDL} onChange={v=>set("colHDL",v)} color="#e11d48" />
        <SliderInput label={`PA sistólica: ${f.pas} mmHg`} campo="pas" min={90} max={200} value={f.pas} onChange={v=>set("pas",v)} color="#e11d48" />
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:12, fontWeight:600, color:"#374151", marginBottom:5 }}>Tabaquismo activo</div>
          <ToggleBtn valor={f.tabaco} opA={true} labelA="🚬 Sí" opB={false} labelB="✓ No" onChange={v=>set("tabaco",v)} color="#78716c" />
        </div>
        <div style={{ marginBottom:4 }}>
          <div style={{ fontSize:12, fontWeight:600, color:"#374151", marginBottom:5 }}>Diabetes mellitus</div>
          <ToggleBtn valor={f.diabetes} opA={true} labelA="✓ Sí" opB={false} labelB="No" onChange={v=>set("diabetes",v)} color="#f59e0b" />
        </div>
      </div>
      <button onClick={calcular} style={{ width:"100%", padding:14, borderRadius:10, marginBottom:14, background:"linear-gradient(135deg,#e11d48,#be123c)", color:"white", fontSize:15, fontWeight:800, border:"none", cursor:"pointer", boxShadow:"0 4px 14px rgba(225,29,72,0.35)" }}>
        Calcular Riesgo Coronario →
      </button>
      {calc && !res && (
        <div style={{ background:"#fffbeb", border:"1.5px solid #fcd34d", borderRadius:12, padding:14 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#92400e" }}>⚠️ Edad fuera del rango válido (35–75 años)</div>
        </div>
      )}
      {calc && res!==null && cls && (
        <div style={{ background:cls.bg, border:`2px solid ${cls.border}`, borderRadius:14, padding:16, marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Riesgo coronario a 10 años</div>
              <div style={{ fontSize:48, fontWeight:900, color:cls.color, lineHeight:1 }}>{res.toFixed(1)}<span style={{ fontSize:22 }}>%</span></div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:42 }}>{cls.emoji}</div>
              <div style={{ fontSize:12, fontWeight:800, color:cls.color, background:`${cls.color}20`, borderRadius:7, padding:"3px 12px", marginTop:5, border:`1px solid ${cls.border}` }}>{cls.nivel}</div>
            </div>
          </div>
          <div style={{ height:10, background:"#e2e8f0", borderRadius:5, overflow:"hidden", marginBottom:10 }}>
            <div style={{ height:"100%", width:`${Math.min((res/25)*100,100)}%`, background:"linear-gradient(90deg,#16a34a,#d97706,#dc2626)", borderRadius:5, transition:"width 0.6s" }} />
          </div>
          <div style={{ background:"rgba(255,255,255,0.75)", borderRadius:10, padding:"10px 12px", marginBottom:10, border:"1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#475569", marginBottom:6, textTransform:"uppercase" }}>Actuación según PAI Diabetes</div>
            {res<5  && <div style={{ fontSize:12, color:"#166534" }}>✓ No se precisa tratamiento hipolipemiante en prevención primaria (salvo otros criterios). Reforzar estilos de vida.</div>}
            {res>=5 && res<10  && <div style={{ fontSize:12, color:"#3f6212" }}>✓ Reforzar estilos de vida. Valorar tratamiento farmacológico si riesgo persiste.</div>}
            {res>=10 && res<15 && <div style={{ fontSize:12, color:"#92400e" }}>⚠️ Indicada estatina de intensidad moderada. Considerar antiagregación en varones &gt;50a o mujeres &gt;60a.</div>}
            {res>=15 && <div style={{ fontSize:12, color:"#991b1b" }}>🔴 Riesgo alto: estatina moderada + valorar AAS 75–150 mg/día + intervención multifactorial intensiva.</div>}
          </div>
          <div style={{ background:"#fff7ed", borderRadius:10, padding:"10px 12px", border:"1px solid #fed7aa" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#9a3412", marginBottom:6 }}>⚠️ Alto riesgo automático (no requiere calcular REGICOR)</div>
            {["Diabetes de larga evolución (> 15 años)","ERC","Dislipemia familiar aterogénica","HTA estadio 3 (PA ≥ 180/110) o afectación órganos diana","EVA previa documentada (prevención secundaria)"].map((it,i)=>(
              <div key={i} style={{ fontSize:11, color:"#9a3412", display:"flex", gap:5, marginBottom:2 }}><span>▸</span><span>{it}</span></div>
            ))}
          </div>
        </div>
      )}
      <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, padding:10 }}>
        <div style={{ fontSize:11, color:"#64748b", lineHeight:1.6 }}><strong>Referencia:</strong> Marrugat J et al. Rev Esp Cardiol. 2003;56:253–61. Herramienta de apoyo clínico. No sustituye al juicio clínico.</div>
      </div>
    </div>
  );
}

// ─── MÓDULO PAI CLÍNICO ───────────────────────────────────────────────────────
function ModuloPAI({ momento, perfil }) {
  const [exp, setExp] = useState({});
  const toggle = k => setExp(p=>({...p,[k]:!p[k]}));
  const data = DATA[momento]; if (!data) return null;
  const col = MOMENTOS.find(m=>m.id===momento)?.color||"#0ea5e9";
  const showM = perfil==="medico"||perfil==="ambos";
  const showE = perfil==="enfermera"||perfil==="ambos";
  return (
    <div>
      <div style={{ background:`linear-gradient(135deg,${col}18,${col}06)`, border:`1.5px solid ${col}33`, borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
        <div style={{ fontSize:16, fontWeight:800, color:"#0f172a" }}>{data.titulo}</div>
        <div style={{ fontSize:12, color:"#64748b", marginTop:3 }}>{data.descripcion}</div>
      </div>
      {showM && data.medico?.length>0 && (
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10, padding:"6px 10px", background:"#f0f9ff", borderRadius:8, border:"1px solid #bae6fd" }}>
            <span style={{ fontSize:16 }}>👨‍⚕️</span>
            <span style={{ fontSize:12, fontWeight:700, color:"#0369a1", textTransform:"uppercase", letterSpacing:"0.5px" }}>Médico/a de Familia</span>
          </div>
          {data.medico.map((item,idx)=><Tarjeta key={idx} item={item} id={`${momento}-m-${idx}`} expandido={exp} toggle={toggle} />)}
        </div>
      )}
      {showE && data.enfermera?.length>0 && (
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10, padding:"6px 10px", background:"#fdf4ff", borderRadius:8, border:"1px solid #e9d5ff" }}>
            <span style={{ fontSize:16 }}>👩‍⚕️</span>
            <span style={{ fontSize:12, fontWeight:700, color:"#7c3aed", textTransform:"uppercase", letterSpacing:"0.5px" }}>Enfermero/a de Familia</span>
          </div>
          {data.enfermera.map((item,idx)=><Tarjeta key={idx} item={item} id={`${momento}-e-${idx}`} expandido={exp} toggle={toggle} />)}
        </div>
      )}
      <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, padding:12 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#64748b", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.5px" }}>Grado de recomendación</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {[["A NICE","Evidencia alta / NICE"],["B","Evidencia moderada"],["AG","Acuerdo de grupo"],["NICE","Recomendación NICE"],["NICE Fuerte","Recomendación fuerte"]].map(([b,d])=>{
            const bx=BC[b]||BC["AG"];
            return (<div key={b} style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ fontSize:10, fontWeight:700, background:bx.bg, color:bx.text, border:`1px solid ${bx.border}`, borderRadius:5, padding:"1px 5px" }}>{b}</span><span style={{ fontSize:11, color:"#64748b" }}>{d}</span></div>);
          })}
        </div>
      </div>

      {/* ── FORMULARIOS DIRAYA — solo en Complicaciones ── */}
      {momento==="complicaciones" && (
        <div style={{ marginTop:16 }}>
          {/* Cabecera + PDF de apoyo general */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8, marginBottom:10, padding:"10px 12px", background:"linear-gradient(135deg,#f0f9ff,#e0f2fe)", borderRadius:10, border:"1px solid #7dd3fc" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:16 }}>📋</span>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"#0369a1" }}>Formularios Diraya — Pie Diabético</div>
                <div style={{ fontSize:11, color:"#64748b" }}>HSAP · Estación Clínica · DIRAYAbierto 2024</div>
              </div>
            </div>
            <a href="https://juntadeandalucia.es/sites/default/files/2023-12/Pie_diabetico_doc_apoyo_2023.pdf" target="_blank" rel="noopener noreferrer"
              style={{ fontSize:11, fontWeight:600, color:"#0369a1", background:"white", border:"1px solid #bae6fd", borderRadius:7, padding:"5px 12px", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:4 }}>
              📄 Documento de apoyo Pie Diabético 2023
            </a>
          </div>
          {/* Tres formularios con PDF específico */}
          {[
            { num:"1", color:"#0891b2", bg:"#ecfeff", border:"#a5f3fc",
              titulo:"Exploración y estratificación del pie de riesgo",
              desc:"Valora antecedentes, neuropatía (monofilamento + diapasón), EAP (pulsos + ITB), hábitos y exploración física. Clasifica el riesgo (bajo/moderado/alto) y establece la frecuencia de cribado.",
              video:"https://cdnapi.codev8.net/vdmplayer/c63df16c-5956-422d-b0ba-b6a175932067",
              pdf:"/assets/formularios/formulario1_pie_riesgo.pdf" },
            { num:"2", color:"#059669", bg:"#f0fdf4", border:"#86efac",
              titulo:"Conocimientos sobre autocuidados del pie: DFSQ-UMA",
              desc:"16 ítems validados (Univ. Málaga). Escala 16–80. Subescalas: autocuidado personal, cuidado podológico, calzado y medias. Recomienda intervenciones en áreas deficitarias.",
              video:"https://cdnapi.codev8.net/vdmplayer/c474c2b6-f0e7-4583-8e2e-7fa71953aff2",
              pdf:"/assets/formularios/formulario2_dfsq_uma.pdf" },
            { num:"3", color:"#7c3aed", bg:"#faf5ff", border:"#c4b5fd",
              titulo:"Registro de educación terapéutica para la prevención del pie diabético",
              desc:"Documenta tipo de sesión, contenidos por bloques, objetivos NOC y intervenciones NIC. Vinculado a la Estrategia de Cuidados SSPA y el Plan Integral de Diabetes.",
              video:"https://cdnapi.codev8.net/vdmplayer/8fef0bd9-c420-4204-a3e9-931cce346f08",
              pdf:"/assets/formularios/formulario3_educacion_terapeutica.pdf" },
          ].map((f,i)=>(
            <div key={i} style={{ background:f.bg, border:`1.5px solid ${f.border}`, borderRadius:12, padding:"12px 14px", marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                <div style={{ background:f.color, color:"white", borderRadius:8, width:26, height:26, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, flexShrink:0 }}>{f.num}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#0f172a", marginBottom:4 }}>{f.titulo}</div>
                  <div style={{ fontSize:12, color:"#475569", lineHeight:1.5, marginBottom:10 }}>{f.desc}</div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <a href={f.video} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize:11, fontWeight:600, color:f.color, background:"white", border:`1px solid ${f.border}`, borderRadius:7, padding:"5px 12px", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:4 }}>
                      ▶ Ver demo en video
                    </a>
                    <a href={f.pdf} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize:11, fontWeight:600, color:"#475569", background:"white", border:"1px solid #e2e8f0", borderRadius:7, padding:"5px 12px", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:4 }}>
                      📋 Ver formulario
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div style={{ fontSize:11, color:"#94a3b8", textAlign:"center", marginTop:4 }}>
            Accesibles desde HSAP (lista de formularios) y Estación Clínica (menú Crear dentro del episodio)
          </div>
        </div>
      )}
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App() {
  const [autenticado, setAutenticado] = useState(() => checkSession());
  const [momento,    setMomento]    = useState("prevencion");
  const [perfil,     setPerfil]     = useState("ambos");
  const [tooltip,    setTooltip]    = useState(false);

  if (!autenticado) {
    return <Login onSuccess={() => setAutenticado(true)} />;
  }

  const herramientas = ["insulinas","ado","regicor"];
  const esPAI = !herramientas.includes(momento);
  const moColor = MOMENTOS.find(m=>m.id===momento)?.color||"#0ea5e9";

  const handleLogout = () => { clearSession(); setAutenticado(false); };

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"'Segoe UI', system-ui, sans-serif", display:"flex", flexDirection:"column" }}>

      {/* ── HEADER ── */}
      <div style={{ background:"linear-gradient(135deg,#0f172a,#1e293b)", color:"white", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 8px rgba(0,0,0,0.3)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {/* Logo con tooltip hover + tap mailto */}
          <div style={{ position:"relative" }}>
            <a
              href="mailto:doncel.project@gmail.com"
              onMouseEnter={()=>setTooltip(true)}
              onMouseLeave={()=>setTooltip(false)}
              style={{ display:"block", textDecoration:"none" }}
              title="doncel.project@gmail.com"
            >
              <img
                src="/assets/icon-192.png"
                alt="Doncel Project"
                style={{ width:36, height:36, borderRadius:8, objectFit:"cover", flexShrink:0, display:"block", cursor:"pointer" }}
              />
            </a>
            {tooltip && (
              <div style={{
                position:"absolute", top:44, left:0, zIndex:100,
                background:"#0f172a", color:"white",
                fontSize:11, fontWeight:600,
                padding:"6px 10px", borderRadius:8,
                border:"1px solid #334155",
                whiteSpace:"nowrap",
                boxShadow:"0 4px 16px rgba(0,0,0,0.4)",
                pointerEvents:"none",
              }}>
                ✉️ doncel.project@gmail.com
                <div style={{
                  position:"absolute", top:-5, left:10,
                  width:8, height:8, background:"#0f172a",
                  border:"1px solid #334155", borderRight:"none", borderBottom:"none",
                  transform:"rotate(45deg)",
                }}/>
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:800, letterSpacing:"-0.3px" }}>
              <span style={{ color:"white" }}>doncel</span><span style={{ color:"#38bdf8" }}>project</span>
            </div>
            <div style={{ fontSize:10, color:"#94a3b8" }}>PAI Diabetes Mellitus · Consejería de Salud</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {esPAI && (
            <div style={{ display:"flex", background:"#334155", borderRadius:8, overflow:"hidden", border:"1px solid #475569" }}>
              {[["medico","MF"],["ambos","Ambos"],["enfermera","EF"]].map(([id,label])=>(
                <button key={id} onClick={()=>setPerfil(id)} style={{ padding:"5px 10px", fontSize:11, fontWeight:600, border:"none", cursor:"pointer", background:perfil===id?moColor:"transparent", color:perfil===id?"white":"#94a3b8", transition:"all 0.2s" }}>{label}</button>
              ))}
            </div>
          )}
          <button onClick={handleLogout} title="Cerrar sesión" style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:7, color:"#94a3b8", fontSize:16, cursor:"pointer", padding:"4px 8px", lineHeight:1 }}>⏏</button>
        </div>
      </div>

      {/* ── NAV ── */}
      <div style={{ background:"#1e293b", display:"flex", overflowX:"auto", padding:"6px 10px", gap:4, flexShrink:0, scrollbarWidth:"none" }}>
        {/* PAI momentos */}
        {MOMENTOS.filter(m=>!m.herramienta).map(m=>(
          <button key={m.id} onClick={()=>setMomento(m.id)} style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 11px", borderRadius:7, whiteSpace:"nowrap", border:`1.5px solid ${momento===m.id?m.color:"transparent"}`, background:momento===m.id?`${m.color}22`:"transparent", color:momento===m.id?m.color:"#94a3b8", fontSize:11, fontWeight:600, cursor:"pointer", flexShrink:0, transition:"all 0.2s" }}>
            <span>{m.icon}</span><span>{m.label}</span>
          </button>
        ))}
        {/* Separador */}
        <div style={{ width:1, background:"#334155", margin:"4px 4px", flexShrink:0 }} />
        {/* Herramientas */}
        {MOMENTOS.filter(m=>m.herramienta).map(m=>(
          <button key={m.id} onClick={()=>setMomento(m.id)} style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 11px", borderRadius:7, whiteSpace:"nowrap", border:`1.5px solid ${momento===m.id?m.color:"transparent"}`, background:momento===m.id?`${m.color}22`:"transparent", color:momento===m.id?m.color:"#94a3b8", fontSize:11, fontWeight:600, cursor:"pointer", flexShrink:0, transition:"all 0.2s" }}>
            <span>{m.icon}</span><span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* ── CONTENIDO ── */}
      <div style={{ flex:1, overflowY:"auto", padding:14 }}>
        {momento==="insulinas" && <ModuloInsulinas />}
        {momento==="ado"       && <ModuloADO />}
        {momento==="regicor"   && <ModuloREGICOR />}
        {esPAI                 && <ModuloPAI momento={momento} perfil={perfil} />}
      </div>
    </div>
  );
}
