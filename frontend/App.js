import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';

// Screens
import HomeScreen from './screens/HomeScreen';
import AlbumScreen from './screens/AlbumScreen';
import MapScreen from './screens/MapScreen_webview';

// Components
import AudioPlayer from './components/AudioPlayer';

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [user, setUser] = useState({
    name: 'POSTUREITOR',
    level: 1,
    experience: 0,
    completedStops: [],
    totalRating: 0,
    badges: []
  });

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
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#000" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#000' },
        }}
      >
        <Stack.Screen name="Home">
          {(props) => <HomeScreen {...props} user={user} setUser={setUser} />}
        </Stack.Screen>
        
        <Stack.Screen name="Album">
          {(props) => <AlbumScreen {...props} user={user} />}
        </Stack.Screen>
        
        <Stack.Screen name="Map">
          {(props) => <MapScreen {...props} user={user} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
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
