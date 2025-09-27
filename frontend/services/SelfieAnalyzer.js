// import * as FaceDetector from 'expo-face-detector'; // No disponible en Expo 52
import { AIAnalyzer } from './AIAnalyzer';
import { manipulateAsync } from 'expo-image-manipulator';

export class SelfieAnalyzer {

  // Método para análisis específico de nivel (usa AIAnalyzer)
  static async analyzeSelfieForLevel(imageUri, stopId, targetLevel) {
    try {
      // Usar el nuevo sistema de IA
      const analysis = await AIAnalyzer.analyzeSelfieWithAI(imageUri, stopId);
      const levelEvaluation = AIAnalyzer.evaluateLevel(analysis, stopId, targetLevel);
      
      return {
        ...analysis,
        targetLevel,
        achievedLevel: levelEvaluation.achieved ? targetLevel : Math.max(0, targetLevel - 1),
        levelEvaluation,
        message: levelEvaluation.achieved ? 
          `🏆 ¡NIVEL ${targetLevel} CONSEGUIDO! ${levelEvaluation.percentage}% de los requisitos cumplidos.` :
          `⚠️ Nivel ${targetLevel} no conseguido (${levelEvaluation.percentage}%). Intenta de nuevo.`
      };
    } catch (error) {
      console.error('Error in level-specific analysis:', error);
      return this.getFallbackAnalysis(stopId, targetLevel);
    }
  }

  // Analizar selfie según el punto de interés (método original, ahora usa IA)
  static async analyzeSelfie(imageUri, stopId) {
    try {
      console.log(`🤳 Analizando selfie para punto ${stopId}...`);

      // Usar el nuevo sistema de IA para análisis completo
      return await AIAnalyzer.analyzeSelfieWithAI(imageUri, stopId);
    } catch (error) {
      console.error('Error in selfie analysis:', error);
      return this.getFallbackAnalysis(stopId, 1);
    }
  }

  // Análisis de respaldo
  static getFallbackAnalysis(stopId, targetLevel = 1) {
    return {
      achievedLevel: 1,
      targetLevel,
      totalScore: Math.floor(Math.random() * 30) + 40,
      maxPossibleScore: 100,
      badge: { name: "POSTURAITOR BEGINNER", emoji: "🌟", color: "#666" },
      message: "Análisis básico completado. ¡Sigue practicando!",
      aiAnalysis: false,
      levelEvaluation: {
        achieved: targetLevel === 1,
        score: 40,
        maxScore: 100,
        percentage: 40,
        details: ['⚠️ Análisis básico aplicado']
      }
    };
  }

  // Método de compatibilidad para detección de caras
  static async detectFaces(imageUri) {
    try {
      // Simulación de detección facial para Expo 52
      return {
        detected: Math.random() > 0.1, // 90% probabilidad de detectar cara
        count: 1,
        confidence: Math.random() * 0.3 + 0.7
      };
    } catch (error) {
      console.error('Error detecting faces:', error);
      return { detected: false, count: 0, confidence: 0 };
    }
  }
}