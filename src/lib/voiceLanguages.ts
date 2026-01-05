// Comprehensive list of languages supported by Web Speech API
export const VOICE_LANGUAGES = [
  // English variants
  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
  { code: "en-AU", name: "English (Australia)", flag: "🇦🇺" },
  { code: "en-CA", name: "English (Canada)", flag: "🇨🇦" },
  { code: "en-IN", name: "English (India)", flag: "🇮🇳" },
  { code: "en-NZ", name: "English (New Zealand)", flag: "🇳🇿" },
  { code: "en-ZA", name: "English (South Africa)", flag: "🇿🇦" },
  { code: "en-IE", name: "English (Ireland)", flag: "🇮🇪" },
  { code: "en-PH", name: "English (Philippines)", flag: "🇵🇭" },
  { code: "en-SG", name: "English (Singapore)", flag: "🇸🇬" },
  
  // Spanish variants
  { code: "es-ES", name: "Spanish (Spain)", flag: "🇪🇸" },
  { code: "es-MX", name: "Spanish (Mexico)", flag: "🇲🇽" },
  { code: "es-AR", name: "Spanish (Argentina)", flag: "🇦🇷" },
  { code: "es-CO", name: "Spanish (Colombia)", flag: "🇨🇴" },
  { code: "es-CL", name: "Spanish (Chile)", flag: "🇨🇱" },
  { code: "es-PE", name: "Spanish (Peru)", flag: "🇵🇪" },
  { code: "es-VE", name: "Spanish (Venezuela)", flag: "🇻🇪" },
  { code: "es-US", name: "Spanish (US)", flag: "🇺🇸" },
  
  // Portuguese variants
  { code: "pt-BR", name: "Portuguese (Brazil)", flag: "🇧🇷" },
  { code: "pt-PT", name: "Portuguese (Portugal)", flag: "🇵🇹" },
  
  // French variants
  { code: "fr-FR", name: "French (France)", flag: "🇫🇷" },
  { code: "fr-CA", name: "French (Canada)", flag: "🇨🇦" },
  { code: "fr-BE", name: "French (Belgium)", flag: "🇧🇪" },
  { code: "fr-CH", name: "French (Switzerland)", flag: "🇨🇭" },
  
  // German variants
  { code: "de-DE", name: "German (Germany)", flag: "🇩🇪" },
  { code: "de-AT", name: "German (Austria)", flag: "🇦🇹" },
  { code: "de-CH", name: "German (Switzerland)", flag: "🇨🇭" },
  
  // Italian
  { code: "it-IT", name: "Italian", flag: "🇮🇹" },
  { code: "it-CH", name: "Italian (Switzerland)", flag: "🇨🇭" },
  
  // Dutch
  { code: "nl-NL", name: "Dutch (Netherlands)", flag: "🇳🇱" },
  { code: "nl-BE", name: "Dutch (Belgium)", flag: "🇧🇪" },
  
  // Russian
  { code: "ru-RU", name: "Russian", flag: "🇷🇺" },
  
  // Polish
  { code: "pl-PL", name: "Polish", flag: "🇵🇱" },
  
  // Ukrainian
  { code: "uk-UA", name: "Ukrainian", flag: "🇺🇦" },
  
  // Czech
  { code: "cs-CZ", name: "Czech", flag: "🇨🇿" },
  
  // Slovak
  { code: "sk-SK", name: "Slovak", flag: "🇸🇰" },
  
  // Hungarian
  { code: "hu-HU", name: "Hungarian", flag: "🇭🇺" },
  
  // Romanian
  { code: "ro-RO", name: "Romanian", flag: "🇷🇴" },
  
  // Bulgarian
  { code: "bg-BG", name: "Bulgarian", flag: "🇧🇬" },
  
  // Greek
  { code: "el-GR", name: "Greek", flag: "🇬🇷" },
  
  // Turkish
  { code: "tr-TR", name: "Turkish", flag: "🇹🇷" },
  
  // Arabic variants
  { code: "ar-SA", name: "Arabic (Saudi Arabia)", flag: "🇸🇦" },
  { code: "ar-EG", name: "Arabic (Egypt)", flag: "🇪🇬" },
  { code: "ar-AE", name: "Arabic (UAE)", flag: "🇦🇪" },
  { code: "ar-MA", name: "Arabic (Morocco)", flag: "🇲🇦" },
  { code: "ar-DZ", name: "Arabic (Algeria)", flag: "🇩🇿" },
  { code: "ar-TN", name: "Arabic (Tunisia)", flag: "🇹🇳" },
  { code: "ar-LB", name: "Arabic (Lebanon)", flag: "🇱🇧" },
  { code: "ar-JO", name: "Arabic (Jordan)", flag: "🇯🇴" },
  { code: "ar-KW", name: "Arabic (Kuwait)", flag: "🇰🇼" },
  { code: "ar-QA", name: "Arabic (Qatar)", flag: "🇶🇦" },
  
  // Hebrew
  { code: "he-IL", name: "Hebrew", flag: "🇮🇱" },
  
  // Persian
  { code: "fa-IR", name: "Persian (Farsi)", flag: "🇮🇷" },
  
  // Hindi and Indian languages
  { code: "hi-IN", name: "Hindi", flag: "🇮🇳" },
  { code: "bn-IN", name: "Bengali (India)", flag: "🇮🇳" },
  { code: "bn-BD", name: "Bengali (Bangladesh)", flag: "🇧🇩" },
  { code: "ta-IN", name: "Tamil", flag: "🇮🇳" },
  { code: "te-IN", name: "Telugu", flag: "🇮🇳" },
  { code: "mr-IN", name: "Marathi", flag: "🇮🇳" },
  { code: "gu-IN", name: "Gujarati", flag: "🇮🇳" },
  { code: "kn-IN", name: "Kannada", flag: "🇮🇳" },
  { code: "ml-IN", name: "Malayalam", flag: "🇮🇳" },
  { code: "pa-IN", name: "Punjabi", flag: "🇮🇳" },
  { code: "ur-PK", name: "Urdu (Pakistan)", flag: "🇵🇰" },
  { code: "ur-IN", name: "Urdu (India)", flag: "🇮🇳" },
  
  // Thai
  { code: "th-TH", name: "Thai", flag: "🇹🇭" },
  
  // Vietnamese
  { code: "vi-VN", name: "Vietnamese", flag: "🇻🇳" },
  
  // Indonesian & Malay
  { code: "id-ID", name: "Indonesian", flag: "🇮🇩" },
  { code: "ms-MY", name: "Malay", flag: "🇲🇾" },
  
  // Filipino
  { code: "fil-PH", name: "Filipino", flag: "🇵🇭" },
  
  // Chinese variants
  { code: "zh-CN", name: "Chinese (Simplified)", flag: "🇨🇳" },
  { code: "zh-TW", name: "Chinese (Traditional)", flag: "🇹🇼" },
  { code: "zh-HK", name: "Chinese (Hong Kong)", flag: "🇭🇰" },
  { code: "yue-Hant-HK", name: "Cantonese", flag: "🇭🇰" },
  
  // Japanese
  { code: "ja-JP", name: "Japanese", flag: "🇯🇵" },
  
  // Korean
  { code: "ko-KR", name: "Korean", flag: "🇰🇷" },
  
  // Scandinavian languages
  { code: "sv-SE", name: "Swedish", flag: "🇸🇪" },
  { code: "da-DK", name: "Danish", flag: "🇩🇰" },
  { code: "no-NO", name: "Norwegian", flag: "🇳🇴" },
  { code: "fi-FI", name: "Finnish", flag: "🇫🇮" },
  { code: "is-IS", name: "Icelandic", flag: "🇮🇸" },
  
  // Baltic languages
  { code: "lt-LT", name: "Lithuanian", flag: "🇱🇹" },
  { code: "lv-LV", name: "Latvian", flag: "🇱🇻" },
  { code: "et-EE", name: "Estonian", flag: "🇪🇪" },
  
  // South Slavic languages
  { code: "hr-HR", name: "Croatian", flag: "🇭🇷" },
  { code: "sr-RS", name: "Serbian", flag: "🇷🇸" },
  { code: "sl-SI", name: "Slovenian", flag: "🇸🇮" },
  
  // Other European
  { code: "ca-ES", name: "Catalan", flag: "🇪🇸" },
  { code: "eu-ES", name: "Basque", flag: "🇪🇸" },
  { code: "gl-ES", name: "Galician", flag: "🇪🇸" },
  
  // African languages
  { code: "sw-KE", name: "Swahili (Kenya)", flag: "🇰🇪" },
  { code: "sw-TZ", name: "Swahili (Tanzania)", flag: "🇹🇿" },
  { code: "zu-ZA", name: "Zulu", flag: "🇿🇦" },
  { code: "af-ZA", name: "Afrikaans", flag: "🇿🇦" },
  
  // Other
  { code: "ne-NP", name: "Nepali", flag: "🇳🇵" },
  { code: "si-LK", name: "Sinhala", flag: "🇱🇰" },
  { code: "km-KH", name: "Khmer", flag: "🇰🇭" },
  { code: "lo-LA", name: "Lao", flag: "🇱🇦" },
  { code: "my-MM", name: "Myanmar (Burmese)", flag: "🇲🇲" },
  { code: "am-ET", name: "Amharic", flag: "🇪🇹" },
];

