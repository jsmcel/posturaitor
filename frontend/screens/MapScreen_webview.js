import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import granviaPoints from '../../granvia_points';

export default function MapScreen({ navigation, route }) {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'MARKER_CLICKED') {
        const point = granviaPoints.find(p => p.id === data.pointId);
        if (point) {
          navigation.navigate('PointDetail', { 
            point: point,
            userLocation: userLocation 
          });
        }
      }
    } catch (error) {
      console.log('Error handling WebView message:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Necesitamos acceso a tu ubicación.');
        return;
      }

      // Simular ubicación en el Banco de España para la demo
      setUserLocation({
        latitude: 40.418722, // Banco de España
        longitude: -3.694306,
      });
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  // Calcular punto más cercano
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Distancia en metros
  };

  const findNearestPoint = () => {
    if (!userLocation) return null;
    
    let nearest = null;
    let minDistance = Infinity;
    
    granviaPoints.forEach(point => {
      const distance = calculateDistance(
        userLocation.latitude, userLocation.longitude,
        point.coordinates.lat, point.coordinates.lng
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { ...point, distance };
      }
    });
    
    return nearest;
  };

  // Crear HTML para Google Maps
  const createMapHTML = () => {
    const markers = granviaPoints.map(point => ({
      lat: point.coordinates.lat,
      lng: point.coordinates.lng,
      title: point.name,
      description: point.hashtag,
      id: point.id
    }));

    const userLat = userLocation?.latitude || 40.419167;
    const userLng = userLocation?.longitude || -3.696667;
    const nearestPoint = findNearestPoint();

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body, html { margin: 0; padding: 0; height: 100%; }
        #map { height: 100%; width: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        function initMap() {
          const map = new google.maps.Map(document.getElementById('map'), {
            zoom: 18,
            center: { lat: 40.418722, lng: -3.694306 },
            mapTypeId: 'roadmap'
          });

          // Agregar marcadores
          const markers = ${JSON.stringify(markers)};
          markers.forEach((marker, index) => {
            const isBancoEspana = marker.title === 'Banco de España';
            const mapMarker = new google.maps.Marker({
              position: { lat: marker.lat, lng: marker.lng },
              map: map,
              title: marker.title,
              icon: {
                url: isBancoEspana 
                  ? 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><circle cx="25" cy="25" r="22" fill="%23FFD93D" stroke="%23000" stroke-width="3"/><path d="M25 12l6 12h-12z" fill="%23000"/><text x="25" y="35" text-anchor="middle" font-size="8" fill="%23000">BANCO</text></svg>'
                  : 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23FF6B9D" stroke="%23000" stroke-width="2"/><path d="M20 10l4 8h-8z" fill="%23000"/></svg>',
                scaledSize: new google.maps.Size(isBancoEspana ? 50 : 40, isBancoEspana ? 50 : 40)
              }
            });

            // Agregar click listener para navegar a PointDetail
            mapMarker.addListener('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'MARKER_CLICKED',
                pointId: marker.id,
                pointName: marker.title
              }));
            });
          });

          // Agregar ubicación del usuario si existe
          if (${userLocation ? 'true' : 'false'}) {
            new google.maps.Marker({
              position: { lat: ${userLat}, lng: ${userLng} },
              map: map,
              title: 'Tu ubicación',
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="%23007AFF" stroke="%23fff" stroke-width="2"/></svg>',
                scaledSize: new google.maps.Size(20, 20)
              }
            });
          }

          // Agregar flecha hacia el punto más cercano
          ${nearestPoint ? `
          const nearestLat = ${nearestPoint.coordinates.lat};
          const nearestLng = ${nearestPoint.coordinates.lng};
          const distance = ${Math.round(nearestPoint.distance)};
          
          // Crear polilínea hacia el punto más cercano
          const directionsPath = new google.maps.Polyline({
            path: [
              { lat: ${userLat}, lng: ${userLng} },
              { lat: nearestLat, lng: nearestLng }
            ],
            geodesic: true,
            strokeColor: '#FFD93D',
            strokeOpacity: 1.0,
            strokeWeight: 3,
            icons: [{
              icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 6,
                fillColor: '#FFD93D',
                fillOpacity: 1,
                strokeColor: '#000',
                strokeWeight: 1
              },
              offset: '100%'
            }]
          });
          directionsPath.setMap(map);

          // Agregar info window con distancia
          const infoWindow = new google.maps.InfoWindow({
            content: '<div style="color: #000; font-weight: bold;">📍 Siguiente: ${nearestPoint.name}<br/>🚶 ${Math.round(nearestPoint.distance)}m</div>',
            position: { lat: nearestLat, lng: nearestLng }
          });
          infoWindow.open(map);
          ` : ''}
        }
      </script>
      <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDIPjPJ_YZuY8lK9oxIPoVrxZKcxBrBghE&callback=initMap"></script>
    </body>
    </html>
    `;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFD93D" />
        </TouchableOpacity>
        <Text style={styles.title}>MAPA GRAN VÍA</Text>
      </View>

      {/* Mapa WebView */}
      <WebView
        style={styles.map}
        source={{ html: createMapHTML() }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        onMessage={handleWebViewMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    color: '#FFD93D',
  },
  map: {
    flex: 1,
  },
});
