export const CHALLENGE_CONFIG = {
  1: {
    name: 'Palacio de Cibeles',
    levels: {
      1: {
        description: 'Skyline al fondo con sonrisa relajada.',
        rules: {
          maxDistance: 90,
          minSmile: 0.3,
          minEyes: 0.3,
        },
      },
      2: {
        description: 'De espaldas a la vista con gesto de mando.',
        rules: {
          maxDistance: 70,
          targetExpression: 'serious',
          maxSmile: 0.45,
          minEyes: 0.35,
          minYaw: 6,
        },
      },
      3: {
        description: 'Gran angular y pose de poder dominando la ciudad.',
        rules: {
          maxDistance: 60,
          targetExpression: 'power',
          minSmile: 0.5,
          minEyes: 0.35,
          maxRoll: 12,
          minYaw: 4,
          manualChecks: ['Activa el gran angular o extiende bien el brazo para cubrir el skyline.'],
        },
      },
    },
  },
  2: {
    name: 'Palacio de Linares',
    levels: {
      1: {
        description: 'Selfie con fachada visible y gesto amable.',
        rules: {
          maxDistance: 70,
          minSmile: 0.35,
          minEyes: 0.35,
        },
      },
      2: {
        description: 'Grito silencioso con ojos muy abiertos.',
        rules: {
          maxDistance: 60,
          targetExpression: 'serious',
          maxSmile: 0.35,
          minEyes: 0.5,
          manualChecks: ['Abre la boca como si congelaras un grito.'],
        },
      },
      3: {
        description: 'Selfie de leyenda en blanco y negro.',
        rules: {
          maxDistance: 60,
          targetExpression: 'dramatic',
          maxSmile: 0.2,
          minEyes: 0.55,
          requireFilter: true,
          requiredFilterId: 'blackwhite',
          manualChecks: ['Activa el filtro blanco y negro antes de disparar.'],
        },
      },
    },
  },
  3: {
    name: 'Banco de Espana',
    levels: {
      1: {
        description: 'Banco completo con sonrisa controlada.',
        rules: {
          maxDistance: 70,
          minSmile: 0.3,
          minEyes: 0.3,
        },
      },
      2: {
        description: 'Mirada de atraco planificado.',
        rules: {
          maxDistance: 60,
          targetExpression: 'serious',
          maxSmile: 0.3,
          minYaw: 6,
          manualChecks: ['Sube la capucha si la llevas puesta.'],
        },
      },
      3: {
        description: 'Cruza los brazos y mira con determinacion.',
        rules: {
          maxDistance: 50,
          targetExpression: 'dramatic',
          maxSmile: 0.15,
          minYaw: 8,
          minEyes: 0.35,
          manualChecks: ['Cruza los brazos para reforzar la pose.'],
        },
      },
    },
  },
  4: {
    name: 'Minerva',
    levels: {
      1: {
        description: 'Estatua de fondo con sonrisa suave.',
        rules: {
          maxDistance: 80,
          minSmile: 0.35,
          minEyes: 0.3,
        },
      },
      2: {
        description: 'Pide poder a Minerva con brazo elevado.',
        rules: {
          maxDistance: 70,
          targetExpression: 'smile',
          minSmile: 0.45,
          minYaw: 5,
          manualChecks: ['Levanta un brazo apuntando a la diosa.'],
        },
      },
      3: {
        description: 'Contrapicado dramatizado mirando al cielo.',
        rules: {
          maxDistance: 55,
          targetExpression: 'dramatic',
          maxSmile: 0.35,
          minYaw: 8,
          minPitch: 6,
          manualChecks: ['Inclina el movil hacia arriba para marcar el contrapicado.'],
        },
      },
    },
  },
  5: {
    name: 'Semaforo de 1926',
    levels: {
      1: {
        description: 'Paso de cebra con semaforo visible.',
        rules: {
          maxDistance: 50,
          minSmile: 0.35,
          minEyes: 0.35,
        },
      },
      2: {
        description: 'Cruza cuando se pone verde con energia.',
        rules: {
          maxDistance: 45,
          targetExpression: 'smile',
          minSmile: 0.45,
          minEyes: 0.4,
          manualChecks: ['Aprovecha el momento verde del semaforo.'],
        },
      },
      3: {
        description: 'Retrato vintage del trafico madrileno.',
        rules: {
          maxDistance: 45,
          targetExpression: 'serious',
          maxSmile: 0.35,
          minYaw: 6,
          requireFilter: true,
          requiredFilterId: 'sepia',
          manualChecks: ['Activa el filtro sepia para efecto 1900.', 'Intenta capturar luces o movimiento de coches.'],
        },
      },
    },
  },
  6: {
    name: 'Edificio Metropolis',
    levels: {
      1: {
        description: 'Edificio completo con sonrisa natural.',
        rules: {
          maxDistance: 60,
          minSmile: 0.35,
          minEyes: 0.35,
        },
      },
      2: {
        description: 'Imita a la Victoria Alada con brazo arriba.',
        rules: {
          maxDistance: 55,
          targetExpression: 'power',
          minSmile: 0.45,
          minYaw: 6,
          manualChecks: ['Levanta un brazo siguiendo la pose de la estatua.'],
        },
      },
      3: {
        description: 'Gran angular dorado con pose heroica.',
        rules: {
          maxDistance: 50,
          targetExpression: 'power',
          minSmile: 0.5,
          minEyes: 0.35,
          minYaw: 8,
          maxRoll: 10,
          manualChecks: ['Eleva ligeramente la barbilla para resaltar la cupula.'],
        },
      },
    },
  },
  7: {
    name: 'Museo Chicote',
    levels: {
      1: {
        description: 'Barra y neones con sonrisa social.',
        rules: {
          maxDistance: 40,
          minSmile: 0.4,
          minEyes: 0.35,
        },
      },
      2: {
        description: 'Coctel protagonista en la toma.',
        rules: {
          maxDistance: 40,
          targetExpression: 'smile',
          minSmile: 0.45,
          minEyes: 0.35,
          manualChecks: ['Muestra la copa en primer plano.'],
        },
      },
      3: {
        description: 'Mirada misteriosa con luces nocturnas.',
        rules: {
          maxDistance: 40,
          targetExpression: 'serious',
          maxSmile: 0.3,
          minYaw: 6,
          requireFilter: true,
          requiredFilterId: 'warm',
          manualChecks: ['Gira ligeramente la cara para dejar que las luces iluminen medio rostro.'],
        },
      },
    },
  },
  8: {
    name: 'WOW Concept',
    levels: {
      1: {
        description: 'Reflejo creativo en espejos digitales.',
        rules: {
          maxDistance: 35,
          minSmile: 0.35,
          minEyes: 0.3,
        },
      },
      2: {
        description: 'Reflejo distorsionado protagonista.',
        rules: {
          maxDistance: 35,
          targetExpression: 'smile',
          minSmile: 0.4,
          minYaw: 6,
          manualChecks: ['Usa un espejo curvado o pantalla con efecto distorsionado.'],
        },
      },
      3: {
        description: 'Selfie surrealista efecto futuro.',
        rules: {
          maxDistance: 35,
          targetExpression: 'dramatic',
          maxSmile: 0.4,
          minYaw: 10,
          requireFilter: true,
          requiredFilterId: 'cool',
          manualChecks: ['Incluye varios reflejos o angulos extremos en cuadro.'],
        },
      },
    },
  },
  9: {
    name: 'Edificio Telefonica',
    levels: {
      1: {
        description: 'Rascacielos completo con sonrisa confiada.',
        rules: {
          maxDistance: 70,
          minSmile: 0.35,
          minEyes: 0.3,
        },
      },
      2: {
        description: 'Contrapicado con gran angular.',
        rules: {
          maxDistance: 60,
          targetExpression: 'serious',
          maxSmile: 0.4,
          minPitch: 8,
          manualChecks: ['Inclinate un poco hacia atras para exagerar la altura.'],
        },
      },
      3: {
        description: 'Hero shot estilo comic.',
        rules: {
          maxDistance: 55,
          targetExpression: 'dramatic',
          maxSmile: 0.35,
          minYaw: 12,
          minPitch: 12,
          manualChecks: ['Alinea la fachada tras tu hombro como si se desplomara.'],
        },
      },
    },
  },
  10: {
    name: 'Primark XXL',
    levels: {
      1: {
        description: 'Cupula y escaleras con sonrisa feliz.',
        rules: {
          maxDistance: 50,
          minSmile: 0.4,
          minEyes: 0.35,
        },
      },
      2: {
        description: 'Abraza el caos levantando los brazos.',
        rules: {
          maxDistance: 45,
          targetExpression: 'smile',
          minSmile: 0.5,
          minEyes: 0.4,
          manualChecks: ['Extiende los brazos para cubrir la cupula.'],
        },
      },
      3: {
        description: 'Momento fan del shopping.',
        rules: {
          maxDistance: 45,
          targetExpression: 'smile',
          minSmile: 0.6,
          minEyes: 0.45,
          requireFilter: true,
          requiredFilterId: 'warm',
          manualChecks: ['Incluye bolsas o la pasarela luminosa si es posible.'],
        },
      },
    },
  },
  11: {
    name: 'Edificio Carrion',
    levels: {
      1: {
        description: 'Selfie nocturno con neon visible.',
        rules: {
          maxDistance: 60,
          minSmile: 0.35,
          minEyes: 0.35,
          manualChecks: ['Evita el flash para dejar que el neon ilumine.'],
        },
      },
      2: {
        description: 'Encuadra el cartel sin quemar la luz.',
        rules: {
          maxDistance: 55,
          targetExpression: 'serious',
          maxSmile: 0.45,
          minYaw: 6,
          manualChecks: ['Colocate justo debajo o frente al neon manteniendo la luz en el rostro.'],
        },
      },
      3: {
        description: 'Retrato iluminado solo por el neon.',
        rules: {
          maxDistance: 55,
          targetExpression: 'dramatic',
          maxSmile: 0.35,
          minEyes: 0.4,
          requireFilter: true,
          requiredFilterId: 'cool',
          manualChecks: ['Ajusta la exposicion para que el neon pinte tu cara.'],
        },
      },
    },
  },
  12: {
    name: 'Plaza de Callao',
    levels: {
      1: {
        description: 'Pantallas gigantes como fondo.',
        rules: {
          maxDistance: 70,
          minSmile: 0.35,
          minEyes: 0.3,
        },
      },
      2: {
        description: 'Gira hasta que una pantalla te ilumine.',
        rules: {
          maxDistance: 60,
          targetExpression: 'smile',
          minSmile: 0.45,
          minYaw: 8,
          manualChecks: ['Gira el cuerpo para atrapar la luz directa de una pantalla.'],
        },
      },
      3: {
        description: 'Anuncio viviente solo con luz LED.',
        rules: {
          maxDistance: 60,
          targetExpression: 'dramatic',
          maxSmile: 0.4,
          minEyes: 0.4,
          requireFilter: true,
          requiredFilterId: 'cool',
          manualChecks: ['Evita otras fuentes de luz y deja que las pantallas iluminen tu cara.'],
        },
      },
    },
  },
  13: {
    name: 'Teatro Principe',
    levels: {
      1: {
        description: 'Rotulo azul protagonizando la escena.',
        rules: {
          maxDistance: 50,
          minSmile: 0.4,
          minEyes: 0.35,
        },
      },
      2: {
        description: 'Actitud de monologo con ceja arriba.',
        rules: {
          maxDistance: 45,
          targetExpression: 'power',
          minSmile: 0.45,
          maxRoll: 10,
          manualChecks: ['Cruza los brazos y levanta una ceja.'],
        },
      },
      3: {
        description: 'Preparado para soltar una bomba en directo.',
        rules: {
          maxDistance: 45,
          targetExpression: 'dramatic',
          maxSmile: 0.45,
          minYaw: 10,
          manualChecks: ['Inclinate levemente hacia la camara como si susurraras un secreto.'],
        },
      },
    },
  },
  14: {
    name: 'Teatros Lope de Vega y Coliseum',
    levels: {
      1: {
        description: 'Ambas marquesinas en cuadro.',
        rules: {
          maxDistance: 65,
          minSmile: 0.35,
          minEyes: 0.35,
        },
      },
      2: {
        description: 'Duda teatral apuntando a los dos lados.',
        rules: {
          maxDistance: 60,
          targetExpression: 'smile',
          minSmile: 0.45,
          minYaw: 8,
          manualChecks: ['Senala hacia ambos teatros con las manos.'],
        },
      },
      3: {
        description: 'Panoramica nocturna estilo Broadway.',
        rules: {
          maxDistance: 60,
          targetExpression: 'dramatic',
          maxSmile: 0.4,
          minYaw: 12,
          requireFilter: true,
          requiredFilterId: 'vintage',
          manualChecks: ['Gira el movil para abarcar las dos fachadas brillando.'],
        },
      },
    },
  },
  15: {
    name: 'Plaza de Espana',
    levels: {
      1: {
        description: 'Selfie junto a Quijote y Sancho.',
        rules: {
          maxDistance: 60,
          minSmile: 0.35,
          minEyes: 0.3,
        },
      },
      2: {
        description: 'Imita las poses clasicas del monumento.',
        rules: {
          maxDistance: 55,
          targetExpression: 'serious',
          maxSmile: 0.35,
          minYaw: 6,
          manualChecks: ['Alinea tu pose con la estatua que tengas al lado.'],
        },
      },
      3: {
        description: 'Vista desde el skybar con actitud heroica.',
        rules: {
          maxDistance: 40,
          targetExpression: 'power',
          minSmile: 0.5,
          minPitch: 8,
          manualChecks: ['Si subes al skybar muestra el vertigo del suelo transparente.'],
        },
      },
    },
  },
};

