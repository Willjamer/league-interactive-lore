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
    backgroundImage: "/images/locations/piltover-workshop-offical.jpg", // best guess for academy
    availableCharacters: ["jayce", "viktor"],
  },
  "zaun-depths": {
    id: "zaun-depths",
    name: "Zaun Depths",
    description: "The underground city of Zaun, filled with toxic fumes, neon lights, and struggling citizens.",
    backgroundImage: "/images/locations/zaun-backstreet-offical.jpg",
    availableCharacters: ["vi", "ekko", "viktor"],
  },
  "zaun-factory": {
    id: "zaun-factory",
    name: "Zaun Factory",
    description: "A chemical factory in Zaun, where dangerous substances are processed with little regard for safety.",
    backgroundImage: "/images/locations/piltover-street-offical.jpg", // 
    availableCharacters: ["viktor", "jinx"],
  },
  "boundary-market": {
    id: "boundary-market",
    name: "Boundary Market",
    description: "A bustling market at the boundary between Piltover and Zaun, where citizens from both cities trade.",
    backgroundImage: "/images/locations/zaun-piltover-connection-offical.jpg", // best guess for market
    availableCharacters: ["caitlyn", "vi", "ekko"],
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
