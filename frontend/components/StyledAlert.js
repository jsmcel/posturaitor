import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const StyledAlert = ({ visible, title, message, buttons, onClose, titleIcon }) => {
  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <BlurView intensity={50} tint="dark" style={styles.absolute}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#4a4a4a', '#303030', '#1a1a1a']}
            style={styles.gradient}
          >
            <View style={styles.header}>
              {titleIcon && <Ionicons name={titleIcon} size={28} color="#FFD93D" style={styles.titleIcon} />}
              <Text style={styles.title}>{title}</Text>
            </View>
            
            {message && <Text style={styles.message}>{message}</Text>}
            
            <ScrollView style={styles.buttonsContainer}>
              {buttons.map((btn, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.button, btn.style === 'cancel' ? styles.cancelButton : styles.defaultButton]}
                  onPress={() => {
                    if (btn.onPress) {
                      btn.onPress();
                    }
                    onClose();
                  }}
                >
                  <Text style={[styles.buttonText, btn.style === 'cancel' ? styles.cancelButtonText : styles.defaultButtonText]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close-circle" size={32} color="#aaa" />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  absolute: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 217, 61, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  gradient: {
    padding: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomColor: 'rgba(255, 217, 61, 0.2)',
    borderBottomWidth: 1,
    paddingBottom: 15,
  },
  titleIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD93D',
    flex: 1,
  },
  message: {
    fontSize: 16,
    color: '#E0E0E0',
    marginBottom: 25,
    lineHeight: 24,
    textAlign: 'left',
  },
  buttonsContainer: {
    maxHeight: 250,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 15,
    marginVertical: 5,
    alignItems: 'center',
  },
  defaultButton: {
    backgroundColor: '#FFD93D',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#888',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  defaultButtonText: {
    color: '#1a1a1a',
  },
  cancelButtonText: {
    color: '#E0E0E0',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  }
});

export default StyledAlert;

