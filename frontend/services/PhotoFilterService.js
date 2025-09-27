import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export class PhotoFilterService {
  
  // Filtros temáticos por cada punto de la Gran Vía
  static getLocationFilters(stopId) {
    const filtersByLocation = {
      1: { // Palacio de Cibeles
        name: "Cibeles",
        filters: [
          { id: 'royal', name: '👑 Real', description: 'Elegancia dorada' },
          { id: 'vintage', name: '📜 Vintage', description: 'Nostalgia clásica' },
          { id: 'dramatic', name: '🎭 Dramático', description: 'Alto contraste' }
        ]
      },
      2: { // Casa del Libro
        name: "Literario",
        filters: [
          { id: 'sepia', name: '📚 Sepia', description: 'Como páginas antiguas' },
          { id: 'noir', name: '🖤 Noir', description: 'Misterio literario' },
          { id: 'warm', name: '☕ Cálido', description: 'Café y libros' }
        ]
      },
      3: { // Banco de España
        name: "Atraco",
        filters: [
          { id: 'heist', name: '💰 Atraco', description: 'Estilo Casa de Papel' },
          { id: 'gold', name: '🏆 Dorado', description: 'Lujo y poder' },
          { id: 'security', name: '🔒 Seguridad', description: 'Azules intensos' }
        ]
      },
      4: { // Edificio Metrópolis
        name: "Arquitectónico", 
        filters: [
          { id: 'architecture', name: '🏛️ Clásico', description: 'Líneas perfectas' },
          { id: 'sunset', name: '🌅 Atardecer', description: 'Dorados cálidos' },
          { id: 'urban', name: '🏙️ Urbano', description: 'Contrastes modernos' }
        ]
      },
      5: { // Círculo de Bellas Artes
        name: "Artístico",
        filters: [
          { id: 'artistic', name: '🎨 Artístico', description: 'Colores vibrantes' },
          { id: 'sketch', name: '✏️ Boceto', description: 'Como un dibujo' },
          { id: 'pop', name: '💥 Pop Art', description: 'Colores saturados' }
        ]
      }
    };

    return filtersByLocation[stopId] || {
      name: "Clásico",
      filters: [
        { id: 'natural', name: '🌟 Natural', description: 'Sin filtro' },
        { id: 'enhance', name: '✨ Realzado', description: 'Mejora automática' },
        { id: 'cool', name: '❄️ Fresco', description: 'Tonos fríos' }
      ]
    };
  }

  // Aplicar filtro específico a una imagen
  static async applyFilter(imageUri, filterId, intensity = 1.0) {
    try {
      console.log(`🎨 Aplicando filtro ${filterId} con intensidad ${intensity}`);

      if (filterId === 'natural') {
        return imageUri; // Sin cambios
      }

      const filterActions = this.getFilterActions(filterId, intensity);
      
      const result = await manipulateAsync(
        imageUri,
        filterActions,
        {
          compress: 0.9,
          format: SaveFormat.JPEG,
        }
      );

      return result.uri;
    } catch (error) {
      console.error('Error applying filter:', error);
      return imageUri; // Fallback a imagen original
    }
  }

  // Obtener acciones de filtro compatibles con expo-image-manipulator
  static getFilterActions(filterId, intensity) {
    // IMPORTANTE: expo-image-manipulator solo soporta: resize, rotate, flip, crop
    // No soporta brightness, contrast, saturation
    
    // Por ahora, solo aplicamos transformaciones básicas que SÍ funcionan
    const configs = {
      'royal': [
        // Efecto dorado: rotar ligeramente para efecto "elegante"
        { rotate: 0.5 * intensity }
      ],
      'vintage': [
        // Efecto vintage: sin cambios por ahora
      ],
      'dramatic': [
        // Efecto dramático: sin cambios por ahora  
      ],
      'sepia': [
        // Efecto sepia: sin cambios por ahora
      ],
      'noir': [
        // Efecto noir: sin cambios por ahora
      ],
      'warm': [
        // Efecto cálido: sin cambios por ahora
      ],
      'heist': [
        // Efecto atraco: sin cambios por ahora
      ],
      'gold': [
        // Efecto dorado: sin cambios por ahora
      ],
      'security': [
        // Efecto seguridad: sin cambios por ahora
      ],
      'architecture': [
        // Efecto arquitectónico: sin cambios por ahora
      ],
      'sunset': [
        // Efecto atardecer: sin cambios por ahora
      ],
      'urban': [
        // Efecto urbano: sin cambios por ahora
      ],
      'artistic': [
        // Efecto artístico: sin cambios por ahora
      ],
      'sketch': [
        // Efecto boceto: sin cambios por ahora
      ],
      'pop': [
        // Efecto pop: sin cambios por ahora
      ]
    };

    return configs[filterId] || [];
  }

  // Aplicar filtro B&N real usando procesamiento de imagen
  static async applyBlackWhiteFilter(imageUri) {
    try {
      console.log('⚫ Aplicando filtro B&N real...');
      
      // Para crear un efecto B&N real, necesitaríamos una librería como react-native-image-filter-kit
      // Por ahora, vamos a usar un enfoque alternativo con manipulación de la imagen
      
      // Crear múltiples versiones con diferentes contrastes y combinarlas
      const manipulations = [
        // Reducir la saturación simulando B&N
        { resize: { width: 1, height: 1 } }, // Crear una versión muy pequeña
      ];

      const result = await manipulateAsync(
        imageUri,
        manipulations,
        {
          compress: 0.9,
          format: SaveFormat.JPEG,
        }
      );

      // Por ahora, devolvemos la imagen original
      // En una implementación completa usaríamos react-native-image-filter-kit
      console.log('⚠️ Filtro B&N simulado (requiere librería adicional)');
      return imageUri;
    } catch (error) {
      console.error('Error applying B&W filter:', error);
      return imageUri;
    }
  }

  // Aplicar múltiples ajustes de edición
  static async applyEdits(imageUri, edits) {
    try {
      console.log('✏️ Aplicando ediciones:', edits);

      const manipulations = [];
      
      // IMPORTANTE: Solo usar acciones soportadas por expo-image-manipulator
      // Soportadas: resize, rotate, flip, crop
      
      if (edits.rotate && edits.rotate !== 0) {
        manipulations.push({ rotate: edits.rotate });
      }
      if (edits.crop) {
        manipulations.push({ crop: edits.crop });
      }
      if (edits.flip) {
        // expo-image-manipulator acepta flip como string, no como objeto
        if (edits.flip.horizontal) {
          manipulations.push({ flip: 'horizontal' });
        } else if (edits.flip.vertical) {
          manipulations.push({ flip: 'vertical' });
        }
      }
      
      // Aplicar filtro B&N si está especificado
      if (edits.blackWhite) {
        return await this.applyBlackWhiteFilter(imageUri);
      }
      
      // NOTA: brightness, contrast, saturation NO están soportados
      // Los sliders pueden moverse pero no aplicarán cambios visuales
      // Para implementar estos efectos necesitaríamos usar otra librería

      // Si no hay manipulaciones válidas, devolver imagen original
      if (manipulations.length === 0) {
        console.log('⚠️ No hay ediciones válidas para aplicar');
        return imageUri;
      }

      const result = await manipulateAsync(
        imageUri,
        manipulations,
        {
          compress: 0.9,
          format: SaveFormat.JPEG
        }
      );

      return result.uri;
    } catch (error) {
      console.error('Error applying edits:', error);
      return imageUri;
    }
  }

  // Crear collage con múltiples fotos
  static async createCollage(imageUris, layout = 'grid') {
    try {
      console.log('🖼️ Creando collage con layout:', layout);
      
      // Por ahora retornamos la primera imagen
      // En una implementación completa, usaríamos Canvas o similar
      return imageUris[0];
    } catch (error) {
      console.error('Error creating collage:', error);
      return imageUris[0];
    }
  }

  // Agregar marcos temáticos
  static async addFrame(imageUri, frameType, stopId) {
    try {
      console.log(`🖼️ Agregando marco ${frameType} para punto ${stopId}`);
      
      const frame = this.getFrameForLocation(stopId, frameType);
      
      // Por ahora retornamos la imagen original
      // En implementación completa, overlay del marco
      return imageUri;
    } catch (error) {
      console.error('Error adding frame:', error);
      return imageUri;
    }
  }

  // Obtener marcos por ubicación
  static getFrameForLocation(stopId, frameType) {
    const frames = {
      1: { // Cibeles
        elegant: 'Marcos dorados elegantes',
        royal: 'Marcos reales con coronas',
        classic: 'Marcos clásicos'
      },
      3: { // Banco de España
        heist: 'Marcos estilo atraco',
        vault: 'Marcos de caja fuerte',
        money: 'Marcos con billetes'
      },
      5: { // Bellas Artes
        artistic: 'Marcos artísticos',
        canvas: 'Marcos de lienzo',
        gallery: 'Marcos de galería'
      }
    };

    return frames[stopId]?.[frameType] || 'Marco básico';
  }

  // Stickers animados por ubicación
  static getStickersForLocation(stopId) {
    const stickers = {
      1: [ // Cibeles
        { id: 'crown', name: '👑', animated: true, description: 'Corona real' },
        { id: 'fountain', name: '⛲', animated: false, description: 'Fuente' },
        { id: 'palace', name: '🏛️', animated: false, description: 'Palacio' }
      ],
      3: [ // Banco de España
        { id: 'money', name: '💰', animated: true, description: 'Dinero' },
        { id: 'mask', name: '🎭', animated: false, description: 'Máscara Dalí' },
        { id: 'vault', name: '🔒', animated: true, description: 'Caja fuerte' }
      ],
      4: [ // Metrópolis
        { id: 'building', name: '🏢', animated: false, description: 'Edificio' },
        { id: 'star', name: '⭐', animated: true, description: 'Estrella' },
        { id: 'architecture', name: '📐', animated: false, description: 'Arquitectura' }
      ],
      5: [ // Bellas Artes
        { id: 'palette', name: '🎨', animated: true, description: 'Paleta' },
        { id: 'brush', name: '🖌️', animated: false, description: 'Pincel' },
        { id: 'art', name: '🖼️', animated: false, description: 'Arte' }
      ]
    };

    return stickers[stopId] || [
      { id: 'posturaitor', name: '📸', animated: true, description: 'POSTURAITOR' },
      { id: 'madrid', name: '❤️', animated: true, description: 'Madrid' }
    ];
  }

  // Generar vista previa de filtro
  static async generateFilterPreview(imageUri, filterId) {
    try {
      // Crear versión pequeña para preview rápido
      const preview = await manipulateAsync(
        imageUri,
        [{ resize: { width: 150, height: 150 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );

      // Aplicar filtro a preview
      return await this.applyFilter(preview.uri, filterId, 0.8);
    } catch (error) {
      console.error('Error generating filter preview:', error);
      return imageUri;
    }
  }

  // Guardar configuración de filtros favoritos
  static async saveFavoriteFilter(userId, filterId, settings) {
    try {
      const favorites = await this.getFavoriteFilters(userId);
      favorites[filterId] = {
        ...settings,
        savedAt: new Date().toISOString(),
        usageCount: (favorites[filterId]?.usageCount || 0) + 1
      };

      await FileSystem.writeAsStringAsync(
        `${FileSystem.documentDirectory}favorite_filters_${userId}.json`,
        JSON.stringify(favorites)
      );

      console.log('💾 Filtro favorito guardado:', filterId);
    } catch (error) {
      console.error('Error saving favorite filter:', error);
    }
  }

  // Obtener filtros favoritos
  static async getFavoriteFilters(userId) {
    try {
      const filePath = `${FileSystem.documentDirectory}favorite_filters_${userId}.json`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(filePath);
        return JSON.parse(content);
      }
      
      return {};
    } catch (error) {
      console.error('Error getting favorite filters:', error);
      return {};
    }
  }

  // Obtener filtros trending
  static getTrendingFilters() {
    return [
      { id: 'heist', name: '💰 Atraco', usage: 1250, trend: '+15%' },
      { id: 'royal', name: '👑 Real', usage: 980, trend: '+8%' },
      { id: 'artistic', name: '🎨 Artístico', usage: 750, trend: '+22%' },
      { id: 'dramatic', name: '🎭 Dramático', usage: 650, trend: '+5%' },
      { id: 'vintage', name: '📜 Vintage', usage: 580, trend: '+12%' }
    ];
  }

  // Crear filtro personalizado
  static createCustomFilter(name, settings) {
    return {
      id: `custom_${Date.now()}`,
      name: name,
      custom: true,
      settings: settings,
      createdAt: new Date().toISOString()
    };
  }
}
