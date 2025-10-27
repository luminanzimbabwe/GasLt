module.exports = {
  expo: {
    // === PROJECT IDENTITY ===
    name: "ThisIsGasLTAdmin",
    slug: "ThisIsGasLTAdmin", 
    scheme: "thisisgasltadmin", 
    owner: "privateluminan", 
    
    // === VERSION AND ENVIRONMENT ===
    version: "1.0.0",
    sdkVersion: "54.0.0", 
    description: "An admin app for GasLT operations.", 
    orientation: "portrait", 
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    
    // === SPLASH SCREEN ===
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    
    // === iOS CONFIGURATION ===
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.privateluminan.thisisgasltadmin",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    
    // === ANDROID CONFIGURATION ===
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.privateluminan.thisisgasltadmin",
      edgeToEdgeEnabled: true,
      
      // Advanced Build Properties for performance
      buildProperties: {
        android: {
          enableProguardInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
          useLegacyPackaging: true  
        }
      }
    },
    
    // === WEB CONFIGURATION ===
    web: {
      favicon: "./assets/favicon.png"
    },

    // === EAS CONFIGURATION ===
    extra: {
      eas: {
        // NOTE: This MUST be the Project ID registered on the Expo server for THIS app.
        projectId: "9cbdfef3-79ff-4081-9a1a-4fe43322fe9c" 
      }
    },
    
    // === PLUGINS ===
    plugins: [
      "expo-asset",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#ffffff",
          image: "./assets/splash-icon.png"
        }
      ],
      [
        "expo-build-properties",
        {
          android: {
            kotlinVersion: "2.0.21"
          }
        }
      ],
      "expo-secure-store",
    ]
  }
};