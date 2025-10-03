import { getChallengeForPoint } from '../constants/challenges';

const EARTH_RADIUS_METERS = 6371000;

const WEIGHTS = {
  facePresence: 0.3,
  expression: 0.2,
  orientation: 0.2,
  eyes: 0.1,
  distance: 0.2,
};

const DEFAULT_LEVEL_RULES = {
  1: {
    maxDistance: 80,
    minSmile: 0.25,
    minEyes: 0.25,
    description: 'Selfie claro y cercano al punto',
  },
  2: {
    maxDistance: 60,
    minSmile: 0.45,
    minEyes: 0.35,
    minYaw: 6,
    description: 'Actitud marcada o sonrisa amplia en el lugar',
  },
  3: {
    maxDistance: 40,
    targetExpression: 'dramatic',
    minEyes: 0.35,
    minYaw: 12,
    minRoll: 8,
    maxSmile: 0.35,
    requireFilter: true,
    description: 'Pose potente y bien encuadrada junto al punto',
  },
};



const CLOTHING_HINTS = {
  hoodie: 'sudadera o look urbano',
  formal: 'look formal o elegante',
  casual: 'look casual',
  accessories: 'accesorios visibles',
};

function applyPoseRuleAdjustments(rules, manualChecks, pose) {
  switch (pose) {
    case 'smile':
      rules.targetExpression = 'smile';
      rules.minSmile = 0.55;
      rules.maxSmile = 1;
      break;
    case 'grumpy':
      rules.targetExpression = 'serious';
      rules.minSmile = 0;
      rules.maxSmile = 0.25;
      break;
    case 'dramaticPose':
      rules.minYaw = Math.max(rules.minYaw || 0, 12);
      rules.minRoll = Math.max(rules.minRoll || 0, 8);
      break;
    case 'powerPose':
      rules.maxYaw = Math.min(rules.maxYaw || 999, 10);
      rules.maxRoll = Math.min(rules.maxRoll || 999, 8);
      break;
    case 'coolGesture':
      rules.minYaw = Math.max(rules.minYaw || 0, 8);
      break;
    case 'relaxedPose':
      rules.maxYaw = Math.min(rules.maxYaw || 999, 15);
      rules.maxRoll = Math.min(rules.maxRoll || 999, 15);
      break;
    case 'crossedArms':
      manualChecks.push('Cruza los brazos para reforzar la pose');
      rules.targetExpression = 'serious';
      rules.minSmile = 0;
      rules.maxSmile = 0.4;
      break;
    default:
      break;
  }
}

function describeClothingHint(item) {
  return CLOTHING_HINTS[item] || item;
}


export class LocalSelfieEvaluator {
  static evaluate({ face, userLocation, point, filterId = 'none', timestamp = Date.now() }) {
    if (!face) {
      return {
        status: 'needs_face',
        issues: ['No se detecto rostro en la foto'],
        achievedLevel: 0,
        levelResults: {},
        totalScore: 0,
        distanceMeters: null,
      };
    }

    const metrics = this.buildFaceMetrics(face);
    const distanceMeters = this.calculateDistanceMeters(userLocation, point?.coordinates);
    const issues = [];

    if (distanceMeters == null) {
      issues.push('Ubicacion del usuario desconocida.');
    }

    const baseScores = this.calculateBaseScores(metrics, distanceMeters);
    const levelRules = this.getLevelRules(point?.id || null);
    const levelResults = {};
    let achievedLevel = 0;

    for (let level = 1; level <= 3; level += 1) {
      const result = this.evaluateLevel(level, levelRules[level], metrics, distanceMeters, filterId);
      levelResults[level] = result;
      if (result.met) {
        achievedLevel = level;
      }
    }

    const totalScore = this.composeTotalScore(baseScores, achievedLevel);
    const badge = this.getBadgeForLevel(achievedLevel);
    const message = this.buildResultMessage({ achievedLevel, pointName: point?.name, levelResults });

    return {
      status: 'ok',
      timestamp,
      faceMetrics: metrics,
      gps: {
        distanceMeters,
        coordinates: userLocation || null,
        pointCoordinates: point?.coordinates || null,
      },
      baseScores,
      levelResults,
      achievedLevel,
      totalScore,
      badge,
      appliedFilter: filterId,
      message,
      issues,
    };
  }

