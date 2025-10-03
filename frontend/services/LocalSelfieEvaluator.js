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

// Ratios lajos para declarar un nivel conseguido (además de requisitos obligatorios)
const PASS_RATIOS = {
  1: 0.5,   // 50% de requisitos basta en Nivel 1
  2: 0.66,  // ~2/3 en Nivel 2
  3: 0.75,  // ~3/4 en Nivel 3
};

function pick(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}



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
    const message = this.buildResultMessage({ achievedLevel, pointName: point?.name, pointId: point?.id, levelResults });

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

    const distanceMet = distanceMeters != null && distanceMeters <= (rules.maxDistance + 10); // margen laxo +10 m
    const nearText = [
      'Estás en rango. 🔥',
      'Cerca del spot. Nice. 💯',
      'Distancia on point. ✅',
    ];
    const farText = [
      `Camina unos pasitos: apunta a < ${rules.maxDistance} m.`,
      `A dos zancadas del spot: intenta < ${rules.maxDistance} m.`,
      `Acércate un pelín más (target ${rules.maxDistance} m).`,
    ];
    const distDetail = distanceMet
      ? pick(nearText)
      : `${pick(farText)}${distanceMeters == null ? '' : ` (ahora ~${distanceMeters.toFixed(0)} m)`}`;
    requirements.push({ id: 'distance', met: distanceMet, detail: distDetail });

    const eyesMet = metrics.eyes >= ((rules.minEyes ?? 0) - 0.05); // margen laxo -5%
    const eyesOk = [
      'Ojitos on. 👀',
      'Mirada a cámara. ✅',
      'Tus ojos se ven frescos. ✨',
    ];
    const eyesTip = [
      'Abre un poco más los ojos o busca mejor luz.',
      'Mira a cámara y sube la luz un pelín.',
      'Acerca la cara y evita sombras fuertes.',
    ];
    requirements.push({ id: 'eyes', met: eyesMet, detail: eyesMet ? pick(eyesOk) : pick(eyesTip) });

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
          ? 'Filtro correcto aplicado. 🎛️'
          : `Activa el filtro ${rules.requiredFilterId} antes de disparar. 🎛️`,
      });
    } else if (rules.requireFilter) {
      const filterMet = filterId && filterId !== 'none';
      requirements.push({
        id: 'filter',
        met: filterMet,
        detail: filterMet
          ? 'Filtro activado. 🎨'
          : 'Activa cualquier filtro especial antes de disparar. 🎨',
      });
    }

    const mandatoryIds = [ ...(rules.requiredFilterId ? ['filter'] : []) ];
    const mandatoryMet = requirements
      .filter(r => mandatoryIds.includes(r.id))
      .every(r => r.met);

    const metCount = requirements.reduce((acc, req) => acc + (req.met ? 1 : 0), 0);
    const ratio = requirements.length ? metCount / requirements.length : 0;
    const passRatio = PASS_RATIOS[level] ?? 0.75;
    let met = mandatoryMet && ratio >= passRatio;
    let softGateApplied = false;
    if (met && ratio < passRatio + 0.08) {
      if (Math.random() < 0.2) { // 20% de las veces, pide un intento más si vas justo
        met = false;
        softGateApplied = true;
      }
    }

    let score = Math.round(ratio * 100);

    let appliedDistanceBonus = false;
    if (level === 1 && distanceMeters != null && distanceMeters <= unlockRadius) {
      const halfScore = 50;
      if (score < halfScore) {
        score = halfScore;
        appliedDistanceBonus = true;
      }
    }

    const okTags = ['OK - ', '🔥 OK - ', '✅ OK - ', '💯 OK - '];
    const tipTags = ['TIP - ', '💡 TIP - ', '⚡ TIP - ', '👀 TIP - '];
    const detailLines = requirements.map(req => (req.met ? pick(okTags) : pick(tipTags)) + req.detail);

    if (appliedDistanceBonus) {
      const bonusLines = [
        `Bonus de cercanía: dentro de ${unlockRadius} m aseguras el 50% del L1.`,
        `🔥 Bonus por rango: a < ${unlockRadius} m garantizas el 50% del L1.`,
      ];
      detailLines.push(pick(bonusLines));
    }

    if (softGateApplied && !met) {
      detailLines.push(pick([
        'Casi lo tienes, otra toma y cae. 💪',
        'Muy cerca: repite y entra. ⚡',
        'Un ajuste y pasas seguro. 🔁',
      ]));
    }

    if (rules.manualChecks && rules.manualChecks.length) {
      rules.manualChecks.forEach(note => {
        const manualTags = ['Consejo - ', 'Hack - ', 'Pro tip - ', 'Idea - '];
        detailLines.push(pick(manualTags) + note);
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

    if (rules.minSmile != null && smile < rules.minSmile - 0.05) {
      requirement.met = false;
      const tips = ['Sonríe un poco más.', 'Dale una sonrisa más clara.', 'Activa modo selfie: sonrisa ON.'];
      requirement.detail = pick(tips);
      return requirement;
    }

    if (rules.maxSmile != null && smile > rules.maxSmile + 0.05) {
      requirement.met = false;
      const tips = ['Relaja la sonrisa y ponte serio.', 'Gesto más serio para este nivel.', 'Menos sonrisa, más actitud.'];
      requirement.detail = pick(tips);
      return requirement;
    }

    switch (target) {
      case 'smile':
        requirement.met = smile >= (rules.minSmile ?? 0.5);
        requirement.detail = requirement.met
          ? pick(['Sonrisa clara. 🔥', 'Esa sonrisa vende. 😎', 'Smile ON. 💫'])
          : pick(['Sonríe de forma más evidente.', 'Sube esa sonrisa un puntito.', 'Dale sonrisa selfie-mode.']);
        return requirement;
      case 'serious':
        requirement.met = smile <= (rules.maxSmile ?? 0.3);
        requirement.detail = requirement.met
          ? pick(['Gesto serio logrado. 🖤', 'Mood serio al punto. ✔️', 'Poker face ON.'])
          : pick(['Relaja la sonrisa y mantén un gesto serio.', 'Menos sonrisa, más game face.', 'Pon cara seriecita.']);
        return requirement;
      case 'dramatic':
        requirement.met = smile <= (rules.maxSmile ?? 0.4) && Math.abs(metrics.yaw) >= (rules.minYaw ?? 10);
        requirement.detail = requirement.met
          ? pick(['Actitud dramática conseguida. 💥', 'Drama queen/king vibes. 🎭', 'Dramatismo ON.'])
          : pick(['Gira un poco la cara y adopta un gesto más serio.', 'Gira leve + gesto serio.', 'Un giro y más drama.']);
        return requirement;
      case 'power':
        requirement.met = smile >= (rules.minSmile ?? 0.45) && Math.abs(metrics.roll) <= (rules.maxRoll ?? 12);
        requirement.detail = requirement.met
          ? pick(['Pose de poder detectada. 🚀', 'Power vibes. 💪', 'Dominando el frame. 👑'])
          : pick(['Sonríe un poco y mantén la cabeza más recta.', 'Una sonrisa + cabeza recta y listo.', 'Endereza un poco la cabeza y sonríe.']);
        return requirement;
      default:
        requirement.detail = pick(['Expresión válida.', 'Buen gesto.', 'Actitud OK.']);
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

    const allMet = yawMet && rollMet && pitchMet;

    if (allMet) {
      return {
        id: 'orientation',
        met: true,
        detail: pick(['Pose conseguida. ¡Se ve con actitud! 🔥', 'Orientación on point. 💯', 'Ese ángulo está fino. 😎'])
      };
    }

    // Construir sugerencias amigables según lo que falte
    const tips = [];
    if (!yawMet) {
      if (rules.minYaw != null && yawAbs < rules.minYaw) {
        tips.push(pick(['Gira un pelín la cara hacia un lado.', 'Dale un giro suave a la cara.', 'Rota leve la cara para dar flow.']));
      } else if (rules.maxYaw != null && yawAbs > rules.maxYaw) {
        tips.push(pick(['No gires tanto; mira más al frente.', 'Menos giro, más frente.', 'Vuelve un poco al frente.']));
      }
    }
    if (!rollMet) {
      if (rules.minRoll != null && rollAbs < rules.minRoll) {
        tips.push(pick(['Ladea un poco la cabeza.', 'Inclina la cabeza un pelín.', 'Dale un tilt suave.']));
      } else if (rules.maxRoll != null && rollAbs > rules.maxRoll) {
        tips.push(pick(['Cabeza más recta.', 'Menos tilt, más recto.', 'Endereza un pelín la cabeza.']));
      }
    }
    if (!pitchMet) {
      if (rules.minPitch != null && pitchAbs < rules.minPitch) {
        tips.push(pick(['Levanta o baja un poco la barbilla.', 'Ajusta la barbilla leve.', 'Barbilla un pelín arriba/abajo.']));
      } else if (rules.maxPitch != null && pitchAbs > rules.maxPitch) {
        tips.push(pick(['Mira un poco más al frente.', 'Barbilla neutra, mira al frente.', 'Centra la mirada más al frente.']));
      }
    }

    return {
      id: 'orientation',
      met: false,
      detail: tips.join(' '),
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

  static buildResultMessage({ achievedLevel, pointName, pointId, levelResults }) {
    // Helper: point flavor lines
    const POINT_FLAVORS = {
      1: {
        success: ['Skyline flex. 📸🌆', 'Modo boss de Madrid. 👑', 'Panorámica que rompe el feed. 💥'],
        tip: ['Que se sienta la ciudad al fondo. 🌆', 'Abre plano o gran angular vibes. 🌀', 'Busca el mirador para ese 360. 🧭'],
      },
      2: {
        success: ['Leyenda vibes. 👻🖤', 'Foto de leyenda en B&N. 🖤', 'Drama gótico a tope. 🎭'],
        tip: ['Grito silencioso + ojos abiertos. 😱', 'Prueba blanco y negro para la leyenda. 🖤', 'Pon haunted mood, menos sonrisa.'],
      },
      3: {
        success: ['Modo atraco ON. 🧢💼', 'Malote elegante. 🔥', 'Plan maestro vibes. 🧠'],
        tip: ['Capucha, mirada fija y cero sonrisa. 🧢', 'Cruza brazos y fija mirada. 💪', 'Menos sonrisa, más plan.'],
      },
      4: {
        success: ['Diosa vibe. ⚡👑', 'Contrapicado celestial. 🌌', 'Recibiendo poder de Minerva. ✨'],
        tip: ['Levanta brazo hacia Minerva. ✋', 'Inclina móvil en contrapicado. 📱⬆️', 'Mira un poco al cielo. ☁️'],
      },
      5: {
        success: ['Clásico madrileño con flow. 🚦', 'Vintage tráfico vibes. 🚕', 'Cruce con energía. ⚡'],
        tip: ['Aprovecha semáforo en verde. 🟢', 'Prueba sepia/vintage mood. 🧡', 'Que se vea el semáforo.'],
      },
      6: { // Edificio Metropolis
        success: ['Cúpula dorada vibes. ✨', 'Postal de Metrópolis. 💎', 'Brilla como la cúpula. 🌟'],
        tip: ['Alinea la cúpula en tu hombro. 🏛️', 'Contrapicado suave y a brillar. 📱⬆️', 'Busca luz lateral doradita. ✨'],
      },
      7: { // Museo Chicote
        success: ['Coctel vibes clásicos. 🍸', 'Bar mítico, pose cool. 😎', 'Nitidez con estilo. ✨'],
        tip: ['Neón al fondo y actitud. ✨', 'Cara fresca, nada de flash. 🚫⚡', 'Inclínate suave hacia cámara.'],
      },
      8: { // WOW Concept
        success: ['Retail futurista, tú al mando. 🛍️', 'Concept vibes. 💫', 'Foto con estética clean. ✨'],
        tip: ['Incluye pasarela o luces. 💡', 'Busca simetría y centro. ➕', 'Luz frontal, cero sombras. 🔆'],
      },
      9: { // Edificio Telefónica
        success: ['Icono skyline tech. 📡', 'Histórico pero futurista. ⚡', 'Foto de altura. ⛰️'],
        tip: ['Marca verticales rectas. ⬆️', 'Giro leve para dramatismo. 🎭', 'Evita inclinación excesiva.'],
      },
      10: { // Primark XXL
        success: ['Gigante retail energy. 🛒', 'Escaleras y luces on. ✨', 'Plano amplio, tú en foco. 🔍'],
        tip: ['Abre plano o gran angular. 🌀', 'Incluye bolsas si puedes. 🛍️', 'Evita quemar luces. 🔆'],
      },
      11: { // Edificio Carrión (Schweppes)
        success: ['Neón Schweppes vibes. 🟨', 'Gran Vía movie frame. 🎬', 'Nocturna fina. 🌙'],
        tip: ['No uses flash; deja que el neón pinte. 💡', 'Colócate frente al neón. 📍', 'Ajusta exposición un poco. 📉'],
      },
      12: { // Plaza de Callao
        success: ['Centro neurálgico vibes. 🌀', 'Panorámica urbana top. 🌆', 'Movimiento con estilo. 🏙️'],
        tip: ['Incluye pantallas o rótulos. 🖥️', 'Gira el cuerpo para coger luz. 💡', 'Evita fuentes de luz que quemen.'],
      },
      13: { // Teatro Príncipe
        success: ['Drama teatral. 🎭', 'Foco en ti, backstage al fondo. 🔦', 'Teatralidad con clase. ✨'],
        tip: ['Cruza brazos y sube ceja. 🧐', 'Inclínate levemente hacia cámara. 📐', 'Gesto susurro, secreto. 🤫'],
      },
      14: { // Lope de Vega y Coliseum
        success: ['Broadway vibes. 🌃', 'Dos marquesinas, tú en medio. 🎟️', 'Panorámica showtime. ✨'],
        tip: ['Señala ambos teatros. 👈👉', 'Gira el móvil para abarcar. 📱', 'Mejor de noche con luces. 🌙'],
      },
      15: { // Plaza de España
        success: ['Quijote + Sancho vibes. 🗡️', 'Heroínas/heroicos en la plaza. 🛡️', 'Skybar épico. 🌇'],
        tip: ['Alinea tu pose con la estatua. 🗿', 'Actitud heroica y barbilla neutra. ✊', 'Si subes al skybar, muestra vértigo. 😵‍💫'],
      },
    };
    function flavor(pointId, kind) {
      const pack = POINT_FLAVORS[pointId];
      if (!pack) return '';
      return pick(pack[kind] || []) || '';
    }
    const locationText = pointName ? ` en ${pointName}` : '';
    const nextLevel = achievedLevel < 3 ? levelResults[achievedLevel + 1] : null;

    if (achievedLevel === 3) {
      const base = pick([
        `Nivel 3${locationText}. GOD MODE. Portada de revista. 🔥`,
        `L3${locationText}. Máximo flow. Foto épica. 🚀`,
        `MASTER${locationText}. Te has pasado el juego. 💫`,
      ]);
      const extra = flavor(pointId, 'success');
      return extra ? `${base} ${extra}` : base;
    }
    if (achievedLevel === 2) {
      const base = pick([
        `Nivel 2${locationText}. PRO vibes. Un giro más y caes en L3. 😎`,
        `L2${locationText}. Muy sólido. Sube actitud y rematas L3. 💥`,
        `PRO${locationText}. A un paso del top. Dale un plus y entras. 🔜`,
      ]);
      const extra = flavor(pointId, 'success');
      return extra ? `${base} ${extra}` : base;
    }
    if (achievedLevel === 1) {
      const base = pick([
        `Nivel 1${locationText}. Calentando. Un poco más de cerca o actitud y subes. 🔥`,
        `L1${locationText}. Bien jugado. Repite con más flow y te vas al L2. ✨`,
        `Rookie${locationText}. Ya cuentas. Ahora busca luz y actitud para subir. 📈`,
      ]);
      const extra = flavor(pointId, 'success');
      return extra ? `${base} ${extra}` : base;
    }
    if (nextLevel) {
      const pending = nextLevel.requirements
        .map(req => (req.met ? null : req.detail))
        .filter(Boolean)
        .join(' ');
      const base = pick([
        `Casi. ${pending}`,
        `Muy cerca. ${pending}`,
        `Otra toma y cae. ${pending}`,
      ]).trim();
      const extra = flavor(pointId, 'tip');
      return extra ? `${base} ${extra}` : base;
    }
    const base = pick([
      'Acércate al spot y mírate a cámara. Let’s go. 💫',
      'Un poco más cerca y con luz de cara. 🔆',
      'Pega dos pasos, mira a cámara y dispara. 🚶‍♂️📸',
    ]);
    const extra = flavor(pointId, 'tip');
    return extra ? `${base} ${extra}` : base;
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}
