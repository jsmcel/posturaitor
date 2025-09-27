import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  FlatList,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { SocialShareService } from '../services/SocialShareService';
import StyledAlert from '../components/StyledAlert';

const { width, height } = Dimensions.get('window');

export default function AlbumScreen({ navigation, route }) {
  const [user] = useState(route.params?.user || {});
  const [photos, setPhotos] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  
  // Estados para StyledAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const showStyledAlert = (title, message, buttons, titleIcon = null) => {
    setAlertConfig({ title, message, buttons, titleIcon });
    setAlertVisible(true);
  };

  const showShareMenu = (imageUri, selfieData) => {
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
  };

  // Cargar selfies reales desde AsyncStorage
  const loadSelfies = async () => {
    try {
      setLoading(true);
      const savedSelfies = await AsyncStorage.getItem('posturaitor_selfies');
      const selfies = savedSelfies ? JSON.parse(savedSelfies) : [];
      
      // Convertir timestamps a objetos Date
      const processedSelfies = selfies.map(selfie => ({
        ...selfie,
        timestamp: new Date(selfie.timestamp)
      }));
      
      setPhotos(processedSelfies);
      
      // Calcular puntos totales
      const total = processedSelfies.reduce((sum, selfie) => sum + (selfie.rating || 0), 0);
      setTotalPoints(total);
      
    } catch (error) {
      console.error('Error loading selfies:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Cargar selfies cuando la pantalla se enfoca
  useFocusEffect(
    useCallback(() => {
      loadSelfies();
    }, [])
  );

  const filters = [
    { id: 'all', name: 'Todas', icon: 'grid' },
    { id: 'recent', name: 'Recientes', icon: 'time' },
    { id: 'top', name: 'Mejores', icon: 'star' },
    { id: 'stops', name: 'Por Parada', icon: 'location' },
  ];

  const getFilteredPhotos = () => {
    switch (selectedFilter) {
      case 'recent':
        return photos.sort((a, b) => b.timestamp - a.timestamp);
      case 'top':
        return photos.sort((a, b) => b.rating - a.rating);
      case 'stops':
        return photos.sort((a, b) => a.stopId - b.stopId);
      default:
        return photos;
    }
  };

  const getSelfieLevelText = (level) => {
    switch (level) {
      case 1: return 'Básico';
      case 2: return 'Intermedio';
      case 3: return 'Pro';
      default: return 'N/A';
    }
  };

  const getSelfieLevelColor = (level) => {
    switch (level) {
      case 1: return '#FFD93D';
      case 2: return '#FF6B9D';
      case 3: return '#C44569';
      default: return '#666';
    }
  };

  const handlePhotoPress = (photo) => {
    setSelectedPhoto(photo);
  };

  const handleSharePhoto = async (photo) => {
    try {
      console.log('📤 Compartiendo foto:', photo);
      
      // Usar el diálogo bonito de compartir
      showShareMenu(photo.uri, {
        stopName: photo.stopName,
        hashtag: photo.hashtag,
        analysis: photo.analysis,
        achievedLevel: photo.achievedLevel || photo.selfieLevel,
        targetLevel: photo.targetLevel,
        percentage: photo.percentage
      });
    } catch (error) {
      console.error('Error sharing photo:', error);
      showStyledAlert('Error', 'No se pudo compartir la foto', [
        { text: 'OK', style: 'cancel' }
      ], 'alert-circle');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    Alert.alert(
      'Eliminar Foto',
      '¿Estás seguro de que quieres eliminar esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedPhotos = photos.filter(p => p.id !== photoId);
              setPhotos(updatedPhotos);
              await AsyncStorage.setItem('posturaitor_selfies', JSON.stringify(updatedPhotos));
              
              // Recalcular puntos
              const total = updatedPhotos.reduce((sum, selfie) => sum + (selfie.rating || 0), 0);
              setTotalPoints(total);
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Error', 'No se pudo eliminar la foto');
            }
          },
        },
      ]
    );
  };

  const handleShareStats = () => {
    const userStats = {
      totalPhotos: photos.length,
      totalPoints: totalPoints,
      completedStops: [...new Set(photos.map(p => p.stopId))].length,
      level: Math.floor(totalPoints / 100) + 1 // Nivel basado en puntos
    };
    
    SocialShareService.shareUserStats(userStats);
  };

  const renderPhotoItem = ({ item }) => (
    <Animated.View
      style={[
        styles.photoCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <BlurView intensity={20} style={styles.photoGlass}>
        <TouchableOpacity
          style={styles.photoContainer}
          onPress={() => handlePhotoPress(item)}
        >
          {item.uri ? (
            <Image 
              source={{ uri: item.uri }} 
              style={styles.photoImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera" size={40} color="#FFD93D" />
              <Text style={styles.photoPlaceholderText}>Foto #{item.id}</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.photoInfo}>
          <Text style={styles.photoStopName}>{item.stopName}</Text>
          <Text style={styles.photoHashtag}>{item.hashtag}</Text>

          <View style={styles.photoStats}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#FFD93D" />
              <Text style={styles.statText}>{item.rating}</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[
                styles.levelBadge,
                { backgroundColor: getSelfieLevelColor(item.selfieLevel) }
              ]}>
                <Text style={styles.levelText}>
                  {getSelfieLevelText(item.selfieLevel)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.photoActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('PhotoEditor', {
                imageUri: item.uri,
                stopId: item.stopId,
                selfieData: {
                  stopName: item.stopName,
                  hashtag: item.hashtag,
                  analysis: item.analysis,
                  achievedLevel: item.achievedLevel,
                  targetLevel: item.targetLevel,
                  percentage: item.percentage
                }
              })}
            >
              <Ionicons name="brush" size={16} color="#FFD93D" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSharePhoto(item)}
            >
              <Ionicons name="share" size={16} color="#FFD93D" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeletePhoto(item.id)}
            >
              <Ionicons name="trash" size={16} color="#FF6B9D" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['#FF6B9D', '#C44569', '#2C3E50', '#000']}
      style={styles.container}
    >
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFD93D" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Mi Álbum</Text>
          <Text style={styles.headerSubtitle}>
            {photos.length} fotos • {totalPoints} puntos
          </Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => handleShareStats()}
          >
            <Ionicons name="trophy" size={24} color="#FFD93D" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Camera')}
          >
            <Ionicons name="add" size={24} color="#FFD93D" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Filters */}
      <Animated.View
        style={[
          styles.filtersContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Ionicons
                name={filter.icon}
                size={16}
                color={selectedFilter === filter.id ? "#000" : "#FFD93D"}
              />
              <Text style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive
              ]}>
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Photos Grid */}
      <FlatList
        data={getFilteredPhotos()}
        renderItem={renderPhotoItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.photosGrid}
        showsVerticalScrollIndicator={false}
      />

      {/* Empty State */}
      {photos.length === 0 && (
        <Animated.View
          style={[
            styles.emptyState,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <BlurView intensity={20} style={styles.emptyGlass}>
            <Ionicons name="images" size={60} color="#FFD93D" />
            <Text style={styles.emptyTitle}>¡Tu álbum está vacío!</Text>
            <Text style={styles.emptySubtitle}>
              Toma fotos en las paradas de la Gran Vía para llenar tu álbum POSTURAITOR
            </Text>

            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Map')}
            >
              <LinearGradient
                colors={['#FFD93D', '#FF6B9D']}
                style={styles.exploreGradient}
              >
                <Ionicons name="map" size={20} color="#000" />
                <Text style={styles.exploreText}>Explorar Gran Vía</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      )}

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
    paddingHorizontal: 20,
    paddingTop: 50,
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD93D',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 10,
    marginLeft: 5,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filtersScroll: {
    paddingHorizontal: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  filterButtonActive: {
    backgroundColor: '#FFD93D',
  },
  filterText: {
    fontSize: 12,
    color: '#FFD93D',
    marginLeft: 5,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#000',
  },
  photosGrid: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  photoCard: {
    flex: 1,
    margin: 5,
  },
  photoGlass: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  photoContainer: {
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: '#FFD93D',
    marginTop: 5,
  },
  photoInfo: {
    padding: 10,
  },
  photoStopName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD93D',
    marginBottom: 2,
  },
  photoHashtag: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 8,
  },
  photoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#FFD93D',
    marginLeft: 3,
  },
  levelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 10,
    color: '#000',
    fontWeight: 'bold',
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    padding: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyGlass: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD93D',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 30,
  },
  exploreButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  exploreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  exploreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
  },
});
