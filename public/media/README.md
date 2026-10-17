# Carpeta de Fotos y Videos

¡Aquí puedes colocar tus propias fotos y videos familiares!

## Cómo usar tus fotos locales:
1. Guarda tu foto o video en esta carpeta: `public/media/` (por ejemplo, `nuestra-primera-cita.jpg` o `ecografia-vaiolet.mp4`).
2. En el archivo `src/data/relationshipData.ts`, haz referencia a ella usando la ruta relativa con `./media/`:
   ```ts
   url: './media/nuestra-primera-cita.jpg'
   ```
3. O si prefieres, puedes usar enlaces directos de la nube (Google Photos enlaces directos, Imgur, Cloudinary, etc.).
