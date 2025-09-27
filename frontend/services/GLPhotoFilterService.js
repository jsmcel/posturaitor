import React from 'react';
import { Surface } from 'gl-react-expo';
import { Node, GLSL } from 'gl-react';
import ContrastSaturationBrightness from 'gl-react-contrast-saturation-brightness';

// Shader personalizado para efectos avanzados
const ColorMatrix = ({ children, matrix = [1,0,0,0,0, 0,1,0,0,0, 0,0,1,0,0, 0,0,0,1,0] }) => (
  <Node
    shader={{
      frag: GLSL`
        precision highp float;
        varying vec2 uv;
        uniform sampler2D children;
        uniform mat4 colorMatrix;
        
        void main() {
          vec4 color = texture2D(children, uv);
          gl_FragColor = colorMatrix * color;
        }
      `
    }}
    uniforms={{ children, colorMatrix: matrix }}
  />
);

// Shader para efectos sepia
const Sepia = ({ children, intensity = 1.0 }) => (
  <Node
    shader={{
      frag: GLSL`
        precision highp float;
        varying vec2 uv;
        uniform sampler2D children;
        uniform float intensity;
        
        void main() {
          vec4 color = texture2D(children, uv);
          vec3 sepia = vec3(
            dot(color.rgb, vec3(0.393, 0.769, 0.189)),
            dot(color.rgb, vec3(0.349, 0.686, 0.168)),
            dot(color.rgb, vec3(0.272, 0.534, 0.131))
          );
          gl_FragColor = vec4(mix(color.rgb, sepia, intensity), color.a);
        }
      `
    }}
    uniforms={{ children, intensity }}
  />
);

// Shader para efectos vintage
const Vintage = ({ children, intensity = 1.0 }) => (
  <Node
    shader={{
      frag: GLSL`
        precision highp float;
        varying vec2 uv;
        uniform sampler2D children;
        uniform float intensity;
        
        void main() {
          vec4 color = texture2D(children, uv);
          
          // Efecto vintage: reducir saturación y agregar tono cálido
          float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
          vec3 vintage = mix(vec3(gray), color.rgb, 0.7);
          vintage = mix(vintage, vintage * vec3(1.2, 1.0, 0.8), 0.3);
          
          // Vignette sutil
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(uv, center);
          float vignette = smoothstep(0.8, 0.2, dist);
          
          gl_FragColor = vec4(mix(color.rgb, vintage * vignette, intensity), color.a);
        }
      `
    }}
    uniforms={{ children, intensity }}
  />
);

// Shader para efecto dramático
const Dramatic = ({ children, intensity = 1.0 }) => (
  <Node
    shader={{
      frag: GLSL`
        precision highp float;
        varying vec2 uv;
        uniform sampler2D children;
        uniform float intensity;
        
        void main() {
          vec4 color = texture2D(children, uv);
          
          // Alto contraste y saturación
          vec3 dramatic = color.rgb;
          dramatic = pow(dramatic, vec3(0.8)); // Aumentar contraste
          dramatic = mix(vec3(dot(dramatic, vec3(0.299, 0.587, 0.114))), dramatic, 1.5); // Saturación
          
          gl_FragColor = vec4(mix(color.rgb, dramatic, intensity), color.a);
        }
      `
    }}
    uniforms={{ children, intensity }}
  />
);

export class GLPhotoFilterService {
  
