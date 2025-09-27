import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function AudioPlayer({ audioFile, onPlay, onPause, onComplete }) {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);

  const loadAudio = async () => {
    try {
      setIsLoading(true);

      // Aquí cargarías el audio desde tu backend o assets
      // Por ahora usamos un audio de ejemplo
      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: audioFile || 'https://example.com/audio.mp3' },
        { shouldPlay: false }
      );

      setSound(audioSound);

      const status = await audioSound.getStatusAsync();
      setDuration(status.durationMillis || 0);

      audioSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis || 0);
          setIsPlaying(status.isPlaying);

          if (status.didJustFinish) {
            setIsPlaying(false);
            onComplete && onComplete();
          }
        }
      });

    } catch (error) {
      console.log('Error loading audio:', error);
      Alert.alert('Error', 'No se pudo cargar el audio');
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = async () => {
    try {
      if (!sound) {
        await loadAudio();
        return;
      }

      await sound.playAsync();
      setIsPlaying(true);
      onPlay && onPlay();

    } catch (error) {
      console.log('Error playing audio:', error);
      Alert.alert('Error', 'No se pudo reproducir el audio');
    }
  };

  const pauseAudio = async () => {
    try {
      if (sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
        onPause && onPause();
      }
    } catch (error) {
      console.log('Error pausing audio:', error);
    }
  };

  const stopAudio = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
        setIsPlaying(false);
        setPosition(0);
      }
    } catch (error) {
      console.log('Error stopping audio:', error);
    }
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <BlurView intensity={20} style={styles.playerGlass}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="musical-notes" size={24} color="#FFD93D" />
          <Text style={styles.title}>Audio Guía POSTURAITOR</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` }
              ]}
            />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={stopAudio}
            disabled={isLoading}
          >
            <Ionicons name="stop" size={24} color="#FFD93D" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
            onPress={isPlaying ? pauseAudio : playAudio}
            disabled={isLoading}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <LinearGradient
                colors={['#FFD93D', '#FF6B9D']}
                style={styles.playGradient}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={32}
                  color="#000"
                />
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              // Aquí iría la lógica para saltar al siguiente audio
            }}
            disabled={isLoading}
          >
            <Ionicons name="play-skip-forward" size={24} color="#FFD93D" />
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando audio...</Text>
          </View>
        )}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  playerGlass: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD93D',
    marginLeft: 10,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD93D',
    borderRadius: 3,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
  },
  controlButton: {
    padding: 10,
  },
  playButton: {
    borderRadius: 35,
    overflow: 'hidden',
  },
  playGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#FFD93D',
    fontStyle: 'italic',
  },
});

