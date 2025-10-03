import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Platform, Alert, Linking } from 'react-native';

// Generador de frases con punch + hashtags por punto/nivel
function generatePunchShareText(selfieData, platform) {
  const pick = (arr) => Array.isArray(arr) && arr.length ? arr[Math.floor(Math.random() * arr.length)] : '';
  const { stopId, hashtag, achievedLevel, targetLevel } = selfieData || {};
  const level = achievedLevel || targetLevel || 1;
  const lvlTag = `#L${level}`;
  const baseTags = ['#POSTURAITOR', '#GranVia', '#Madrid'];
  const tags = [hashtag, lvlTag, ...baseTags].filter(Boolean).join(' ');

  const PUNCH = {
    1: { 1: ['Skyline ON. Boss vibes en Cibeles.', 'Panorámica chill en Cibeles.'], 2: ['De espaldas al paisaje, mando total.', 'Cibeles en modo líder.'], 3: ['Gran angular + power pose. Madrid a mis pies.', 'God mode en Cibeles.'] },
    2: { 1: ['Fachada on, vibes elegantes.', 'Linares con gesto amable.'], 2: ['Grito silencioso + ojos abiertos.', 'Leyenda mood activado.'], 3: ['Blanco y negro + drama fino.', 'Foto de leyenda en Linares.'] },
    3: { 1: ['Banco en cuadro, clase y flow.', 'Sonrisa controlada en el banco.'], 2: ['Mirada de plan maestro.', 'Modo atraco ON, cero risas.'], 3: ['Cruza brazos + mirada fija. Malote elegante.', 'Dominando el frame frente al banco.'] },
    4: { 1: ['Minerva al fondo, sonrisa suave.', 'Diosa vibe a la vista.'], 2: ['Levanta el brazo: energías de diosa.', 'Poder de Minerva en subida.'], 3: ['Contrapicado celestial. Mira al cielo.', 'Revelación divina en el frame.'] },
    5: { 1: ['Semáforo visible, cruce clásico.', 'Gran Vía old school.'], 2: ['Cruza en verde con energía.', 'Flow de cruce en verde.'], 3: ['Sepia + luces de coches.', 'Vintage tráfico vibes.'] },
    6: { 1: ['Metrópolis en cuadro, brillo fino.', 'Postal de Metrópolis.'], 2: ['Cúpula dorada vibes.', 'Alinea cúpula y a brillar.'], 3: ['Contrapicado elegante, a tope.', 'Brillando como la cúpula.'] },
    7: { 1: ['Chicote vibes, gesto friendly.', 'Clásico con estilo.'], 2: ['Neón y pose cool.', 'Nitidez con flow.'], 3: ['B&N/luz suave, estética clean.', 'Nocturna con estilo.'] },
    8: { 1: ['WOW limpio y centrado.', 'Retail futurista vibes.'], 2: ['Simetría y actitud.', 'Centro y foco.'], 3: ['Plano creativo + filtro fino.', 'Concept vibes ON.'] },
    9: { 1: ['Icono tech en cuadro.', 'Altura y flow.'], 2: ['Giro leve, drama tech.', 'Futuro clásico.'], 3: ['Ángulo potente, sin exceso.', 'Skyline tech vibes.'] },
    10:{ 1: ['Gigante retail energy.', 'Primark XXL con estilo.'], 2: ['Escaleras/luces, tú al mando.', 'Plano amplio on.'], 3: ['Gran angular + power pose.', 'Showroom vibes.'] },
    11:{ 1: ['Schweppes al fondo, chill.', 'Movie frame en Gran Vía.'], 2: ['Sin flash, deja que el neón pinte.', 'Neón en la cara, clean.'], 3: ['Nocturna dramática top.', 'Neón + actitud.'] },
    12:{ 1: ['Centro neurálgico vibes.', 'Callao con pantallas.'], 2: ['Gira el cuerpo para luz.', 'Luz frontal y foco.'], 3: ['Panorámica urbana pro.', 'Movimiento con estilo.'] },
    13:{ 1: ['Teatro al fondo, sonrisa suave.', 'Drama suave.'], 2: ['Cruza brazos/ceja arriba.', 'Look susurro.'], 3: ['Foco en ti, backstage atrás.', 'Dramatismo limpio.'] },
    14:{ 1: ['Dos marquesinas on.', 'Teatro twin vibes.'], 2: ['Señala ambos lados.', 'Duda teatral con flow.'], 3: ['Broadway vibes, panorámica.', 'Nocturna showtime.'] },
    15:{ 1: ['Quijote y Sancho contigo.', 'Héroes en la plaza.'], 2: ['Imita pose clásica.', 'Actitud clásica con flow.'], 3: ['Skybar heroico.', 'Vértigo épico.'] },
  };

  const punch = (PUNCH[stopId] && PUNCH[stopId][level] && pick(PUNCH[stopId][level])) || pick(['Gran Via vibes.', 'Madrid on fire.', 'Foto con flow.']);
  return `${punch} ${tags}`.trim();
}

