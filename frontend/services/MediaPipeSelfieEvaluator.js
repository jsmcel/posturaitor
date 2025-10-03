import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { LocalSelfieEvaluator } from './LocalSelfieEvaluator';

const IS_DEV = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

let FaceLandmarkerConstructor = null;
let FilesetResolverConstructor = null;
let faceLandmarkerInstance = null;

const WASM_ASSET_ROOT = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.7/wasm';
const FACE_LANDMARKER_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

const MEDIA_PIPE_FACE_SETTINGS = {
  mode: 'accurate',
  detectorMode: 'accurate',
  detectLandmarks: 'all',
  landmarkMode: 'all',
  runClassifications: 'all',
  classificationMode: 'all',
  tracking: true,
  minDetectionInterval: 80,
};

function toDegrees(value) {
  return (value * 180) / Math.PI;
}

function valueFromBlendshape(blendshapes, name) {
  if (!Array.isArray(blendshapes)) {
    return 0;
  }
  const match = blendshapes.find((item) => item.categoryName === name);
  return match ? match.score : 0;
}

function buildMetricsFromBlendshapes(result) {
  if (!result || !Array.isArray(result.faceLandmarks) || result.faceLandmarks.length === 0) {
    return null;
  }

  const blendshapes = result.faceBlendshapes?.[0]?.categories || [];
  const matrices = result.facialTransformationMatrixes?.[0]?.data || null;

  const smileLeft = valueFromBlendshape(blendshapes, 'mouthSmileLeft');
  const smileRight = valueFromBlendshape(blendshapes, 'mouthSmileRight');
  const smile = Math.min(1, (smileLeft + smileRight) / 2);

  const eyeBlinkLeft = valueFromBlendshape(blendshapes, 'eyeBlinkLeft');
  const eyeBlinkRight = valueFromBlendshape(blendshapes, 'eyeBlinkRight');
  const eyesOpen = Math.max(0, 1 - (eyeBlinkLeft + eyeBlinkRight) / 2);

  let yaw = 0;
  let roll = 0;
  let pitch = 0;

  if (matrices && matrices.length >= 16) {
    const m = matrices;
    const sy = Math.sqrt(m[0] * m[0] + m[4] * m[4]);
    const singular = sy < 1e-6;

    if (!singular) {
      pitch = Math.atan2(-m[8], sy);
      yaw = Math.atan2(m[4], m[0]);
      roll = Math.atan2(m[9], m[10]);
    } else {
      pitch = Math.atan2(-m[8], sy);
      yaw = Math.atan2(-m[1], m[5]);
      roll = 0;
    }

    yaw = toDegrees(yaw);
    roll = toDegrees(roll);
    pitch = toDegrees(pitch);
  }

  return {
    smilingProbability: smile,
    leftEyeOpenProbability: eyesOpen,
    rightEyeOpenProbability: eyesOpen,
    yawAngle: yaw,
    rollAngle: roll,
    pitchAngle: pitch,
    bounds: null,
  };
}

async function ensureFaceLandmarker() {
  if (Platform.OS !== 'web') {
    return null;
  }

  if (faceLandmarkerInstance) {
    return faceLandmarkerInstance;
  }

  if (!FaceLandmarkerConstructor || !FilesetResolverConstructor) {
    const vision = await import('@mediapipe/tasks-vision');
    FaceLandmarkerConstructor = vision.FaceLandmarker;
    FilesetResolverConstructor = vision.FilesetResolver;
  }

  const fileset = await FilesetResolverConstructor.forVisionTasks(WASM_ASSET_ROOT);
  faceLandmarkerInstance = await FaceLandmarkerConstructor.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: FACE_LANDMARKER_MODEL,
      delegate: 'GPU',
    },
    runningMode: 'IMAGE',
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
    numFaces: 1,
  });

  return faceLandmarkerInstance;
}

// Native fallback using Expo Face Detector (MLKit) on captured image
async function detectWithExpoFaceDetector(imageUri) {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const FaceDetector = await import('expo-face-detector');
    if (!FaceDetector || !FaceDetector.detectFacesAsync) {
      return null;
    }
    const options = {
      mode: FaceDetector.FaceDetectorMode?.accurate ?? 'accurate',
      detectLandmarks: FaceDetector.FaceDetectorLandmarks?.none ?? 'none',
      runClassifications: FaceDetector.FaceDetectorClassifications?.all ?? 'all',
      minDetectionInterval: 0,
      tracking: false,
    };
    const result = await FaceDetector.detectFacesAsync(imageUri, options);
    const faces = Array.isArray(result?.faces) ? result.faces : [];
    return faces[0] || null;
  } catch (e) {
    if (IS_DEV) {
      console.warn('[MediaPipeEvaluator] expo-face-detector fallback failed', e);
    }
    return null;
  }
}