const FALLBACK_CHALLENGE = {
  name: 'Reto generico',
  levels: {
    1: {
      description: 'Selfie cercano con sonrisa natural.',
      rules: {
        maxDistance: 90,
        minSmile: 0.3,
        minEyes: 0.3,
      },
    },
    2: {
      description: 'Añade actitud girando ligeramente el rostro.',
      rules: {
        maxDistance: 70,
        targetExpression: 'power',
        minSmile: 0.45,
        minYaw: 6,
      },
    },
    3: {
      description: 'Pose potente con filtro creativo.',
      rules: {
        maxDistance: 50,
        targetExpression: 'dramatic',
        maxSmile: 0.4,
        minYaw: 10,
        requireFilter: true,
        requiredFilterId: 'vintage',
      },
    },
  },
};

export function getChallengeForPoint(pointId) {
  return CHALLENGE_CONFIG[pointId] || FALLBACK_CHALLENGE;
}

export function getLevelChallenge(pointId, level) {
  const challenge = getChallengeForPoint(pointId);
  return challenge.levels?.[level] || FALLBACK_CHALLENGE.levels[level];
}

export function getLevelDescriptions(pointId) {
  const challenge = getChallengeForPoint(pointId);
  return {
    1: challenge.levels?.[1]?.description || FALLBACK_CHALLENGE.levels[1].description,
    2: challenge.levels?.[2]?.description || FALLBACK_CHALLENGE.levels[2].description,
    3: challenge.levels?.[3]?.description || FALLBACK_CHALLENGE.levels[3].description,
  };
}