  static buildFaceMetrics(face) {
    const smile = clamp(face.smilingProbability ?? 0, 0, 1);
    const leftEye = clamp(face.leftEyeOpenProbability ?? 0, 0, 1);
    const rightEye = clamp(face.rightEyeOpenProbability ?? 0, 0, 1);
    const eyes = (leftEye + rightEye) / 2;

    const yaw = face.yawAngle ?? 0;
    const roll = face.rollAngle ?? 0;
    const pitch = face.pitchAngle ?? 0;

    return {
      smile,
      eyes,
      yaw,
      roll,
      pitch,
      faceDetected: true,
      expressionType: this.getExpressionType(smile),
      gazeDirection: this.getGazeDirection(yaw),
      tilt: Math.abs(roll),
    };
  }

  static calculateBaseScores(metrics, distanceMeters) {
    const faceScore = metrics.faceDetected ? 100 : 0;
    const expressionScore = Math.round(metrics.smile * 100);
    const orientationScore = Math.round(100 - Math.min(Math.abs(metrics.yaw), 30) * 2);
    const eyesScore = Math.round(metrics.eyes * 100);
    const distanceScore = distanceMeters == null
      ? 0
      : Math.max(0, Math.round(100 - Math.min(distanceMeters, 120) * 0.6));

    return {
      facePresence: faceScore,
      expression: expressionScore,
      orientation: orientationScore,
      eyes: eyesScore,
      distance: distanceScore,
    };
  }

  static composeTotalScore(baseScores, achievedLevel) {
    const weighted = Object.entries(baseScores).reduce((acc, [key, value]) => {
      const weight = WEIGHTS[key] ?? 0;
      return acc + value * weight;
    }, 0);

    const levelBonus = achievedLevel * 5;
    return Math.round(Math.min(100, weighted + levelBonus));
  }

  static evaluateLevel(level, rules, metrics, distanceMeters, filterId) {
    const unlockRadius = 50;

    if (!rules) {
      return {
        met: false,
        score: 0,
        details: ['Sin reglas definidas para este nivel'],
        requirements: [],
      };
    }

    const requirements = [];

    const distanceMet = distanceMeters != null && distanceMeters <= rules.maxDistance;
    requirements.push({
      id: 'distance',
      met: distanceMet,
      detail: distanceMet
        ? `Distancia OK: ${distanceMeters?.toFixed(1)} m (maximo ${rules.maxDistance} m)`
        : `Demasiado lejos: ${distanceMeters == null ? 'sin datos' : `${distanceMeters.toFixed(1)} m`} (maximo ${rules.maxDistance} m)`,
    });

    const eyesMet = metrics.eyes >= (rules.minEyes ?? 0);
    requirements.push({
      id: 'eyes',
      met: eyesMet,
      detail: eyesMet
        ? `Ojos visibles (${Math.round(metrics.eyes * 100)}%)`
        : `Necesitamos ojos mas abiertos (${Math.round(metrics.eyes * 100)}%)`,
    });

    const expression = this.checkExpressionRequirement(metrics, rules);
    requirements.push(expression);

    const orientation = this.checkOrientationRequirement(metrics, rules);
    if (orientation) {
      requirements.push(orientation);
    }

    if (rules.requiredFilterId) {
      const filterMet = filterId === rules.requiredFilterId;
      requirements.push({
        id: 'filter',
        met: filterMet,
        detail: filterMet
          ? `Filtro requerido aplicado (${filterId})`
          : `Activa el filtro ${rules.requiredFilterId} para este nivel`,
      });
    } else if (rules.requireFilter) {
      const filterMet = filterId && filterId !== 'none';
      requirements.push({
        id: 'filter',
        met: filterMet,
        detail: filterMet
          ? `Filtro aplicado (${filterId})`
          : 'Aplica un filtro especial para este nivel',
      });
    }

    const met = requirements.every(req => req.met !== false);
    let score = Math.round(
      requirements.reduce((acc, req) => acc + (req.met ? 1 : 0), 0) / requirements.length * 100,
    );

    let appliedDistanceBonus = false;
    if (level === 1 && distanceMeters != null && distanceMeters <= unlockRadius) {
      const halfScore = 50;
      if (score < halfScore) {
        score = halfScore;
        appliedDistanceBonus = true;
      }
    }

    const detailLines = requirements.map(req => (req.met ? 'OK' : 'FALTA') + ' - ' + req.detail);

    if (appliedDistanceBonus) {
      detailLines.push(`Bonus distancia: dentro de ${unlockRadius}m, se garantiza el 50% del nivel 1`);
    }

    if (rules.manualChecks && rules.manualChecks.length) {
      rules.manualChecks.forEach(note => {
        detailLines.push(`Manual - ${note}`);
      });
    }

    return {
      met,
      achieved: met,
      score,
      percentage: score,
      maxScore: 100,
      description: rules.description,
      requirements,
      details: detailLines,
    };
  }