export class SocialShareService {
  
  // Crear imagen con watermark de POSTURAITOR
  static async createBrandedImage(imageUri, selfieData) {
    try {
      console.log('🎨 Creando imagen con branding POSTURAITOR...');
      
      // Preservar aspect ratio original, solo redimensionar si es muy grande
      const brandedImage = await manipulateAsync(
        imageUri,
        [
          // Redimensionar solo si es muy grande, manteniendo aspect ratio
          { resize: { width: 1080 } }, // Solo especificar width, height se ajusta automáticamente
        ],
        {
          compress: 0.9,
          format: SaveFormat.JPEG,
        }
      );
      
      return brandedImage.uri;
    } catch (error) {
      console.error('Error creating branded image:', error);
      return imageUri; // Fallback a imagen original
    }
  }
  
  // Generar texto para compartir
  static generateShareText(selfieData, platform) {
    const { stopName, hashtag, analysis, achievedLevel } = selfieData;
    const levelEmoji = this.getLevelEmoji(achievedLevel);
    const score = analysis?.levelEvaluation?.percentage || analysis?.totalScore || 0;
    
    const baseText = `${levelEmoji} ¡Nivel ${achievedLevel} conseguido en ${stopName}!`;
    const scoreText = `🎯 Puntuación: ${score}${typeof score === 'number' && score <= 100 ? '%' : ' pts'}`;
    const appMention = `📱 #POSTURAITOR - Gran Vía Edition`;
    
    switch (platform) {
      case 'whatsapp':
        return `${baseText}\n${scoreText}\n\n${hashtag}\n${appMention}\n\n¡Descarga POSTURAITOR y vive la Gran Vía como nunca! 🚀`;
        
      case 'twitter':
        return `${baseText} ${scoreText}\n\n${hashtag} ${appMention}\n\n¡Vive la #GranVía como nunca! 🚀`;
        
      case 'instagram':
        return `${baseText}\n${scoreText}\n\n${hashtag}\n#POSTURAITOR #GranVía #Madrid #Selfie #IA #TurismoInteligente #TechTourism`;
        
      default:
        return `${baseText}\n${scoreText}\n\n${hashtag}\n${appMention}`;
    }
  }
  
  // Obtener emoji según el nivel
  static getLevelEmoji(level) {
    switch (level) {
      case 3: return '🏆';
      case 2: return '🥈';
      case 1: return '🥉';
      default: return '⭐';
    }
  }
  
