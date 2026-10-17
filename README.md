# 💖 Maicol & Vanessa — Nuestra Historia de Amor & Vaiolet 🌸

Un sitio web interactivo, privado e íntimo para revivir cada paso de nuestra relación desde el **11 de julio de 2025**, la dulce espera de nuestra hija **Vaiolet** y todos los momentos que vendrán.

---

## ✨ Características Principales

1. **🔒 Pantalla de Acceso Secreta (PIN `1107`)**:
   - Protege los recuerdos íntimos de miradas ajenas.
   - Pista sutil: *"Día y mes de nuestro aniversario especial (11 de julio)"*.
   - Guarda la sesión en el navegador y cuenta con un botón en la barra superior para volver a bloquear cuando quieras.

2. **⏱️ Contadores en Tiempo Real**:
   - **Tiempo Juntos**: Años, meses, días, horas, minutos y segundos exactos transcurridos desde el 11/07/2025, actualizándose cada segundo.
   - **Próximo Aniversario**: Cuenta regresiva exacta para cada 11 de julio.
   - **Días Totales de Amor**: Contador acumulativo de días compartidos.

3. **🌸 Sección Especial: "La Dulce Espera de Vaiolet"**:
   - **Modo Embarazo Activo (Semana 39)**: Barra de progreso gestacional (98%), cuenta regresiva hacia las 40 semanas, fecha estimada (24 de Octubre), galería de ecografías y checklist de preparativos (maleta del hospital, cunita, etc.).
   - **Botón `¡Ya nació Vaiolet!`**: Permite ingresar con un solo clic el peso, estatura, fecha/hora exacta de nacimiento y primera nota. Guarda el estado automáticamente y cambia la sección a modo celebración con el **contador en vivo de edad de Vaiolet**.

4. **📖 Línea del Tiempo Interactiva de Recuerdos**:
   - Vista dual: **Línea de Tiempo Cronológica** con conector o **Muro de Fotos estilo Polaroid**.
   - Filtros por categoría: *Inicios, Hitos, El Embarazo, Vaiolet, Viajes, Momentos Especiales y Favoritos*.
   - Buscador en tiempo real por palabras clave o lugares.
   - Visor **Lightbox en pantalla completa** para fotos y videos con navegación izquierda/derecha.

5. **💌 Cartas Secretas "Ábreme Cuando..."**:
   - Sobres interactivos con sello de cera de colores.
   - Al hacer clic, se rompe el sello y se despliega una carta emotiva con estilo manuscrito:
     - *"Ábreme cuando sientas nervios por el parto"* (De Maicol para Vanessa).
     - *"Carta para nuestra princesa Vaiolet"* (Para que la lea al crecer).
     - *"Ábreme cuando tengamos un día difícil"*.
     - *"Ábreme en nuestro aniversario"*.

6. **➕ Modal para Añadir Nuevos Recuerdos**:
   - Permite agregar fotos, videos, fechas y anécdotas directamente desde la web.
   - Opción de guardar en el navegador inmediatamente o hacer clic en **"Copiar código para Git"** para pegarlo en el archivo definitivo.

---

## 🚀 Cómo Ejecutar en Tu Computadora

```bash
# 1. Instalar dependencias (solo la primera vez)
npm install

# 2. Iniciar el servidor local
npm run dev
```

Abre tu navegador en `http://localhost:5173` e ingresa el PIN `1107`.

---

## 🌐 Cómo Desplegar en GitHub Pages

El proyecto ya incluye el archivo de automatización [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) listo para desplegar con cero configuración:

1. **Crea un nuevo repositorio en tu cuenta de GitHub** (ejemplo: `nosotros` o `historia-maicol-vanessa`).
2. **Sube los archivos**:
   ```bash
   git init
   git add .
   git commit -m "feat: nuestro álbum de amor y dulce espera de Vaiolet"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
   git push -u origin main
   ```
3. **Activar GitHub Pages**:
   - Ve a tu repositorio en GitHub -> pestaña **Settings** (Configuración).
   - En el menú lateral izquierdo, haz clic en **Pages**.
   - En la sección **Build and deployment** -> **Source**, selecciona **`GitHub Actions`**.
4. ¡Listo! En 1-2 minutos tu web estará disponible en:
   `https://TU-USUARIO.github.io/TU-REPOSITORIO/`

---

## 📸 Cómo Agregar Tus Propias Fotos y Videos

Tienes dos formas muy sencillas:

### Opción 1: Guardar tus archivos localmente
1. Coloca tus fotos o videos dentro de la carpeta [`public/media/`](public/media/).
2. En [`src/data/relationshipData.ts`](src/data/relationshipData.ts), pon la ruta:
   ```ts
   url: './media/nombre-de-tu-foto.jpg'
   ```

### Opción 2: Usar enlaces de internet
Pega directamente cualquier enlace de imagen o video (Imgur, Google Drive con enlace directo, Cloudinary, etc.) en el campo `url` de [`src/data/relationshipData.ts`](src/data/relationshipData.ts) o desde el botón **"Nuevo Recuerdo"** en la web.

---

## 💍 Personalización de Datos

Todo el contenido central (nombres, PIN, fechas, textos de cartas y recuerdos) se encuentra concentrado en:
📁 [`src/data/relationshipData.ts`](src/data/relationshipData.ts)