  static checkExpressionRequirement(metrics, rules) {
    const requirement = {
      id: 'expression',
      met: true,
      detail: '',
    };

    const target = rules.targetExpression || 'any';
    const smile = metrics.smile;

    if (rules.minSmile != null && smile < rules.minSmile) {
      requirement.met = false;
      requirement.detail = `Sonrisa insuficiente (${Math.round(smile * 100)}%, se necesita ${Math.round(rules.minSmile * 100)}%)`;
      return requirement;
    }

    if (rules.maxSmile != null && smile > rules.maxSmile) {
      requirement.met = false;
      requirement.detail = `Expresion demasiado sonriente (${Math.round(smile * 100)}%)`;
      return requirement;
    }

    switch (target) {
      case 'smile':
        requirement.met = smile >= (rules.minSmile ?? 0.5);
        requirement.detail = requirement.met
          ? 'Sonrisa lograda'
          : 'Hace falta una sonrisa clara';
        return requirement;
      case 'serious':
        requirement.met = smile <= (rules.maxSmile ?? 0.3);
        requirement.detail = requirement.met
          ? 'Expresion seria detectada'
          : 'Mantener un gesto mas serio';
        return requirement;
      case 'dramatic':
        requirement.met = smile <= (rules.maxSmile ?? 0.4) && Math.abs(metrics.yaw) >= (rules.minYaw ?? 10);
        requirement.detail = requirement.met
          ? 'Actitud dramatica conseguida'
          : 'Necesitamos mas dramatismo (giro o gesto serio)';
        return requirement;
      case 'power':
        requirement.met = smile >= (rules.minSmile ?? 0.45) && Math.abs(metrics.roll) <= (rules.maxRoll ?? 12);
        requirement.detail = requirement.met
          ? 'Pose de poder detectada'
          : 'Para la pose de poder abre mas la sonrisa y evita inclinar la cabeza';
        return requirement;
      default:
        requirement.detail = 'Expresion valida';
        return requirement;
    }
  }

  static checkOrientationRequirement(metrics, rules) {
    const hasYawRequirement = rules.minYaw != null || rules.maxYaw != null;
    const hasRollRequirement = rules.minRoll != null || rules.maxRoll != null;
    const hasPitchRequirement = rules.minPitch != null || rules.maxPitch != null;

    if (!hasYawRequirement && !hasRollRequirement && !hasPitchRequirement) {
      return null;
    }

    const yawAbs = Math.abs(metrics.yaw);
    const rollAbs = Math.abs(metrics.roll);
    const pitchAbs = Math.abs(metrics.pitch);

    const yawMet = (!hasYawRequirement) || ((rules.minYaw == null || yawAbs >= rules.minYaw) && (rules.maxYaw == null || yawAbs <= rules.maxYaw));
    const rollMet = (!hasRollRequirement) || ((rules.minRoll == null || rollAbs >= rules.minRoll) && (rules.maxRoll == null || rollAbs <= rules.maxRoll));
    const pitchMet = (!hasPitchRequirement) || ((rules.minPitch == null || pitchAbs >= rules.minPitch) && (rules.maxPitch == null || pitchAbs <= rules.maxPitch));

    const targetParts = [];
    if (hasYawRequirement) {
      const yawRange = [
        rules.minYaw != null ? `>= ${rules.minYaw} grados` : null,
        rules.maxYaw != null ? `<= ${rules.maxYaw} grados` : null,
      ].filter(Boolean).join(' y ');
      if (yawRange) {
        targetParts.push(`giro ${yawRange}`);
      }
    }
    if (hasRollRequirement) {
      const rollRange = [
        rules.minRoll != null ? `>= ${rules.minRoll} grados` : null,
        rules.maxRoll != null ? `<= ${rules.maxRoll} grados` : null,
      ].filter(Boolean).join(' y ');
      if (rollRange) {
        targetParts.push(`inclinacion ${rollRange}`);
      }
    }
    if (hasPitchRequirement) {
      const pitchRange = [
        rules.minPitch != null ? `>= ${rules.minPitch} grados` : null,
        rules.maxPitch != null ? `<= ${rules.maxPitch} grados` : null,
      ].filter(Boolean).join(' y ');
      if (pitchRange) {
        targetParts.push(`inclinacion vertical ${pitchRange}`);
      }
    }

    const orientationValues = [`yaw ${Math.round(metrics.yaw)} grados`, `roll ${Math.round(metrics.roll)} grados`];
    if (hasPitchRequirement) {
      orientationValues.push(`pitch ${Math.round(metrics.pitch)} grados`);
    }

    const targetText = targetParts.join(', ');
    const detailSuccess = `Orientacion conseguida (${orientationValues.join(', ')})`;
    const detailFailTarget = targetText ? `; objetivo ${targetText}` : '';
    const detailFail = `Ajusta la pose (${orientationValues.join(', ')}${detailFailTarget})`;

    const allMet = yawMet && rollMet && pitchMet;

    return {
      id: 'orientation',
      met: allMet,
      detail: allMet ? detailSuccess : detailFail,
    };
  }

