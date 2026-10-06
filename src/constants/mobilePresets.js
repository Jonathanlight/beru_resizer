export const MOBILE_PRESETS = {
  ios: [
    { id: 'ios-icon', name: 'App Icon', width: 1024, height: 1024, category: 'icon' },
    { id: 'ios-ip67-portrait', name: 'iPhone 6.7" Portrait', width: 1290, height: 2796, category: 'phone' },
    { id: 'ios-ip67-landscape', name: 'iPhone 6.7" Landscape', width: 2796, height: 1290, category: 'phone' },
    { id: 'ios-ip65', name: 'iPhone 6.5"', width: 1284, height: 2778, category: 'phone' },
    { id: 'ios-ip61', name: 'iPhone 6.1"', width: 1179, height: 2556, category: 'phone' },
    { id: 'ios-iphone-duo', name: 'iPhone Duo', width: 1398, height: 2034, category: 'phone' },
    { id: 'ios-ipad129-portrait', name: 'iPad 12.9" Portrait', width: 2048, height: 2732, category: 'tablet' },
    { id: 'ios-ipad129-landscape', name: 'iPad 12.9" Landscape', width: 2732, height: 2048, category: 'tablet' },
    // App Store header & search banners
    { id: 'ios-header-search', name: 'En-tête & recherche', width: 5244, height: 2950, category: 'banner' },
    { id: 'ios-header-search-wide', name: 'En-tête & recherche (large)', width: 3840, height: 1646, category: 'banner' },
  ],
  android: [
    // Google Play store listing graphics
    { id: 'and-icon', name: 'App Icon', width: 512, height: 512, category: 'icon' },
    { id: 'and-feature', name: 'Image de présentation', width: 1024, height: 500, category: 'banner' },
    // Phone screenshots
    { id: 'and-phone', name: 'Phone Portrait', width: 1080, height: 1920, category: 'phone' },
    { id: 'and-phone-landscape', name: 'Phone Landscape', width: 1920, height: 1080, category: 'phone' },
    // Tablet screenshots
    { id: 'and-tablet7', name: 'Tablet 7" Portrait', width: 1200, height: 1920, category: 'tablet' },
    { id: 'and-tablet7-landscape', name: 'Tablet 7" Landscape', width: 1920, height: 1200, category: 'tablet' },
    { id: 'and-tablet10', name: 'Tablet 10" Portrait', width: 1600, height: 2560, category: 'tablet' },
    { id: 'and-tablet10-landscape', name: 'Tablet 10" Landscape', width: 2560, height: 1600, category: 'tablet' },
    // Android TV & Wear OS
    { id: 'and-tv-banner', name: 'TV Banner', width: 1280, height: 720, category: 'banner' },
    { id: 'and-tv-screenshot', name: 'TV Screenshot', width: 1920, height: 1080, category: 'tv' },
    { id: 'and-wear', name: 'Wear OS', width: 384, height: 384, category: 'wear' },
  ],
}
