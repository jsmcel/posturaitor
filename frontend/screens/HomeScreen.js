import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useUser } from '../context/UserContext';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation, route }) {
  const [user] = useState(route.params?.user || {
    name: 'POSTUREITOR',
    level: 1,
    experience: 0,
    completedStops: [],
    totalRating: 0,
    badges: []
  });

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const progressPercentage = (user.completedStops.length / 15) * 100;

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
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#FFD93D', '#FF6B9D']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user.name.charAt(0)}
                </Text>
              </LinearGradient>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userLevel}>Nivel {user.level}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle" size={30} color="#FFD93D" />
          </TouchableOpacity>
        </Animated.View>

        {/* Progress Card */}
        <Animated.View
          style={[
            styles.progressCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <BlurView intensity={20} style={styles.glassCard}>
            <Text style={styles.progressTitle}>Tu Ruta POSTURAITOR</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {user.completedStops.length} de 15 paradas completadas
            </Text>
          </BlurView>
        </Animated.View>

        {/* Main Actions */}
        <Animated.View
          style={[
            styles.actionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => navigation.navigate('Map')}
          >
            <LinearGradient
              colors={['#FFD93D', '#FF6B9D']}
              style={styles.buttonGradient}
            >
              <Ionicons name="map" size={30} color="#000" />
              <Text style={styles.buttonText}>Explorar Gran Vía</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Album')}
          >
            <BlurView intensity={20} style={styles.glassButton}>
              <Ionicons name="images" size={25} color="#FFD93D" />
              <Text style={styles.secondaryButtonText}>Mi Álbum</Text>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Cards */}
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.statsRow}>
            <BlurView intensity={20} style={styles.statCard}>
              <Ionicons name="star" size={24} color="#FFD93D" />
              <Text style={styles.statNumber}>{user.totalRating}</Text>
              <Text style={styles.statLabel}>Rating Total</Text>
            </BlurView>

            <BlurView intensity={20} style={styles.statCard}>
              <Ionicons name="trophy" size={24} color="#FFD93D" />
              <Text style={styles.statNumber}>{user.badges.length}</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </BlurView>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.quickActions,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('Album')}
          >
            <BlurView intensity={20} style={styles.quickActionCard}>
              <Ionicons name="images" size={20} color="#FFD93D" />
              <Text style={styles.quickActionText}>Álbum</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('Map')}
          >
            <BlurView intensity={20} style={styles.quickActionCard}>
              <Ionicons name="map" size={20} color="#FFD93D" />
              <Text style={styles.quickActionText}>Mapa</Text>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD93D',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  userLevel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  profileButton: {
    padding: 10,
  },
  progressCard: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  glassCard: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD93D',
    marginBottom: 15,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD93D',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  mainButton: {
    marginBottom: 15,
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  secondaryButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  halfButton: {
    flex: 1,
  },
  glassButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#FFD93D',
    marginLeft: 10,
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD93D',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  quickAction: {
    flex: 1,
    marginHorizontal: 5,
  },
  quickActionCard: {
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: '#FFD93D',
    marginTop: 5,
    fontWeight: '600',
  },
});
