# PAI Diabetes Mellitus · SAS
Aplicación de referencia clínica para profesionales de Atención Primaria del
Servicio Andaluz de Salud. Centro de Salud de Marbella.

---

## 🚀 Despliegue paso a paso

### 1. Crear repositorio en GitHub

1. Ve a [github.com](https://github.com) e inicia sesión
2. Clic en **"New repository"**
3. Nombre: `pai-diabetes` (o el que prefieras)
4. Visibilidad: **Private** ← importante para proteger la contraseña
5. Clic en **"Create repository"**

### 2. Subir el código

En tu ordenador, abre una terminal en la carpeta del proyecto y ejecuta:

```bash
git init
git add .
git commit -m "Primera versión PAI Diabetes"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/pai-diabetes.git
git push -u origin main
```

### 3. Desplegar en Netlify

1. Ve a [netlify.com](https://netlify.com) e inicia sesión (puedes usar tu cuenta GitHub)
2. Clic en **"Add new site"** → **"Import an existing project"**
3. Elige **GitHub** y selecciona el repositorio `pai-diabetes`
4. Configuración de build (debería autodetectarse):
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Clic en **"Deploy site"**
6. En ~2 minutos tendrás una URL tipo `https://nombre-aleatorio.netlify.app`

> **Personalizar la URL:** En Netlify → Site settings → Domain management → Options → Edit site name

### 4. Configurar redespliegue automático

Ya está activado por defecto. Cada vez que hagas `git push`, Netlify redesplegará automáticamente en ~1 minuto.

---

## 🔑 Cambiar la contraseña

La contraseña está en un único archivo:

```
src/config.js
```

Ábrelo y cambia el valor de `APP_PASSWORD`:

```js
export const APP_PASSWORD = "NuevaContraseña2025";
```

Luego en la terminal:

```bash
git add src/config.js
git commit -m "Actualizar contraseña"
git push
```

Netlify redesplegará automáticamente. La nueva contraseña estará activa en ~1 minuto.

También puedes cambiar la duración de la sesión (por defecto 8 horas):

```js
export const SESSION_HOURS = 8;   // cambiar por las horas que necesites
```

---

## 📱 Instalar como app en móvil (iOS / Android)

### iOS (Safari):
1. Abre la URL en Safari
2. Toca el botón **Compartir** (cuadrado con flecha)
3. Desplaza y toca **"Añadir a pantalla de inicio"**
4. La app aparecerá como icono nativo

### Android (Chrome):
1. Abre la URL en Chrome
2. Toca el menú **⋮** → **"Añadir a pantalla de inicio"**
3. Confirma

---

## 🔄 Actualizar contenido clínico (nuevo PAI)

1. Sube el nuevo PDF del PAI a Claude (claude.ai)
2. Pide: *"Actualiza la app con el nuevo PAI"*
3. Descarga el nuevo `App.jsx`
4. Reemplaza el archivo en `src/App.jsx`
5. Haz commit y push → Netlify redesplega automáticamente

---

## 📁 Estructura del proyecto

```
pai-diabetes/
├── src/
│   ├── main.jsx          ← entrada React (no tocar)
│   ├── App.jsx           ← toda la app y contenido clínico
│   ├── Login.jsx         ← pantalla de acceso con contraseña
│   └── config.js         ← ⭐ SOLO ESTE para cambiar contraseña
├── index.html            ← HTML base (no tocar)
├── vite.config.js        ← configuración Vite (no tocar)
├── netlify.toml          ← configuración despliegue (no tocar)
├── package.json          ← dependencias (no tocar)
└── README.md             ← este archivo
```

---

## ⚠️ Notas de seguridad

- El repositorio debe ser **privado** en GitHub para que la contraseña no sea visible públicamente
- La contraseña se almacena en el código fuente: es una protección de uso, no criptográfica
- La sesión expira automáticamente tras 8 horas (configurable en `config.js`)
- Para mayor seguridad en entornos hospitalarios, considera complementar con la autenticación de red del centro

---

## 📋 Contenido incluido

- **PAI Diabetes Mellitus** — 3ª Ed. 2018, Consejería de Salud, Junta de Andalucía
  - Prevención, Cribado, Diagnóstico, Complicaciones, Plan Terapéutico, Seguimiento
  - Vista diferenciada Médico/a de Familia · Enfermero/a de Familia
- **💉 Módulo Insulinas** — Tipos, dosis correctora, ratio IC, ajustes
- **💊 Módulo ADO** — Familias, dosis, perfil CV, ajuste renal, interacciones
- **🧮 Calculadora REGICOR** — Ecuación Framingham calibrada para España

---

*Uso exclusivo para profesionales sanitarios del centro.*
*No sustituye al juicio clínico ni a la historia clínica completa.*