  static getLevelRules(pointId) {
    const merged = {
      1: { ...DEFAULT_LEVEL_RULES[1] },
      2: { ...DEFAULT_LEVEL_RULES[2] },
      3: { ...DEFAULT_LEVEL_RULES[3] },
    };
    const challenge = getChallengeForPoint(pointId);
    [1, 2, 3].forEach((level) => {
      const baseRules = { ...merged[level] };
      const levelConfig = challenge.levels?.[level];
      if (levelConfig?.rules) {
        const manualChecks = Array.isArray(levelConfig.rules.manualChecks)
          ? levelConfig.rules.manualChecks
          : [];
        const restRules = { ...levelConfig.rules };
        delete restRules.manualChecks;
        Object.assign(baseRules, restRules);
        if (manualChecks.length) {
          baseRules.manualChecks = [
            ...(baseRules.manualChecks || []),
            ...manualChecks,
          ];
        }
      }
      if (levelConfig?.description) {
        baseRules.description = levelConfig.description;
      }
      if (baseRules.requiredFilterId && baseRules.requireFilter == null) {
        baseRules.requireFilter = true;
      }
      merged[level] = baseRules;
    });
    return merged;
  }
  static getExpressionType(smile) {
    if (smile >= 0.6) return 'smile';
    if (smile <= 0.2) return 'serious';
    return 'neutral';
  }

  static getGazeDirection(yaw) {
    if (yaw > 10) return 'right';
    if (yaw < -10) return 'left';
    return 'front';
  }

  static calculateDistanceMeters(userLocation, pointCoordinates) {
    if (!userLocation || !pointCoordinates) {
      return null;
    }

    const lat1 = toRadians(userLocation.latitude);
    const lat2 = toRadians(pointCoordinates.lat);
    const deltaLat = toRadians(pointCoordinates.lat - userLocation.latitude);
    const deltaLng = toRadians(pointCoordinates.lng - userLocation.longitude);

    const a = Math.sin(deltaLat / 2) ** 2
      + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(EARTH_RADIUS_METERS * c);
  }

  static getBadgeForLevel(level) {
    if (level === 3) return { name: 'POSTURAITOR MASTER', marker: 'MASTER', color: '#FFD700' };
    if (level === 2) return { name: 'POSTURAITOR PRO', marker: 'PRO', color: '#C0C0C0' };
    if (level === 1) return { name: 'POSTURAITOR ROOKIE', marker: 'ROOKIE', color: '#CD7F32' };
    return { name: 'POSTURAITOR SCOUT', marker: 'SCOUT', color: '#666666' };
  }

  static buildResultMessage({ achievedLevel, pointName, levelResults }) {
    const locationText = pointName ? ` en ${pointName}` : '';
    const nextLevel = achievedLevel < 3 ? levelResults[achievedLevel + 1] : null;

    if (achievedLevel === 3) {
      return `Nivel maximo conseguido${locationText}. Foto perfecta.`;
    }
    if (achievedLevel === 2) {
      return `Nivel Pro conseguido${locationText}. Busca un giro o gesto mas marcado para llegar al nivel 3.`;
    }
    if (achievedLevel === 1) {
      return `Nivel 1 conseguido${locationText}. Repite con mas actitud o cercania para subir de nivel.`;
    }
    if (nextLevel) {
      const pending = nextLevel.requirements
        .map(req => (req.met ? null : req.detail))
        .filter(Boolean)
        .join(' ');
      return `Aun no desbloqueaste el nivel ${achievedLevel + 1}. ${pending}`.trim();
    }
    return 'Toma un selfie mas cerca del punto, con rostro visible, para empezar a sumar niveles.';
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}
