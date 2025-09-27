import React, { createContext, useContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'POSTUREITOR',
    level: 1,
    experience: 0,
    totalPoints: 0,
    completedStops: [],
    totalRating: 0,
    badges: [],
    selfies: [],
    currentLocation: {
      id: 3,
      name: 'Banco de España',
      coordinates: { lat: 40.418722, lng: -3.694306 }
    }
  });

  // Cargar datos del usuario al iniciar
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // En una implementación real, cargarías desde AsyncStorage
      // const userData = await AsyncStorage.getItem('posturaitor_user');
      // if (userData) {
      //   setUser(JSON.parse(userData));
      // }
      console.log('User data loaded');
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const saveUserData = async (userData) => {
    try {
      // En una implementación real, guardarías en AsyncStorage
      // await AsyncStorage.setItem('posturaitor_user', JSON.stringify(userData));
      console.log('User data saved:', userData.totalPoints, 'points');
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const addPoints = (points, stopId, analysis) => {
    setUser(prevUser => {
      const newTotalPoints = prevUser.totalPoints + points;
      const newTotalRating = prevUser.totalRating + points;
      const newCompletedStops = stopId && !prevUser.completedStops.includes(stopId) 
        ? [...prevUser.completedStops, stopId]
        : prevUser.completedStops;
      
      // Calcular nuevo nivel basado en puntos
      const newLevel = Math.floor(newTotalPoints / 100) + 1;
      
      // Agregar nuevo badge si alcanzó un nivel
      const newBadges = [...prevUser.badges];
      if (analysis && analysis.badge && !newBadges.find(b => b.name === analysis.badge.name)) {
        newBadges.push(analysis.badge);
      }

      const updatedUser = {
        ...prevUser,
        totalPoints: newTotalPoints,
        totalRating: newTotalRating,
        level: newLevel,
        completedStops: newCompletedStops,
        badges: newBadges,
        experience: newTotalPoints // Usar puntos como experiencia
      };

      // Guardar datos actualizados
      saveUserData(updatedUser);
      
      return updatedUser;
    });
  };

  const addSelfie = (selfieData) => {
    setUser(prevUser => {
      const updatedUser = {
        ...prevUser,
        selfies: [...prevUser.selfies, selfieData]
      };
      
      saveUserData(updatedUser);
      return updatedUser;
    });
  };

  const updateLocation = (location) => {
    setUser(prevUser => ({
      ...prevUser,
      currentLocation: location
    }));
  };

  const value = {
    user,
    setUser,
    addPoints,
    addSelfie,
    updateLocation,
    loadUserData,
    saveUserData
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