function detectWithFaceLandmarker(imageUri) {
  if (Platform.OS !== 'web') {
    return Promise.resolve(null);
  }

  return new Promise(async (resolve) => {
    try {
      const landmarker = await ensureFaceLandmarker();
      if (!landmarker) {
        resolve(null);
        return;
      }

      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        try {
          const result = landmarker.detect(image);
          resolve(result);
        } catch (innerError) {
          console.error('MediaPipe detect error:', innerError);
          resolve(null);
        }
      };
      image.onerror = () => resolve(null);
      image.src = imageUri;
    } catch (error) {
      console.error('MediaPipe initialization error:', error);
      resolve(null);
    }
  });
}

function normalizeCameraFace(rawFace) {
  if (!rawFace) {
    return null;
  }

  return {
    bounds: rawFace.bounds ?? null,
    smilingProbability: rawFace.smilingProbability ?? 0,
    leftEyeOpenProbability: rawFace.leftEyeOpenProbability ?? 0,
    rightEyeOpenProbability: rawFace.rightEyeOpenProbability ?? 0,
    yawAngle: rawFace.yawAngle ?? 0,
    rollAngle: rawFace.rollAngle ?? 0,
    pitchAngle: rawFace.pitchAngle ?? 0,
  };
}

export function useMediaPipeFaceTracker() {
  const faceRef = useRef(null);
  const updatedAtRef = useRef(null);
  const lastLogRef = useRef(0);
  const onFacesDetected = useCallback((event) => {
    if (!event || !Array.isArray(event.faces) || event.faces.length === 0) {
      if (IS_DEV) {
        console.warn('[MediaPipeTracker] no faces detected in frame');
      }
      faceRef.current = null;
      return;
    }

    const normalized = normalizeCameraFace(event.faces[0]);
    faceRef.current = normalized;
    updatedAtRef.current = Date.now();

    if (IS_DEV) {
      const now = Date.now();
      if (now - (lastLogRef.current || 0) > 750) {
        console.log('[MediaPipeTracker] face update', {
          smile: normalized?.smilingProbability?.toFixed(2),
          eyes: normalized?.leftEyeOpenProbability?.toFixed(2),
          yaw: normalized?.yawAngle?.toFixed(1),
          roll: normalized?.rollAngle?.toFixed(1),
          bounds: normalized?.bounds || null,
        });
        lastLogRef.current = now;
      }
    }
  }, []);

  const getLatestFace = useCallback(() => faceRef.current, []);
  const getLastUpdate = useCallback(() => updatedAtRef.current, []);
  const resetFace = useCallback(() => {
    faceRef.current = null;
    updatedAtRef.current = null;
  }, []);

  return {
    faceDetectorSettings: MEDIA_PIPE_FACE_SETTINGS,
    onFacesDetected,
    getLatestFace,
    getLastUpdate,
    resetFace,
  };
}

export async function evaluateSelfieWithMediaPipe({ imageUri, point, userLocation, faceTracker, selectedFilter = 'none' }) {
  let faceMetrics = null;
  let lastUpdate = null;

  if (faceTracker?.getLatestFace) {
    faceMetrics = faceTracker.getLatestFace();
    lastUpdate = faceTracker.getLastUpdate?.();
  }

  const now = Date.now();
  const age = lastUpdate ? now - lastUpdate : null;

  if (age !== null && age > 4000) {
    if (IS_DEV) {
      console.warn('[MediaPipeEvaluator] face metrics considered stale', { age });
    }
    faceMetrics = null;
  }

  if (!faceMetrics) {
    if (Platform.OS === 'web') {
      if (IS_DEV) {
        console.log('[MediaPipeEvaluator] attempting web fallback analysis');
      }
      const mediaPipeResult = await detectWithFaceLandmarker(imageUri);
      faceMetrics = buildMetricsFromBlendshapes(mediaPipeResult);
    } else {
      // Native (iOS/Android) fallback via MLKit on the captured image
      if (IS_DEV) {
        console.log('[MediaPipeEvaluator] attempting native fallback with expo-face-detector');
      }
      const nativeFace = await detectWithExpoFaceDetector(imageUri);
      if (nativeFace) {
        faceMetrics = normalizeCameraFace(nativeFace);
      }
    }
  }

  if (IS_DEV) {
    console.log('[MediaPipeEvaluator] evaluation input', {
      hasFaceMetrics: !!faceMetrics,
      lastUpdate,
      age,
      selectedFilter,
    });
  }

  if (!faceMetrics) {
    if (IS_DEV) {
      console.warn('[MediaPipeEvaluator] no face metrics available, returning needs_face');
    }
    return {
      status: 'needs_face',
      issues: ['No se detecto rostro. Asegurate de que la camara te enfoque de cerca y con buena luz.'],
    };
  }

  const evaluation = LocalSelfieEvaluator.evaluate({
    face: faceMetrics,
    userLocation,
    point,
    imageUri,
    filterId: selectedFilter,
  });

  if (IS_DEV) {
    console.log('[MediaPipeEvaluator] evaluation result', {
      achievedLevel: evaluation.achievedLevel,
      totalScore: evaluation.totalScore,
      levelEvaluation: evaluation.levelEvaluation,
    });
  }

  return evaluation;
}

export const mediaPipeFaceDetectorSettings = MEDIA_PIPE_FACE_SETTINGS;
