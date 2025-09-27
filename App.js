import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';

// Screens
import HomeScreen from './frontend/screens/HomeScreen';
import AlbumScreen from './frontend/screens/AlbumScreen';
import MapScreen from './frontend/screens/MapScreen_webview';
import CameraScreen from './frontend/screens/CameraScreen';
import PointDetailScreen from './frontend/screens/PointDetailScreen';
import PhotoEditorScreen from './frontend/screens/PhotoEditorScreen';

// Components
import AudioPlayer from './frontend/components/AudioPlayer';

// Context
import { UserProvider } from './frontend/context/UserContext';

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    loadFonts();
  }, []);

  const loadFonts = async () => {
    try {
      // Cargar fuentes del sistema por ahora
      setFontsLoaded(true);
    } catch (error) {
      console.log('Error loading fonts:', error);
      setFontsLoaded(true); // Continuar aunque falle la carga de fuentes
    }
  };

  if (!fontsLoaded) {
    return (
      <LinearGradient
        colors={['#FF6B9D', '#C44569', '#2C3E50', '#000']}
        style={styles.loadingContainer}
      >
        <View style={styles.loadingContent}>
          <Text style={styles.loadingTitle}>POSTURAITOR</Text>
          <Text style={styles.loadingSubtitle}>Gran Vía Edition</Text>
          <View style={styles.loadingSpinner}>
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <UserProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#000" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#000' },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Album" component={AlbumScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="Camera" component={CameraScreen} />
          <Stack.Screen name="PointDetail" component={PointDetailScreen} />
          <Stack.Screen name="PhotoEditor" component={PhotoEditorScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD93D',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  loadingSubtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 40,
    opacity: 0.8,
  },
  loadingSpinner: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFD93D',
    fontStyle: 'italic',
  },
});