  // Compartir en WhatsApp
  static async shareToWhatsApp(imageUri, selfieData) {
    try {
      const brandedImageUri = await this.createBrandedImage(imageUri, selfieData);
      const text = generatePunchShareText(selfieData, 'whatsapp');
      
      if (Platform.OS === 'web') {
        // En web, abrir WhatsApp Web
        const encodedText = encodeURIComponent(text);
        const whatsappUrl = `https://wa.me/?text=${encodedText}`;
        await Linking.openURL(whatsappUrl);
        return;
      }
      
      // En móvil, usar sharing nativo
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(brandedImageUri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Compartir en WhatsApp',
          UTI: 'public.jpeg'
        });
      } else {
        // Fallback: copiar texto y abrir WhatsApp
        const whatsappUrl = Platform.OS === 'ios' 
          ? `whatsapp://send?text=${encodeURIComponent(text)}`
          : `whatsapp://send?text=${encodeURIComponent(text)}`;
        
        const canOpen = await Linking.canOpenURL(whatsappUrl);
        if (canOpen) {
          await Linking.openURL(whatsappUrl);
        } else {
          Alert.alert('WhatsApp no disponible', 'Instala WhatsApp para compartir');
        }
      }
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      Alert.alert('Error', 'No se pudo compartir en WhatsApp');
    }
  }
  
  // Compartir en X (Twitter)
  static async shareToTwitter(imageUri, selfieData) {
    try {
      const text = generatePunchShareText(selfieData, 'twitter');
      const encodedText = encodeURIComponent(text);
      
      if (Platform.OS === 'web') {
        // En web, abrir Twitter
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
        await Linking.openURL(twitterUrl);
        return;
      }
      
      // En móvil, intentar app nativa primero
      const twitterAppUrl = `twitter://post?message=${encodedText}`;
      const canOpenApp = await Linking.canOpenURL(twitterAppUrl);
      
      if (canOpenApp) {
        await Linking.openURL(twitterAppUrl);
      } else {
        // Fallback a web
        const twitterWebUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
        await Linking.openURL(twitterWebUrl);
      }
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
      Alert.alert('Error', 'No se pudo compartir en X (Twitter)');
    }
  }
  
  // Compartir en Instagram
  static async shareToInstagram(imageUri, selfieData) {
    try {
      const brandedImageUri = await this.createBrandedImage(imageUri, selfieData);
      const text = generatePunchShareText(selfieData, 'instagram');
      
      if (Platform.OS === 'web') {
        // En web, mostrar instrucciones
        Alert.alert(
          'Compartir en Instagram',
          'Guarda la imagen y compártela manualmente en Instagram con este texto:\n\n' + text,
          [
            { text: 'Copiar texto', onPress: () => {
              // En una implementación real, copiarías al clipboard
              console.log('Texto copiado:', text);
            }},
            { text: 'OK' }
          ]
        );
        return;
      }
      
      // En móvil, usar sharing nativo
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(brandedImageUri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Compartir en Instagram'
        });
      } else {
        // Intentar abrir Instagram
        const instagramUrl = 'instagram://camera';
        const canOpen = await Linking.canOpenURL(instagramUrl);
        
        if (canOpen) {
          Alert.alert(
            'Compartir en Instagram',
            'Se abrirá Instagram. Usa esta descripción:\n\n' + text,
            [
              { text: 'Abrir Instagram', onPress: () => Linking.openURL(instagramUrl) },
              { text: 'Cancelar' }
            ]
          );
        } else {
          Alert.alert('Instagram no disponible', 'Instala Instagram para compartir');
        }
      }
    } catch (error) {
      console.error('Error sharing to Instagram:', error);
      Alert.alert('Error', 'No se pudo compartir en Instagram');
    }
  }
  
  // Compartir genérico (mostrar opciones del sistema)
  static async shareGeneric(imageUri, selfieData) {
    try {
      const brandedImageUri = await this.createBrandedImage(imageUri, selfieData);
      const text = generatePunchShareText(selfieData, 'generic');
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(brandedImageUri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Compartir POSTURAITOR',
          UTI: 'public.jpeg'
        });
      } else {
        Alert.alert('Compartir no disponible', 'No se puede compartir en este dispositivo');
      }
    } catch (error) {
      console.error('Error sharing generically:', error);
      Alert.alert('Error', 'No se pudo compartir');
    }
  }
  
  // Mostrar menú de opciones de compartir
  static showShareMenu(imageUri, selfieData) {
    Alert.alert(
      '📱 Compartir POSTURAITOR',
      '¿Dónde quieres compartir tu selfie?',
      [
        {
          text: '💚 WhatsApp',
          onPress: () => this.shareToWhatsApp(imageUri, selfieData)
        },
        {
          text: '🐦 X (Twitter)',
          onPress: () => this.shareToTwitter(imageUri, selfieData)
        },
        {
          text: '📷 Instagram',
          onPress: () => this.shareToInstagram(imageUri, selfieData)
        },
        {
          text: '📤 Más opciones',
          onPress: () => this.shareGeneric(imageUri, selfieData)
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    );
  }
  
  // Crear imagen con estadísticas (para compartir logros)
  static async createStatsImage(userStats) {
    try {
      // Crear una imagen con las estadísticas del usuario
      // Por ahora retornamos null, se puede implementar con Canvas o similar
      console.log('📊 Creando imagen de estadísticas:', userStats);
      return null;
    } catch (error) {
      console.error('Error creating stats image:', error);
      return null;
    }
  }
  
  // Compartir logros/estadísticas
  static async shareUserStats(userStats) {
    try {
      const statsText = this.generateStatsText(userStats);
      
      Alert.alert(
        '🏆 Compartir Logros',
        '¡Comparte tus logros en POSTURAITOR!',
        [
          {
            text: '💚 WhatsApp',
            onPress: () => {
              const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(statsText)}`;
              Linking.openURL(whatsappUrl).catch(() => {
                Alert.alert('WhatsApp no disponible');
              });
            }
          },
          {
            text: '🐦 X (Twitter)',
            onPress: () => {
              const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(statsText)}`;
              Linking.openURL(twitterUrl);
            }
          },
          {
            text: 'Cancelar',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Error sharing user stats:', error);
    }
  }
  
  // Generar texto de estadísticas
  static generateStatsText(userStats) {
    const { totalPhotos, totalPoints, completedStops, level } = userStats;
    
    return `🏆 Mis logros en POSTURAITOR:\n\n` +
           `📸 ${totalPhotos || 0} selfies épicos\n` +
           `⭐ ${totalPoints || 0} puntos conseguidos\n` +
           `📍 ${completedStops || 0} paradas completadas\n` +
           `🎯 Nivel ${level || 1} alcanzado\n\n` +
           `#POSTURAITOR #GranVía #Madrid\n` +
           `¡Únete a la aventura! 🚀`;
  }
}
