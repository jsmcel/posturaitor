# -*- coding: utf-8 -*-
from pathlib import Path
path = Path('frontend/services/MediaPipeSelfieEvaluator.js')
text = path.read_text(encoding='utf-8')
marker = "import { LocalSelfieEvaluator } from './LocalSelfieEvaluator';\r\n\r\nlet FaceLandmarkerConstructor = null;"
if marker not in text:
    raise SystemExit('import marker not found')
replacement = "import { LocalSelfieEvaluator } from './LocalSelfieEvaluator';\r\n\r\nconst IS_DEV = typeof __DEV__ !== 'undefined' ? __DEV__ : true;\r\n\r\nlet FaceLandmarkerConstructor = null;"
text = text.replace(marker, replacement, 1)
path.write_text(text, encoding='utf-8')
