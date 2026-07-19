# 📊 Espectro de Audio - Reproductor & Visualizador

Un reproductor y visualizador de música web avanzado con renderizado interactivo en tiempo real utilizando HTML5 Canvas. Permite cambiar el fondo y el logo dinámicamente y admite capturas de audio por micrófono.

---

## 🚀 Características Principales

* Visualizador interactivo basado en frecuencia y formas de onda en tiempo real.
* Entrada dual: Carga tus archivos de música locales (`.mp3`) o captura audio del micrófono.
* Personalización completa de interfaz: Cambia la carátula, el logotipo flotante y la imagen de fondo.
* Controles de reproducción avanzados integrados con una barra de progreso responsiva.

---

## 🛠️ Tecnologías Utilizadas

* Web Audio API
* HTML5 Canvas (2D Context)
* JavaScript (ES6+)
* CSS Custom Properties (Dark/Neon Glassmorphism)

---

### Ejecución

Debido al uso de la *Web Audio API*, los navegadores requieren que este proyecto sea servido mediante un servidor HTTP local para poder procesar el audio sin errores de seguridad:

1. Ejecuta un servidor local (como *Live Server* en VS Code o vía Python):
   ```bash
   python -m http.server 8000
   ```
2. Ingresa a `http://localhost:8000` en tu navegador.

---
*Este repositorio ha sido configurado y catalogado automáticamente.*
