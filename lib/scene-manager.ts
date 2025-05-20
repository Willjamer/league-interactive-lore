type Scene = {
  id: string
  name: string
  description: string
  backgroundImage: string
  availableCharacters: string[]
}

const scenes: Record<string, Scene> = {
  "piltover-plaza": {
    id: "piltover-plaza",
    name: "Piltover Plaza",
    description: "The central plaza of Piltover, showcasing elegant architecture and hextech innovations.",
    backgroundImage: "/images/locations/piltover-plaza-offcial.jpg",
    availableCharacters: ["caitlyn", "jayce"],
  },
  "piltover-academy": {
    id: "piltover-academy",
    name: "Piltover Academy",
    description: "The prestigious academy where brilliant minds study and develop new hextech technologies.",
    backgroundImage: "/images/locations/piltover-academy.png", 
    availableCharacters: ["jayce", "viktor"],
  },
  "piltover-workshop": {
    id: "piltover-workshop",
    name: "Piltover Wosrkshop",
    description: "A typical workshop in Piltover, filled with intricate hextech machinery, glowing instruments, and inventors focused on advanced technological experiments.",
    backgroundImage: "/images/locations/piltover-workshop-offical.jpg", 
    availableCharacters: ["jayce", "viktor"],
  },
  "piltover-street": {
    id: "piltover-street",
    name: "Piltover Street",
    description: "A normal street in Piltover, bustling with activity, showcases elegant architecture, advanced hextech machinery.",
    backgroundImage: "/images/locations/piltover-street-offical.jpg", 
    availableCharacters: ["jayce", "viktor"],
  },
  "piltover-private-vault": {
    id: "hextech-vault",
    name: "Hextech Vault",
    description: "A private secure hextech vault in Piltover, sealed by intricate mechanisms and powered by glowing blue crystals, guarding valuable or dangerous technology.",
    backgroundImage: "/images/locations/piltover-street-offical.jpg", 
    availableCharacters: ["jayce", "viktor"],
  },
  "zaun-street": {
    id: "zaun-street",
    name: "Zaun Street",
    description: "The underground city of Zaun, filled with toxic fumes, neon lights, and struggling citizens.",
    backgroundImage: "/images/locations/zaun-backstreet-offical.jpg",
    availableCharacters: ["vi", "ekko", "viktor"],
  },
  "zaun-factory": {
    id: "zaun-factory",
    name: "Zaun Factory",
    description: "A chemical factory in Zaun, where dangerous substances are processed with little regard for safety.",
    backgroundImage: "/images/locations/zaun-factory.png",  
    availableCharacters: ["viktor", "jinx"],
  },
  "zaun-simmer-den": {
    id: "simmer-den",
    name: "Simmer Den",
    description: "A hidden Shimmer den in Zaun, filled with makeshift lab equipment and glowing purple vials, where the dangerous substance is brewed and consumed in secrecy.",
    backgroundImage: "/images/locations/shimmer den.png",  
    availableCharacters: ["viktor", "jinx"],
  },
  "boundary-market": {
    id: "boundary-market",
    name: "Boundary Market",
    description: "A bustling market at the boundary between Piltover and Zaun, where citizens from both cities trade.",
    backgroundImage: "/images/locations/zaun-piltover-connection-offical.jpg", // best guess for market
    availableCharacters: ["caitlyn", "vi", "ekko"],
  },
  "zaun-tavern": {
  id: "zaun-tavern",
  name: "The Sump Swill",
  description: "A shady tavern deep in Zaun where chem-punks, enforcers off-duty, and underworld figures gather over drinks and whispered deals.",
  backgroundImage: "/images/locations/zaun-tavern.png", // image path
  availableCharacters: ["vi", "ekko", "silco"],
  },
}

// In a real application, this would use an LLM to determine the appropriate background
export async function getBackgroundForScene(sceneId: string): Promise<string> {
  // If the scene exists in our predefined scenes, return its background
  if (scenes[sceneId]) {
    return scenes[sceneId].backgroundImage
  }

  // For unknown scenes, return a default background
  // In a real app with an LLM, this would generate a new scene based on context
  return "/images/piltover-plaza.png"
}

export function getAvailableScenes(): Scene[] {
  return Object.values(scenes)
}

export function getSceneById(sceneId: string): Scene | undefined {
  return scenes[sceneId]
}
