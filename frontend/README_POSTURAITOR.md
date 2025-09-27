# POSTURAITOR - Gran Vía Edition

## 🎯 Descripción del Proyecto

**POSTURAITOR** es una aplicación móvil de turismo interactivo que transforma la experiencia de visitar la Gran Vía de Madrid en un juego inmersivo de selfies y descubrimiento cultural. La app combina geolocalización, análisis de IA para selfies, y contenido audiovisual para crear una experiencia única de turismo urbano.

## 🌟 Características Principales

### 🗺️ **Sistema de Geolocalización**
- 15 puntos de interés únicos en la Gran Vía
- Mapa interactivo con Google Maps
- Navegación GPS en tiempo real
- Detección automática de proximidad a puntos de interés

### 📸 **Sistema de Selfies Inteligente**
- **Nivel 1 - Básico**: Selfie simple en el punto de interés
- **Nivel 2 - Intermedio**: Selfie con buena composición y ángulo
- **Nivel 3 - Pro**: Selfie creativo y dramático
- Análisis de IA para evaluar calidad de selfies
- Sistema de puntuación y badges

### 🎵 **Audio Guías Inmersivas**
- Narraciones únicas para cada punto de interés
- Estilo narrativo moderno y entretenido
- Contenido histórico mezclado con cultura pop
- Reproductor de audio integrado

### 📱 **Gamificación**
- Sistema de niveles y experiencia
- Badges y logros desbloqueables
- Ranking de usuarios
- Progreso visual de la ruta

## 🏗️ Arquitectura Técnica

### **Frontend (React Native/Expo)**
```
frontend/
├── App.js                          # Componente principal
├── app.json                        # Configuración de Expo
├── package.json                    # Dependencias
├── constants/
│   └── Colors.ts                   # Sistema de colores
├── components/
│   └── AudioPlayer.js              # Reproductor de audio
├── screens/
│   ├── HomeScreen.js               # Pantalla principal
│   ├── AlbumScreen.js              # Galería de fotos
│   └── MapScreen_webview.js        # Mapa interactivo
└── services/
    └── SelfieAnalyzer.js           # Análisis de IA
```

### **Tecnologías Utilizadas**
- **React Native** con Expo
- **Expo Camera** para captura de fotos
- **Expo Location** para geolocalización
- **Expo Face Detector** para análisis facial
- **Expo AV** para reproducción de audio
- **React Native WebView** para mapas
- **Google Maps API** para cartografía

## 🎮 Funcionalidades del Juego

### **Sistema de Puntos de Interés**
1. **Palacio de Cibeles** - Punto de inicio épico
2. **Palacio de Linares** - Historia de fantasmas
3. **Banco de España** - Referencia a La Casa de Papel
4. **Minerva** - Diosa del Círculo de Bellas Artes
5. **Semáforo de 1926** - Primer semáforo de Madrid
6. **Edificio Metrópolis** - Icono arquitectónico
7. **Museo Chicote** - Bar histórico de celebridades
8. **WOW Concept** - Tienda futurista
9. **Edificio Telefónica** - Primer rascacielos
10. **Primark XXL** - Templo del fast fashion
11. **Edificio Carrión** - Neón de Schweppes
12. **Plaza de Callao** - Times Square madrileño
13. **Teatro Príncipe** - La Resistencia
14. **Teatros Musicales** - Broadway madrileño
15. **Plaza de España** - Final épico

### **Sistema de Análisis de Selfies**
- **Detección facial** con landmarks
- **Análisis de iluminación** automático
- **Evaluación de composición** visual
- **Detección de expresiones** dramáticas
- **Sistema de puntuación** inteligente

## 🎨 Diseño y UX

### **Paleta de Colores**
- **Primario**: #FFD93D (Amarillo dorado)
- **Secundario**: #FF6B9D (Rosa neón)
- **Acento**: #C44569 (Rosa oscuro)
- **Oscuro**: #2C3E50 (Azul oscuro)
- **Negro**: #000000

### **Elementos Visuales**
- **Gradientes dinámicos** para fondos
- **Efectos de cristal** (glassmorphism)
- **Animaciones fluidas** con React Native Animated
- **Iconografía moderna** con Ionicons
- **Tipografía bold** para impacto visual

## 🚀 Instalación y Configuración

### **Requisitos**
- Node.js 16+
- Expo CLI
- Android Studio / Xcode
- Cuenta de Google Maps API

### **Configuración**
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
expo start

# Ejecutar en Android
expo start --android

# Ejecutar en iOS
expo start --ios
```

### **Variables de Entorno**
```env
GOOGLE_MAPS_API_KEY=tu_api_key_aqui
EXPO_PUBLIC_API_URL=tu_backend_url
```

## 📊 Sistema de Puntuación

### **Cálculo de Puntos**
- **Nivel 1**: 30 puntos base + 20 por iluminación
- **Nivel 2**: 25 por ángulo + 25 por centrado
- **Nivel 3**: 30 por composición + 20 por expresión
- **Bonus**: Puntos extra por creatividad

### **Badges Disponibles**
- 🌱 **POSTUREITOR NOVICE** - Primeros pasos
- 🌟 **POSTUREITOR BEGINNER** - Nivel básico
- 🔥 **POSTUREITOR PRO** - Nivel intermedio
- 👑 **POSTUREITOR LEGEND** - Nivel profesional

## 🎯 Roadmap Futuro

### **Fase 2 - Social Features**
- [ ] Sistema de amigos
- [ ] Compartir selfies en redes sociales
- [ ] Challenges entre usuarios
- [ ] Ranking global

### **Fase 3 - Expansión**
- [ ] Nuevas rutas (Barrio de las Letras, Retiro)
- [ ] Realidad aumentada
- [ ] Integración con redes sociales
- [ ] Sistema de recompensas

### **Fase 4 - Monetización**
- [ ] Tienda de items virtuales
- [ ] Patrocinios de marcas
- [ ] Tours premium
- [ ] Merchandising

## 🤝 Contribución

### **Estructura del Código**
- **Componentes** en `/components`
- **Pantallas** en `/screens`
- **Servicios** en `/services`
- **Constantes** en `/constants`

### **Convenciones**
- **Naming**: PascalCase para componentes
- **Estilos**: StyleSheet.create()
- **Estado**: useState/useEffect hooks
- **Navegación**: React Navigation

## 📱 Capturas de Pantalla

### **Pantalla Principal**
- Dashboard con progreso del usuario
- Botones de acción principales
- Estadísticas en tiempo real

### **Mapa Interactivo**
- Puntos de interés marcados
- Ubicación del usuario
- Navegación GPS

### **Galería de Selfies**
- Grid de fotos con filtros
- Información de cada selfie
- Sistema de puntuación visual

## 🎉 Conclusión

**POSTURAITOR** representa una nueva forma de hacer turismo urbano, combinando tecnología, gamificación y cultura local para crear experiencias memorables. La app no solo muestra lugares, sino que los hace interactivos, divertidos y socialmente compartibles.

---

**Desarrollado con ❤️ para la Gran Vía de Madrid**

*"La mejor forma de conocer una ciudad es jugando con ella"*