  // Aplicar filtro usando gl-react
  static applyGLFilter(imageUri, filterId, intensity = 1.0, adjustments = {}) {
    const {
      brightness = 0,
      contrast = 0,
      saturation = 0
    } = adjustments;

    // Componente que renderiza la imagen con filtros
    const FilteredImage = () => {
      // Verificar que imageUri es válido
      if (!imageUri || typeof imageUri !== 'string') {
        return null;
      }

      let filteredImage = { uri: imageUri };

      // Aplicar ajustes básicos primero
      if (brightness !== 0 || contrast !== 0 || saturation !== 0) {
        filteredImage = (
          <ContrastSaturationBrightness
            contrast={1 + contrast}
            saturation={1 + saturation}
            brightness={brightness}
          >
            {filteredImage}
          </ContrastSaturationBrightness>
        );
      }

      // Aplicar filtro específico
      switch (filterId) {
        case 'sepia':
          return <Sepia intensity={intensity}>{filteredImage}</Sepia>;
        
        case 'vintage':
          return <Vintage intensity={intensity}>{filteredImage}</Vintage>;
        
        case 'dramatic':
          return <Dramatic intensity={intensity}>{filteredImage}</Dramatic>;
        
        case 'noir':
          return (
            <ContrastSaturationBrightness
              contrast={1.3}
              saturation={0}
              brightness={-0.1}
            >
              {filteredImage}
            </ContrastSaturationBrightness>
          );
        
        case 'warm':
          return (
            <ColorMatrix
              matrix={[
                1.2, 0, 0, 0, 0,
                0, 1.1, 0, 0, 0,
                0, 0, 0.8, 0, 0,
                0, 0, 0, 1, 0
              ]}
            >
              {filteredImage}
            </ColorMatrix>
          );
        
        case 'cool':
          return (
            <ColorMatrix
              matrix={[
                0.8, 0, 0, 0, 0,
                0, 1.0, 0, 0, 0,
                0, 0, 1.2, 0, 0,
                0, 0, 0, 1, 0
              ]}
            >
              {filteredImage}
            </ColorMatrix>
          );
        
        case 'heist':
          return (
            <ColorMatrix
              matrix={[
                1.1, 0.1, 0, 0, 0,
                0, 0.9, 0, 0, 0,
                0, 0, 0.8, 0, 0,
                0, 0, 0, 1, 0
              ]}
            >
              <ContrastSaturationBrightness
                contrast={1.25}
                saturation={1.2}
                brightness={-0.1}
              >
                {filteredImage}
              </ContrastSaturationBrightness>
            </ColorMatrix>
          );
        
        case 'gold':
          return (
            <ColorMatrix
              matrix={[
                1.3, 0.2, 0, 0, 0,
                0.1, 1.2, 0, 0, 0,
                0, 0, 0.7, 0, 0,
                0, 0, 0, 1, 0
              ]}
            >
              <ContrastSaturationBrightness
                contrast={1.15}
                saturation={1.3}
                brightness={0.15}
              >
                {filteredImage}
              </ContrastSaturationBrightness>
            </ColorMatrix>
          );
        
        case 'security':
          return (
            <ColorMatrix
              matrix={[
                0.8, 0, 0, 0, 0,
                0, 0.9, 0, 0, 0,
                0, 0.1, 1.2, 0, 0,
                0, 0, 0, 1, 0
              ]}
            >
              <ContrastSaturationBrightness
                contrast={1.2}
                saturation={1.1}
                brightness={0}
              >
                {filteredImage}
              </ContrastSaturationBrightness>
            </ColorMatrix>
          );
        
        default:
          return filteredImage;
      }
    };

    return FilteredImage;
  }

  // Renderizar imagen filtrada en Surface
  static renderFilteredImage(imageUri, filterId, intensity, adjustments, width, height) {
    const FilteredImage = this.applyGLFilter(imageUri, filterId, intensity, adjustments);
    
    return (
      <Surface style={{ width, height }}>
        <FilteredImage />
      </Surface>
    );
  }

  // Capturar imagen filtrada como URI
  static async captureFilteredImage(surfaceRef) {
    try {
      if (!surfaceRef.current) return null;
      
      const result = await surfaceRef.current.glView.capture();
      return result.uri;
    } catch (error) {
      console.error('Error capturing filtered image:', error);
      return null;
    }
  }

  // Obtener configuraciones de filtro predefinidas
  static getFilterPresets() {
    return {
      natural: { brightness: 0, contrast: 0, saturation: 0 },
      enhance: { brightness: 0.1, contrast: 0.15, saturation: 0.2 },
      dramatic: { brightness: 0.05, contrast: 0.4, saturation: 0.1 },
      vintage: { brightness: -0.05, contrast: 0.1, saturation: -0.3 },
      noir: { brightness: -0.1, contrast: 0.3, saturation: -1.0 },
      warm: { brightness: 0.1, contrast: 0, saturation: 0.15 },
      cool: { brightness: 0, contrast: 0.1, saturation: 0.1 },
      sepia: { brightness: 0.05, contrast: 0.1, saturation: -0.6 },
      heist: { brightness: -0.1, contrast: 0.25, saturation: 0.2 },
      gold: { brightness: 0.15, contrast: 0.15, saturation: 0.3 },
      security: { brightness: 0, contrast: 0.2, saturation: 0.1 }
    };
  }
}
