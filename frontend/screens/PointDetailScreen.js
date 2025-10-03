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
  const punchifyDescriptions = (pointId, base) => {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const PUNCHY = {
      1: {
        1: ['Skyline de fondo y sonrisa chill. 🌆😎'],
        2: ['De espaldas al paisaje, pose de mando. 👑'],
        3: ['Gran angular + power pose: domina la ciudad. 💥'],
      },
      2: {
        1: ['Fachada visible y gesto amable. 🏛️✨'],
        2: ['Grito silencioso + ojos abiertos. 😱'],
        3: ['Blanco y negro con aura de leyenda. 🖤🎭'],
      },
      3: {
        1: ['Banco en cuadro, sonrisa controlada. 🏦😌'],
        2: ['Mirada de atraco planificado. 🧢'],
        3: ['Cruza brazos y fija mirada. 💼🔥'],
      },
      4: {
        1: ['Minerva al fondo y sonrisa suave. ✨'],
        2: ['Brazo elevado, recibe su poder. ⚡'],
        3: ['Contrapicado mirando al cielo. 🌌'],
      },
      5: {
        1: ['Semáforo visible y cruce clásico. 🚦'],
        2: ['Cruza en verde con energía. 🟢⚡'],
        3: ['Sepia vintage + luces de coches. 🧡🚗'],
      },
      6: {
        1: ['Metrópolis en cuadro, sonrisa suave. ✨'],
        2: ['Alinea la cúpula y posa. 🌟'],
        3: ['Contrapicado elegante con actitud. 💫'],
      },
      7: {
        1: ['Chicote vibes, gesto friendly. 🍸'],
        2: ['Neón y pose cool. 😎'],
        3: ['B&N o luz suave y estilo. 🖤✨'],
      },
      8: {
        1: ['WOW limpio y centrado, sonrisa chill. 🛍️'],
        2: ['Simetría y gesto marcado. ➕'],
        3: ['Plano creativo y filtro fino. 🎨'],
      },
      9: {
        1: ['Telefónica en cuadro, sonrisa ligera. 📡'],
        2: ['Giro leve para drama tech. ⚡'],
        3: ['Ángulo potente sin inclinar de más. 🔩'],
      },
      10: {
        1: ['Primark gigante, sonrisa controlada. 🛒'],
        2: ['Escaleras/luces y tú al mando. ✨'],
        3: ['Gran angular y pose power. 🌀💪'],
      },
      11: {
        1: ['Schweppes al fondo, gesto chill. 🟨'],
        2: ['No flash, deja que el neón pinte. 💡'],
        3: ['Nocturna dramática con mirada fija. 🌙'],
      },
      12: {
        1: ['Callao vibes, pantallas de fondo. 🌀'],
        2: ['Gira el cuerpo para coger luz. 💡'],
        3: ['Panorámica urbana con actitud. 🌆'],
      },
      13: {
        1: ['Teatro al fondo, sonrisa suave. 🎭'],
        2: ['Cruza brazos/ceja arriba. 🧐'],
        3: ['Susurro dramático, foco en ti. 🤫'],
      },
      14: {
        1: ['Dos marquesinas en cuadro. 🎟️'],
        2: ['Señala ambos lados con estilo. 👈👉'],
        3: ['Panorámica Broadway vibes. 🌃'],
      },
      15: {
        1: ['Quijote y Sancho contigo. 🗡️'],
        2: ['Imita la pose clásica. 🗿'],
        3: ['Skybar heroico con vértigo. 🌇'],
      },
    };
    const pack = PUNCHY[pointId] || {};
    return {
      1: (pack[1] && pick(pack[1])) || base[1],
      2: (pack[2] && pick(pack[2])) || base[2],
      3: (pack[3] && pick(pack[3])) || base[3],
    };
  };

  const levelDescriptions = useMemo(() => {
    const base = getLevelDescriptions(point.id);
    return punchifyDescriptions(point.id, base);
  }, [point.id]);
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
              userLocation,
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