// Group languages by region for better UX
export const LANGUAGE_GROUPS = {
  "English": VOICE_LANGUAGES.filter(l => l.code.startsWith("en-")),
  "Spanish": VOICE_LANGUAGES.filter(l => l.code.startsWith("es-")),
  "French": VOICE_LANGUAGES.filter(l => l.code.startsWith("fr-")),
  "German": VOICE_LANGUAGES.filter(l => l.code.startsWith("de-")),
  "Portuguese": VOICE_LANGUAGES.filter(l => l.code.startsWith("pt-")),
  "Arabic": VOICE_LANGUAGES.filter(l => l.code.startsWith("ar-")),
  "Chinese": VOICE_LANGUAGES.filter(l => l.code.startsWith("zh-") || l.code.startsWith("yue-")),
  "Indian Languages": VOICE_LANGUAGES.filter(l => 
    ["hi-IN", "bn-IN", "ta-IN", "te-IN", "mr-IN", "gu-IN", "kn-IN", "ml-IN", "pa-IN", "ur-IN"].includes(l.code)
  ),
  "Other Asian": VOICE_LANGUAGES.filter(l => 
    ["ja-JP", "ko-KR", "th-TH", "vi-VN", "id-ID", "ms-MY", "fil-PH", "ne-NP", "si-LK", "km-KH", "lo-LA", "my-MM", "bn-BD", "ur-PK"].includes(l.code)
  ),
  "European": VOICE_LANGUAGES.filter(l => 
    ["it-IT", "it-CH", "nl-NL", "nl-BE", "ru-RU", "pl-PL", "uk-UA", "cs-CZ", "sk-SK", "hu-HU", "ro-RO", "bg-BG", "el-GR", "tr-TR", "sv-SE", "da-DK", "no-NO", "fi-FI", "is-IS", "lt-LT", "lv-LV", "et-EE", "hr-HR", "sr-RS", "sl-SI", "ca-ES", "eu-ES", "gl-ES"].includes(l.code)
  ),
  "Middle Eastern": VOICE_LANGUAGES.filter(l => 
    ["he-IL", "fa-IR"].includes(l.code)
  ),
  "African": VOICE_LANGUAGES.filter(l => 
    ["sw-KE", "sw-TZ", "zu-ZA", "af-ZA", "am-ET"].includes(l.code)
  ),
};
