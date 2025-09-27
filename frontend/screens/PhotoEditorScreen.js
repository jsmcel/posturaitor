import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { PhotoFilterService } from '../services/PhotoFilterService';
import { SocialShareService } from '../services/SocialShareService';
import StyledAlert from '../components/StyledAlert';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function PhotoEditorScreen({ navigation, route }) {
  const { imageUri, stopId, selfieData } = route.params;
  
  const [editedImageUri, setEditedImageUri] = useState(imageUri);
  const [editMode, setEditMode] = useState('adjust'); // 'filters', 'adjust', 'stickers', 'frames'
  const [isProcessing, setIsProcessing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // Ajustes manuales
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    warmth: 0,
    vignette: 0
  });

  const [selectedStickers, setSelectedStickers] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const surfaceRef = useRef(null);
  
  // Estados para StyledAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const showStyledAlert = (title, message, buttons, titleIcon = null) => {
    setAlertConfig({ title, message, buttons, titleIcon });
    setAlertVisible(true);
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Obtener stickers para la ubicación actual
  const stickers = PhotoFilterService.getStickersForLocation(stopId);


  const handleRotate = async (degrees) => {
    if (isProcessing) return;
    
    // Haptic feedback inmediato
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setIsProcessing(true);
    
    try {
      const rotatedImage = await PhotoFilterService.applyEdits(editedImageUri || imageUri, {
        rotate: degrees
      });
      setEditedImageUri(rotatedImage);
      
      // Haptic feedback de éxito
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      console.log(`✏️ Imagen rotada ${degrees} grados`);
    } catch (error) {
      console.error('Error rotating image:', error);
      
      // Haptic feedback de error
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      showStyledAlert('Error', 'No se pudo rotar la imagen', [
        { text: 'OK', style: 'cancel' }
      ], 'alert-circle');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFlip = async () => {
    if (isProcessing) return;
    
    // Haptic feedback inmediato
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setIsProcessing(true);
    
    try {
      const flippedImage = await PhotoFilterService.applyEdits(editedImageUri || imageUri, {
        flip: { horizontal: true }
      });
      setEditedImageUri(flippedImage);
      
      // Haptic feedback de éxito
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      console.log('✏️ Imagen volteada horizontalmente');
    } catch (error) {
      console.error('Error flipping image:', error);
      
      // Haptic feedback de error
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      showStyledAlert('Error', 'No se pudo voltear la imagen', [
        { text: 'OK', style: 'cancel' }
      ], 'alert-circle');
    } finally {
      setIsProcessing(false);
    }
  };

  const addSticker = (sticker) => {
    setSelectedStickers([...selectedStickers, {
      ...sticker,
      id: `${sticker.id}_${Date.now()}`,
      x: Math.random() * (width - 50),
      y: Math.random() * (height * 0.4) + height * 0.2,
      scale: 1,
      rotation: 0
    }]);
  };

  const removeSticker = (stickerId) => {
    setSelectedStickers(selectedStickers.filter(s => s.id !== stickerId));
  };

  const saveEditedPhoto = async () => {
    if (isProcessing) return;
    
    // Haptic feedback inmediato
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setIsProcessing(true);
    
    try {
      // Haptic feedback de éxito
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      showStyledAlert(
        '💾 Foto Editada Guardada',
        '¡Tu obra maestra está lista!',
        [
          {
            text: '📤 Compartir',
            onPress: () => {
              showShareMenu(editedImageUri);
            }
          },
          {
            text: '📸 Ver Álbum',
            onPress: () => navigation.navigate('Album')
          },
          {
            text: 'Continuar',
            style: 'cancel'
          }
        ],
        'checkmark-circle'
      );
    } catch (error) {
      // Haptic feedback de error
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      showStyledAlert('Error', 'No se pudo guardar la foto', [
        { text: 'OK', style: 'cancel' }
      ], 'alert-circle');
    } finally {
      setIsProcessing(false);
    }
  };

  const showShareMenu = (imageUri) => {
    showStyledAlert(
      '📱 Compartir POSTURAITOR',
      '¿Dónde quieres compartir tu selfie editada?',
      [
        {
          text: '💚 WhatsApp',
          onPress: () => SocialShareService.shareToWhatsApp(imageUri, {
            ...selfieData,
            edited: true
          })
        },
        {
          text: '🐦 X (Twitter)',
          onPress: () => SocialShareService.shareToTwitter(imageUri, {
            ...selfieData,
            edited: true
          })
        },
        {
          text: '📷 Instagram',
          onPress: () => SocialShareService.shareToInstagram(imageUri, {
            ...selfieData,
            edited: true
          })
        },
        {
          text: '📤 Más opciones',
          onPress: () => SocialShareService.shareGeneric(imageUri, {
            ...selfieData,
            edited: true
          })
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ],
      'share'
    );
  };


  const renderAdjustmentSlider = (key, label, min = -1, max = 1) => (
    <View key={key} style={styles.sliderContainer}>
      <Text style={styles.sliderLabel}>{label}</Text>
      <View style={styles.sliderRow}>
        <Text style={styles.sliderValue}>{Math.round(adjustments[key] * 100)}</Text>
        <Slider
          style={styles.slider}
          value={adjustments[key]}
          minimumValue={min}
          maximumValue={max}
          onValueChange={(value) => {
            setAdjustments({...adjustments, [key]: value});
          }}
          onSlidingComplete={undefined}
          minimumTrackTintColor="#FFD93D"
          maximumTrackTintColor="rgba(255,255,255,0.3)"
          thumbStyle={styles.sliderThumb}
        />
      </View>
    </View>
  );

  const renderStickerButton = (sticker) => (
    <TouchableOpacity
      key={sticker.id}
      style={styles.stickerButton}
      onPress={() => addSticker(sticker)}
    >
      <Text style={styles.stickerEmoji}>{sticker.name}</Text>
      <Text style={styles.stickerName}>{sticker.description}</Text>
    </TouchableOpacity>
  );

  const renderModeSelector = () => (
    <View style={styles.modeSelector}>
      {[
        { id: 'adjust', name: 'Ajustar', icon: 'settings' },
        { id: 'stickers', name: 'Stickers', icon: 'happy' },
        { id: 'frames', name: 'Marcos', icon: 'square-outline' }
      ].map(mode => (
        <TouchableOpacity
          key={mode.id}
          style={[
            styles.modeButton,
            editMode === mode.id && styles.modeButtonActive
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setEditMode(mode.id);
          }}
        >
          <Ionicons 
            name={mode.icon} 
            size={20} 
            color={editMode === mode.id ? '#000' : '#FFD93D'} 
          />
          <Text style={[
            styles.modeText,
            editMode === mode.id && styles.modeTextActive
          ]}>
            {mode.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <LinearGradient
      colors={['#FF6B9D', '#C44569', '#2C3E50', '#000']}
      style={styles.container}
    >
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFD93D" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Editor POSTURAITOR</Text>
          <Text style={styles.headerSubtitle}>Editar Selfie</Text>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={saveEditedPhoto}
          disabled={isProcessing}
        >
          <Ionicons 
            name="checkmark" 
            size={24} 
            color={isProcessing ? '#666' : '#FFD93D'} 
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Preview de la imagen */}
      <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
        <BlurView intensity={10} style={styles.imageFrame}>
          <Image 
            source={{ uri: editedImageUri || imageUri }} 
            style={styles.previewImage}
            resizeMode="cover"
          />
          
          {/* Stickers overlay */}
          {selectedStickers.map(sticker => (
            <TouchableOpacity
              key={sticker.id}
              style={[
                styles.stickerOverlay,
                {
                  left: sticker.x,
                  top: sticker.y,
                  transform: [
                    { scale: sticker.scale },
                    { rotate: `${sticker.rotation}deg` }
                  ]
                }
              ]}
              onLongPress={() => removeSticker(sticker.id)}
            >
              <Text style={styles.stickerOverlayText}>{sticker.name}</Text>
            </TouchableOpacity>
          ))}
          
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <BlurView intensity={20} style={styles.processingBlur}>
                <Text style={styles.processingText}>🎨 Procesando...</Text>
              </BlurView>
            </View>
          )}
        </BlurView>
      </Animated.View>

      {/* Selector de modo */}
      {renderModeSelector()}

      {/* Controles de edición */}
      <Animated.View style={[styles.controlsContainer, { opacity: fadeAnim }]}>

        {editMode === 'adjust' && (
          <View style={styles.adjustContainer}>
            <BlurView intensity={20} style={styles.adjustGlass}>
              <Text style={styles.adjustTitle}>🔄 Ajustar Imagen</Text>
              
              <View style={styles.adjustButtonsRow}>
                {/* Rotar Izquierda */}
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => handleRotate(-90)}
                  disabled={isProcessing}
                >
                  <LinearGradient
                    colors={['rgba(255,217,61,0.3)', 'rgba(255,217,61,0.1)']}
                    style={styles.adjustButtonGradient}
                  >
                    <Ionicons name="refresh-outline" size={24} color="#FFD93D" style={{ transform: [{ scaleX: -1 }] }} />
                    <Text style={styles.adjustButtonText}>Rotar ←</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                {/* Voltear */}
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={handleFlip}
                  disabled={isProcessing}
                >
                  <LinearGradient
                    colors={['rgba(255,107,157,0.3)', 'rgba(255,107,157,0.1)']}
                    style={styles.adjustButtonGradient}
                  >
                    <Ionicons name="swap-horizontal" size={24} color="#FF6B9D" />
                    <Text style={[styles.adjustButtonText, { color: '#FF6B9D' }]}>Voltear</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                {/* Rotar Derecha */}
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => handleRotate(90)}
                  disabled={isProcessing}
                >
                  <LinearGradient
                    colors={['rgba(255,217,61,0.3)', 'rgba(255,217,61,0.1)']}
                    style={styles.adjustButtonGradient}
                  >
                    <Ionicons name="refresh-outline" size={24} color="#FFD93D" />
                    <Text style={styles.adjustButtonText}>Rotar →</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
              {isProcessing && (
                <Text style={styles.processingText}>⏳ Procesando...</Text>
              )}
            </BlurView>
          </View>
        )}

        {editMode === 'stickers' && (
          <View style={styles.stickersContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.stickersScroll}
            >
              {stickers.map(renderStickerButton)}
            </ScrollView>
            
            {selectedStickers.length > 0 && (
              <Text style={styles.stickerHint}>
                💡 Mantén presionado un sticker para eliminarlo
              </Text>
            )}
          </View>
        )}

        {editMode === 'frames' && (
          <View style={styles.framesContainer}>
            <Text style={styles.comingSoon}>🖼️ Marcos temáticos próximamente</Text>
          </View>
        )}
      </Animated.View>

      <StyledAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons || []}
        titleIcon={alertConfig.titleIcon}
        onClose={() => setAlertVisible(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerButton: {
    padding: 10,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD93D',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  imageContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  imageFrame: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  colorOverlay: {
    ...StyleSheet.absoluteFillObject,
    mixBlendMode: 'multiply',
  },
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  stickerOverlay: {
    position: 'absolute',
    padding: 5,
  },
  stickerOverlayText: {
    fontSize: 30,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingBlur: {
    padding: 20,
    borderRadius: 15,
  },
  processingText: {
    fontSize: 16,
    color: '#FFD93D',
    fontWeight: 'bold',
  },
  modeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'space-around',
  },
  modeButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  modeButtonActive: {
    backgroundColor: '#FFD93D',
  },
  modeText: {
    fontSize: 12,
    color: '#FFD93D',
    marginTop: 2,
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#000',
  },
  controlsContainer: {
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  filtersContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  filtersScroll: {
    paddingHorizontal: 20,
  },
  filterButton: {
    alignItems: 'center',
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 80,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255,217,61,0.3)',
    borderWidth: 2,
    borderColor: '#FFD93D',
  },
  filterPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  filterEmoji: {
    fontSize: 20,
  },
  filterName: {
    fontSize: 12,
    color: '#FFD93D',
    fontWeight: 'bold',
  },
  filterNameActive: {
    color: '#FFD93D',
  },
  filterDescription: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.7,
    textAlign: 'center',
  },
  intensityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  intensityLabel: {
    color: '#FFD93D',
    fontSize: 14,
    fontWeight: 'bold',
    width: 80,
  },
  intensitySlider: {
    flex: 1,
    marginHorizontal: 10,
  },
  intensityValue: {
    color: '#FFD93D',
    fontSize: 14,
    fontWeight: 'bold',
    width: 50,
    textAlign: 'right',
  },
  adjustContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sliderContainer: {
    marginVertical: 8,
  },
  sliderLabel: {
    color: '#FFD93D',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  sliderValue: {
    color: '#FFD93D',
    fontSize: 12,
    width: 40,
    textAlign: 'right',
  },
  sliderThumb: {
    backgroundColor: '#FFD93D',
  },
  stickersContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  stickersScroll: {
    paddingHorizontal: 20,
  },
  stickerButton: {
    alignItems: 'center',
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 70,
  },
  stickerEmoji: {
    fontSize: 30,
    marginBottom: 5,
  },
  stickerName: {
    fontSize: 10,
    color: '#FFD93D',
    textAlign: 'center',
  },
  stickerHint: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.7,
  },
  framesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoon: {
    fontSize: 16,
    color: '#FFD93D',
    textAlign: 'center',
  },
  notAvailableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  notAvailableTitle: {
    fontSize: 18,
    color: '#FFD93D',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  notAvailableText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
    opacity: 0.9,
  },
  notAvailableSubtext: {
    fontSize: 12,
    color: '#FF6B9D',
    textAlign: 'center',
    fontWeight: '600',
  },
  glStatusContainer: {
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 217, 61, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 217, 61, 0.3)',
  },
  glStatusText: {
    fontSize: 12,
    color: '#FFD93D',
    textAlign: 'center',
    fontWeight: '600',
  },
  adjustGlass: {
    margin: 10,
    padding: 15,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  adjustTitle: {
    color: '#FFD93D',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  adjustButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  adjustButton: {
    flex: 1,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  adjustButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  adjustButtonText: {
    color: '#FFD93D',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  processingText: {
    color: '#FFD93D',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.8,
  },
});
