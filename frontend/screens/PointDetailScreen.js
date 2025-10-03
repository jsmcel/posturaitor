import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AudioPlayer from '../components/AudioPlayer';
import StyledAlert from '../components/StyledAlert';
import { getLevelChallenge, getLevelDescriptions } from '../constants/challenges';

const { width, height } = Dimensions.get('window');

export default function PointDetailScreen({ navigation, route }) {
  const { point, userLocation } = route.params;
  const levelDescriptions = useMemo(() => getLevelDescriptions(point.id), [point.id]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    checkProximity();
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

  const checkProximity = () => {
    if (!userLocation) return;

    const distance = calculateDistance(
      userLocation.latitude, userLocation.longitude,
      point.coordinates.lat, point.coordinates.lng
    );

    // Desbloquear si está dentro de 50 metros
    if (distance <= 50) {
      setIsUnlocked(true);
    }
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000;
  };

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const showStyledAlert = (title, message, buttons, titleIcon = null) => {
    setAlertConfig({ title, message, buttons, titleIcon });
    setAlertVisible(true);
  };

  const handleTakeSelfieForLevel = (level) => {
    const levelConfig = getLevelChallenge(point.id, level);
    const rules = levelConfig?.rules || {};
    const detailLines = [levelConfig?.description || `Requisitos del nivel ${level}.`];

    if (rules.requiredFilterId) {
      detailLines.push(`Filtro requerido: ${rules.requiredFilterId}`);
    } else if (rules.requireFilter) {
      detailLines.push('Activa cualquier filtro especial para este nivel.');
    }

    if (Array.isArray(rules.manualChecks) && rules.manualChecks.length) {
      detailLines.push(...rules.manualChecks);
    }

    showStyledAlert(
      `Nivel ${level} - ${point.name}`,
      `Requisitos:
${detailLines.join('\n')}

Listo para intentarlo?`,
      [
        {
          text: `Vamos a por el Nivel ${level}`,
          onPress: () => {
            navigation.navigate('Camera', {
              point,
              targetLevel: level,
              autoAnalyze: true,
            });
          },
        },
        {
          text: 'Elegir Otro Nivel',
          style: 'cancel',
        },
      ],
      level === 1 ? 'medal' : level === 2 ? 'trophy' : 'star'
    );
  };

if (!isUnlocked) {
    return (
      <LinearGradient
        colors={['#FF6B9D', '#C44569', '#2C3E50', '#000']}
        style={styles.container}
      >
        <View style={styles.lockedContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFD93D" />
          </TouchableOpacity>

          <BlurView intensity={20} style={styles.lockedCard}>
            <Ionicons name="lock-closed" size={60} color="#FFD93D" />
            <Text style={styles.lockedTitle}>Punto Bloqueado</Text>
            <Text style={styles.lockedText}>
              Acércate a menos de 50 metros de {point.name} para desbloquear la información
            </Text>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.mapButtonText}>Ver en Mapa</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#FF6B9D', '#C44569', '#2C3E50', '#000']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
            <Text style={styles.headerTitle}>{point.name}</Text>
            <Text style={styles.headerHashtag}>{point.hashtag}</Text>
          </View>

          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share" size={24} color="#FFD93D" />
          </TouchableOpacity>
        </Animated.View>

        {/* Description */}
        <Animated.View
          style={[
            styles.descriptionCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <BlurView intensity={20} style={styles.glassCard}>
            <Text style={styles.descriptionTitle}>Historia del Lugar</Text>
            <Text style={styles.descriptionText}>{point.description}</Text>
          </BlurView>
        </Animated.View>

        {/* Audio Player */}
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <AudioPlayer audioFile={point.audio} />
        </Animated.View>

        {/* Selfie Challenges */}
        <Animated.View
          style={[
            styles.selfieCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <BlurView intensity={20} style={styles.glassCard}>
            <Text style={styles.selfieTitle}>🤳 Desafíos de Selfie</Text>
            
            <Text style={styles.levelInstructions}>
              Elige tu nivel de dificultad:
            </Text>

            {/* Nivel 1 - Principiante */}
            <TouchableOpacity
              style={[styles.levelButton, styles.level1Button]}
              onPress={() => handleTakeSelfieForLevel(1)}
            >
              <View style={styles.levelButtonContent}>
                <View style={styles.levelIcon}>
                  <Ionicons name="medal" size={24} color="#000" />
                </View>
                <View style={styles.levelInfo}>
                  <Text style={styles.levelButtonTitle}>🥉 Nivel 1 - Principiante</Text>
                  <Text style={styles.levelButtonDesc}>{levelDescriptions[1]}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#000" />
              </View>
            </TouchableOpacity>

            {/* Nivel 2 - Intermedio */}
            <TouchableOpacity
              style={[styles.levelButton, styles.level2Button]}
              onPress={() => handleTakeSelfieForLevel(2)}
            >
              <View style={styles.levelButtonContent}>
                <View style={styles.levelIcon}>
                  <Ionicons name="trophy" size={24} color="#000" />
                </View>
                <View style={styles.levelInfo}>
                  <Text style={styles.levelButtonTitle}>🥈 Nivel 2 - Intermedio</Text>
                  <Text style={styles.levelButtonDesc}>{levelDescriptions[2]}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#000" />
              </View>
            </TouchableOpacity>

            {/* Nivel 3 - Experto */}
            <TouchableOpacity
              style={[styles.levelButton, styles.level3Button]}
              onPress={() => handleTakeSelfieForLevel(3)}
            >
              <View style={styles.levelButtonContent}>
                <View style={styles.levelIcon}>
                  <Ionicons name="star" size={24} color="#000" />
                </View>
                <View style={styles.levelInfo}>
                  <Text style={styles.levelButtonTitle}>🏆 Nivel 3 - Experto</Text>
                  <Text style={styles.levelButtonDesc}>{levelDescriptions[3]}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#000" />
              </View>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      </ScrollView>

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
  scrollView: {
    flex: 1,
    paddingTop: 50,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
    textAlign: 'center',
  },
  headerHashtag: {
    fontSize: 16,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  shareButton: {
    padding: 10,
  },
  descriptionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  glassCard: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD93D',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 22,
    opacity: 0.9,
  },
  selfieCard: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  selfieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD93D',
    marginBottom: 20,
    textAlign: 'center',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  levelBadge: {
    backgroundColor: '#FFD93D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  suggestionText: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
    lineHeight: 20,
  },
  selfieButton: {
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  selfieGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  selfieButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
  },
  lockedCard: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    maxWidth: 300,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD93D',
    marginTop: 20,
    marginBottom: 15,
  },
  lockedText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  mapButton: {
    backgroundColor: '#FFD93D',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  mapButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  levelInstructions: {
    fontSize: 16,
    color: '#FFD93D',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  levelButton: {
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  level1Button: {
    backgroundColor: '#4CAF50', // Verde para principiante
  },
  level2Button: {
    backgroundColor: '#FF9800', // Naranja para intermedio
  },
  level3Button: {
    backgroundColor: '#F44336', // Rojo para experto
  },
  levelButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  levelIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  levelInfo: {
    flex: 1,
  },
  levelButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  levelButtonDesc: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.7)',
    lineHeight: 18,
  },
});
