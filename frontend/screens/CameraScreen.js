import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { SocialShareService } from '../services/SocialShareService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StyledAlert from '../components/StyledAlert';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { getLevelChallenge, getLevelDescriptions } from '../constants/challenges';
import { useMediaPipeFaceTracker, evaluateSelfieWithMediaPipe, mediaPipeFaceDetectorSettings } from '../services/MediaPipeSelfieEvaluator';

const { width, height } = Dimensions.get('window');

export default function CameraScreen({ navigation, route }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('front'); // Default to front camera (selfie mode)
  const [isReady, setIsReady] = useState(true);
  const cameraRef = useRef(null);
  const mediaPipeTracker = useMediaPipeFaceTracker();
  const userLocation = route.params?.userLocation || null;
  
  // Estados para filtros en tiempo real
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [showFilters, setShowFilters] = useState(false);

  // Estados para los diálogos bonitos - Sistema mejorado
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const [alertQueue, setAlertQueue] = useState([]);
  const [isShowingAlert, setIsShowingAlert] = useState(false);

  const showStyledAlert = (title, message, buttons, titleIcon = null) => {
    // Si ya hay un alert visible, cerrarlo primero
    if (isShowingAlert) {
      closeCurrentAlert();
    }
    
    // Esperar un poco para que se cierre el anterior
    setTimeout(() => {
      setAlertConfig({ title, message, buttons, titleIcon });
      setAlertVisible(true);
      setIsShowingAlert(true);
    }, 200);
  };

  const closeCurrentAlert = () => {
    setAlertVisible(false);
    setIsShowingAlert(false);
    setAlertConfig({});
  };

  // Filtros disponibles para la cámara - usando overlay de colores
  const cameraFilters = [
    { id: 'none', name: 'Sin Filtro', emoji: '📷', overlay: null, type: 'color' },
    { id: 'blackwhite', name: 'B&N', emoji: '⚫', overlay: null, type: 'grayscale' },
    { id: 'vintage', name: 'Vintage', emoji: '📜', overlay: 'rgba(139, 69, 19, 0.4)', type: 'color' },
    { id: 'warm', name: 'Cálido', emoji: '☀️', overlay: 'rgba(255, 165, 0, 0.3)', type: 'color' },
    { id: 'cool', name: 'Fresco', emoji: '❄️', overlay: 'rgba(0, 191, 255, 0.3)', type: 'color' },
    { id: 'sepia', name: 'Sepia', emoji: '🤎', overlay: 'rgba(160, 82, 45, 0.4)', type: 'color' }
  ];

  const handleFilterSelect = (filterId) => {
    setSelectedFilter(filterId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Mostrar feedback visual temporal
    if (filterId !== 'none') {
      const filterName = cameraFilters.find(f => f.id === filterId)?.name;
      console.log(`🎨 Filtro aplicado: ${filterName}`);
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const showShareMenu = (imageUri, selfieData) => {
    // Cerrar cualquier alert anterior primero
    closeCurrentAlert();
    
    // Usar setTimeout para asegurar que el estado se actualice
    setTimeout(() => {
      showStyledAlert(
        '📱 Compartir POSTURAITOR',
        '¿Dónde quieres compartir tu selfie?',
      [
        {
          text: '💚 WhatsApp',
          onPress: () => SocialShareService.shareToWhatsApp(imageUri, selfieData)
        },
        {
          text: '🐦 X (Twitter)',
          onPress: () => SocialShareService.shareToTwitter(imageUri, selfieData)
        },
        {
          text: '📷 Instagram',
          onPress: () => SocialShareService.shareToInstagram(imageUri, selfieData)
        },
        {
          text: '📤 Más opciones',
          onPress: () => SocialShareService.shareGeneric(imageUri, selfieData)
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ],
      'share'
      );
    }, 300);
  };

  useEffect(() => {
    (async () => {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        showStyledAlert(
          'Permiso Denegado',
          'Necesitamos acceso a la cámara para tomar selfies increíbles.',
          [{ text: 'Entendido', style: 'cancel' }],
          'camera-off'
        );
      }
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current && isReady) {
      try {
        // Haptic feedback de captura (como el shutter de una cámara real)
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        // Haptic feedback de éxito tras capturar
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        

        // Si viene con un nivel pre-seleccionado desde PointDetail, analizar automáticamente
        if (route.params?.targetLevel && route.params?.autoAnalyze) {
          const point = route.params.point;
          const targetLevel = route.params.targetLevel;
          
          showStyledAlert(
            '📸 ¡Foto Tomada!',
            `Analizando automáticamente para el Nivel ${targetLevel}...`,
            [],
            'camera'
          );
          
          // Esperar un poco para mostrar el mensaje y luego analizar
          setTimeout(() => {
            analyzeSelfie(photo.uri, point, targetLevel);
          }, 1500);
        } else {
          // Flujo original si no viene pre-configurado
          showStyledAlert(
            '¡Foto Tomada!',
            '¿Quieres analizar esta selfie con nuestra IA avanzada?',
            [
              { text: 'Cancelar', style: 'cancel' },
              { 
                text: '🎯 Seleccionar Nivel', 
                onPress: () => selectLevelAndAnalyze(photo.uri)
              },
            ],
            'camera'
          );
        }
      } catch (error) {
        console.log('Error taking picture:', error);
        showStyledAlert(
          'Error',
          'No se pudo tomar la foto. Inténtalo de nuevo.',
          [{ text: 'OK', style: 'cancel' }],
          'alert-circle'
        );
      }
    }
  };

  const selectLevelAndAnalyze = async (imageUri) => {
    try {
      const point = route.params?.point || {
        id: 3,
        name: 'Banco de Espana',
        hashtag: '#ModoAtraco',
      };

      const levelDescriptions = getLevelDescriptions(point.id);

      showStyledAlert(
        'Selecciona tu Nivel',
        `Elige la dificultad para ${point.name}:

Nivel 1: ${levelDescriptions[1]}
Nivel 2: ${levelDescriptions[2]}
Nivel 3: ${levelDescriptions[3]}`,
        [
          {
            text: 'Nivel 1 - Principiante',
            onPress: () => showLevelDetails(imageUri, point, 1, getLevelChallenge(point.id, 1)),
          },
          {
            text: 'Nivel 2 - Intermedio',
            onPress: () => showLevelDetails(imageUri, point, 2, getLevelChallenge(point.id, 2)),
          },
          {
            text: 'Nivel 3 - Experto',
            onPress: () => showLevelDetails(imageUri, point, 3, getLevelChallenge(point.id, 3)),
          },
          {
            text: 'Cancelar',
            style: 'cancel',
          },
        ],
        'trophy'
      );
    } catch (error) {
      showStyledAlert(
        'Error',
        'No se pudo procesar la imagen: ' + error.message,
        [{ text: 'OK', style: 'cancel' }],
        'alert-circle'
      );
    }
  };

  const showLevelDetails = (imageUri, point, level, levelConfig) => {
    const levelIcons = { 1: 'medal', 2: 'trophy', 3: 'star' };

    const rules = levelConfig?.rules || {};
    const detailLines = [levelConfig?.description || 'Requisitos generales del nivel.'];

    if (rules.requiredFilterId) {
      detailLines.push(`Filtro requerido: ${rules.requiredFilterId}`);
    } else if (rules.requireFilter) {
      detailLines.push('Aplica cualquier filtro especial para este nivel.');
    }

    if (Array.isArray(rules.manualChecks) && rules.manualChecks.length) {
      detailLines.push(...rules.manualChecks);
    }

    const detailsText = detailLines.join('\n');

    showStyledAlert(
      `Nivel ${level} - ${point.name}`,
      `Requisitos:
${detailsText}

Proceder con el analisis en el movil?`,
      [
        {
          text: 'Cambiar Nivel',
          onPress: () => selectLevelAndAnalyze(imageUri),
        },
        {
          text: `Analizar Nivel ${level}`,
          onPress: () => analyzeSelfie(imageUri, point, level),
        },
      ],
      levelIcons[level]
    );
  };

  const analyzeSelfie = async (imageUri, point, targetLevel) => {
    try {
      showStyledAlert(
        'Analizando...',
        `La IA esta evaluando tu selfie para el Nivel ${targetLevel}...\n\nEsto puede tardar unos segundos.`,
        [],
        'analytics'
      );

      const evaluation = await evaluateSelfieWithMediaPipe({
        imageUri,
        point,
        userLocation,
        faceTracker: mediaPipeTracker,
        selectedFilter,
      });

      if (mediaPipeTracker?.resetFace) {
        mediaPipeTracker.resetFace();
      }

      closeCurrentAlert();

      if (!evaluation || evaluation.status === 'needs_face') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showStyledAlert(
          'Necesitamos verte',
          'No pudimos detectar tu rostro con suficiente claridad. Mejora la iluminacion, acerca el movil y mantente dentro del marco.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Reintentar', onPress: () => analyzeSelfie(imageUri, point, targetLevel) },
          ],
          'warning'
        );
        return;
      }

      if (evaluation.status && evaluation.status !== 'ok') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showStyledAlert(
          'Analisis incompleto',
          'Hubo un problema al evaluar la selfie. Intentalo de nuevo en unos segundos.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Reintentar', onPress: () => analyzeSelfie(imageUri, point, targetLevel) },
          ],
          'warning'
        );
        return;
      }

      const levelResults = evaluation.levelResults || {};
      const fallbackEvaluation = {
        met: false,
        achieved: false,
        score: 0,
        percentage: 0,
        maxScore: 100,
        requirements: [],
        details: ['Sin evaluacion disponible para este nivel.'],
      };
      const levelEvaluation = levelResults[targetLevel] || fallbackEvaluation;

      const achievedLevel = levelEvaluation.met ? targetLevel : evaluation.achievedLevel || 0;
      const percentage = Math.round((levelEvaluation.percentage ?? levelEvaluation.score ?? 0));
      const scoreValue = Math.round(levelEvaluation.score ?? 0);
      const maxScore = levelEvaluation.maxScore ?? 100;
      const detailBody = levelEvaluation.details && levelEvaluation.details.length
        ? levelEvaluation.details.join('\n')
        : 'Sin detalles disponibles.';

      const finalResult = {
        ...evaluation,
        targetLevel,
        achievedLevel,
        levelEvaluation,
        analysisSource: 'mediapipe_local',
      };

      await saveSelfieToAlbum(imageUri, point, finalResult);

      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
      const levelText = levelEvaluation.met
        ? pick([
            `🔥 NIVEL ${targetLevel} CONSEGUIDO`,
            `💯 L${targetLevel} UNLOCKED`,
            `✅ L${targetLevel} OK`,
          ])
        : pick([
            `Casi L${targetLevel}…`,
            `No cae L${targetLevel} aún`,
            `Otra toma y cae L${targetLevel}`,
          ]);

      if (levelEvaluation.met) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const summaryMessage = [
        evaluation.message || 'Analisis completado.',
        '',
        `Lugar: ${point.name}`,
        `Nivel objetivo: ${targetLevel}`,
        `Nivel alcanzado: ${achievedLevel}`,
        `Cumplimiento: ${percentage}%`,
        `Puntos: ${scoreValue}/${maxScore}`,
        '',
        'Detalles:',
        detailBody,
        '',
        'Selfie guardada en el album',
      ].join('\n');

      showStyledAlert(
        levelText,
        summaryMessage,
        [
          {
            text: 'Editar Foto',
            onPress: () => {
              navigation.navigate('PhotoEditor', {
                imageUri,
                stopId: point.id,
                selfieData: finalResult,
              });
            },
          },
          {
            text: 'Compartir Directo',
            onPress: () => {
              showShareMenu(imageUri, {
                stopName: point.name,
                hashtag: point.hashtag,
                analysis: detailBody,
                achievedLevel: finalResult.achievedLevel,
                targetLevel: finalResult.targetLevel,
                percentage,
              });
            },
          },
          { text: 'Ver Album', onPress: () => navigation.navigate('Album') },
          {
            text: levelEvaluation.met ? 'Continuar Ruta' : 'Intentar Otro Nivel',
            onPress: () =>
              levelEvaluation.met ? navigation.navigate('Map') : selectLevelAndAnalyze(imageUri),
            style: 'cancel',
          },
        ],
        levelEvaluation.met ? 'checkmark-circle' : 'warning'
      );
    } catch (error) {
      console.error('Error analyzing selfie:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      closeCurrentAlert();
      showStyledAlert(
        'Error en el analisis',
        'No se pudo analizar la selfie. Quieres intentarlo de nuevo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Reintentar', onPress: () => selectLevelAndAnalyze(imageUri) },
        ],
        'alert-circle'
      );
    }
  };

  const saveSelfieToAlbum = async (imageUri, point, analysisResult) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        showStyledAlert(
          'Permiso Denegado',
          'No se pueden guardar fotos en la galería del dispositivo.',
          [{ text: 'Entendido', style: 'cancel' }],
          'folder-open'
        );
        return;
      }

      let finalUri = imageUri;

      try {
        const asset = await MediaLibrary.saveToLibraryAsync(imageUri);
        if (asset && asset.uri) {
          finalUri = asset.uri;
          console.log('✅ Foto guardada exitosamente en la galería del dispositivo.');
        } else {
          console.warn('⚠️ MediaLibrary.saveToLibraryAsync no devolvió un asset válido. Usando URI temporal como fallback.');
          showStyledAlert(
            'Aviso de Almacenamiento',
            'La foto no se pudo guardar en la galería de tu dispositivo (posible limitación de Expo Go), pero se ha guardado en el álbum interno de la aplicación.',
            [{ text: 'Entendido', style: 'cancel' }],
            'information-circle'
          );
        }
      } catch (mediaError) {
        console.error('❌ Error al guardar en MediaLibrary, usando URI temporal como fallback:', mediaError);
         showStyledAlert(
            'Error de Galería',
            'Hubo un error al intentar guardar la foto en la galería. Se usará una copia temporal en el álbum de la app.',
            [{ text: 'Entendido', style: 'cancel' }],
            'warning'
          );
      }
      
      const selfieData = {
        id: Date.now(),
        uri: finalUri,
        stopId: point.id,
        stopName: point.name,
        hashtag: point.hashtag,
        timestamp: new Date(),
        analysis: analysisResult.levelEvaluation?.details || [],
        targetLevel: analysisResult.targetLevel,
        achievedLevel: analysisResult.achievedLevel,
        selfieLevel: analysisResult.achievedLevel,
        rating: analysisResult.levelEvaluation?.score || 0,
        maxRating: analysisResult.levelEvaluation?.maxScore || 100,
        percentage: analysisResult.levelEvaluation?.percentage || 0,
        badge: analysisResult.badge
      };

      const existingSelfies = await getSavedSelfies();
      const updatedSelfies = [...existingSelfies, selfieData];
      await saveSelfies(updatedSelfies);

      console.log('✅ Selfie guardada exitosamente en el álbum:', selfieData);
    } catch (error) {
      console.error('❌ Error saving selfie to album:', error);
    }
  };

  const getSavedSelfies = async () => {
    try {
      const savedSelfies = await AsyncStorage.getItem('posturaitor_selfies');
      return savedSelfies ? JSON.parse(savedSelfies) : [];
    } catch (error) {
      console.error('Error getting saved selfies:', error);
      return [];
    }
  };

  const saveSelfies = async (selfies) => {
    try {
      await AsyncStorage.setItem('posturaitor_selfies', JSON.stringify(selfies));
      console.log('Selfies saved:', selfies.length);
    } catch (error) {
      console.error('Error saving selfies:', error);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No se concedieron permisos de cámara</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Conceder permisos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        faceDetectorEnabled
        faceDetectorSettings={mediaPipeFaceDetectorSettings}
        onFacesDetected={mediaPipeTracker.onFacesDetected}
      >
            <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFD93D" />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>POSTURAITOR Camera</Text>
              {route.params?.targetLevel && (
                <Text style={styles.levelIndicator}>
                  🎯 Nivel {route.params.targetLevel}
                </Text>
              )}
            </View>
            
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
            >
              <Ionicons name="camera-reverse" size={24} color="#FFD93D" />
            </TouchableOpacity>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              disabled={!isReady}
            >
              <View style={styles.captureButtonInner}>
                <Ionicons name="camera" size={30} color="#000" />
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
        
          {/* Overlay de filtro seleccionado */}
          {selectedFilter !== 'none' && (
            <View 
              style={[
                styles.filterOverlay,
                selectedFilter === 'blackwhite' ? styles.blackWhiteOverlay :
                { backgroundColor: cameraFilters.find(f => f.id === selectedFilter)?.overlay }
              ]}
            />
          )}
        
        {/* Selector de filtros */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <BlurView intensity={20} style={styles.filtersBlur}>
              <View style={styles.filtersHeader}>
                <Text style={styles.filtersTitle}>🎨 Filtros</Text>
                <TouchableOpacity onPress={toggleFilters}>
                  <Ionicons name="close" size={24} color="#FFD93D" />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersScroll}
              >
                {cameraFilters.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterButton,
                      selectedFilter === filter.id && styles.filterButtonActive
                    ]}
                    onPress={() => handleFilterSelect(filter.id)}
                  >
                    <Text style={styles.filterEmoji}>{filter.emoji}</Text>
                    <Text style={[
                      styles.filterName,
                      selectedFilter === filter.id && styles.filterNameActive
                    ]}>
                      {filter.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </BlurView>
          </View>
        )}
        
        {/* Botón para mostrar/ocultar filtros */}
        <TouchableOpacity
          style={styles.filterToggleButton}
          onPress={toggleFilters}
        >
          <LinearGradient
            colors={selectedFilter !== 'none' ? 
              ['rgba(255,107,157,0.9)', 'rgba(196,69,105,0.9)'] : 
              ['rgba(255,217,61,0.8)', 'rgba(255,107,157,0.8)']
            }
            style={styles.filterToggleGradient}
          >
            <Ionicons 
              name={showFilters ? "close" : "color-palette"} 
              size={24} 
              color="#000" 
            />
            {selectedFilter !== 'none' && (
              <View style={styles.filterIndicator}>
                <Text style={styles.filterIndicatorText}>●</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </CameraView>

      <StyledAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons || []}
        titleIcon={alertConfig.titleIcon}
        onClose={closeCurrentAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    padding: 10,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD93D',
  },
  levelIndicator: {
    fontSize: 14,
    color: '#FF6B9D',
    fontWeight: '600',
    marginTop: 2,
  },
  controls: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD93D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD93D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: '#FFD93D',
    textAlign: 'center',
    margin: 20,
  },
  button: {
    backgroundColor: '#FFD93D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 20,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Estilos para filtros
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  blackWhiteOverlay: {
    backgroundColor: 'rgba(128, 128, 128, 0.6)',
    opacity: 0.8,
  },
  filtersContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
  },
  filtersBlur: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 15,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD93D',
  },
  filtersScroll: {
    paddingHorizontal: 5,
  },
  filterButton: {
    alignItems: 'center',
    marginHorizontal: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 70,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255,217,61,0.2)',
    borderColor: '#FFD93D',
  },
  filterEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  filterName: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  filterNameActive: {
    color: '#FFD93D',
  },
  filterToggleButton: {
    position: 'absolute',
    right: 20,
    bottom: 200,
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  filterToggleGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD93D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIndicatorText: {
    fontSize: 8,
    color: '#000',
    fontWeight: 'bold',
  },
});
