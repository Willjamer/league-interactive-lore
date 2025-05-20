const STORAGE_KEY = "lol-visual-novel-save"

// Update the saveGameProgress function to accept a messages parameter
export function saveGameProgress(gameState: GameState, messages: Message[] = []): void {
  try {
    const serializedState = JSON.stringify({
      gameState,
      messages,
      lastSaved: new Date().toISOString(),
    })
    localStorage.setItem(STORAGE_KEY, serializedState)
  } catch (error) {
    console.error("Error saving game progress:", error)
  }
}

// Update the loadGameProgress function to return both gameState and messages
export function loadGameProgress(): { gameState: GameState; messages: Message[] } | null {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY)
    if (!serializedState) return null

    const parsed = JSON.parse(serializedState)

    // Handle both new format and legacy format
    if (parsed.gameState && parsed.messages) {
      return {
        gameState: parsed.gameState,
        messages: parsed.messages,
      }
    } else {
      // Legacy format - only had gameState
      return {
        gameState: parsed,
        messages: [],
      }
    }
  } catch (error) {
    console.error("Error loading game progress:", error)
    return null
  }
}

export function hasSavedGame(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null
}

export function deleteSavedGame(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// Update saveGameInSlot to include messages
export function saveGameInSlot(gameState: GameState, messages: Message[], slotNumber: number): void {
  try {
    const slotKey = `${STORAGE_KEY}-slot-${slotNumber}`
    const serializedState = JSON.stringify({
      gameState,
      messages,
      savedAt: new Date().toISOString(),
    })
    localStorage.setItem(slotKey, serializedState)
  } catch (error) {
    console.error(`Error saving game in slot ${slotNumber}:`, error)
  }
}

// Update loadGameFromSlot to return messages
export function loadGameFromSlot(slotNumber: number): { gameState: GameState; messages: Message[] } | null {
  try {
    const slotKey = `${STORAGE_KEY}-slot-${slotNumber}`
    const serializedState = localStorage.getItem(slotKey)

    if (!serializedState) return null

    const parsed = JSON.parse(serializedState)

    // Handle both new format and legacy format
    if (parsed.gameState && parsed.messages) {
      return {
        gameState: parsed.gameState,
        messages: parsed.messages,
      }
    } else {
      // Legacy format - only had gameState
      return {
        gameState: parsed,
        messages: [],
      }
    }
  } catch (error) {
    console.error(`Error loading game from slot ${slotNumber}:`, error)
    return null
  }
}

// Get all save slots with metadata
export function getAllSaveSlots(): Array<{ slot: number; savedAt: string; scene: string }> {
  const slots = []

  for (let i = 1; i <= 5; i++) {
    const slotKey = `${STORAGE_KEY}-slot-${i}`
    const serializedState = localStorage.getItem(slotKey)

    if (serializedState) {
      try {
        const state = JSON.parse(serializedState)
        slots.push({
          slot: i,
          savedAt: state.savedAt || "Unknown date",
          scene: state.currentScene || "Unknown location",
        })
      } catch (error) {
        console.error(`Error parsing save slot ${i}:`, error)
      }
    }
  }

  return slots
}

// Update the autoSaveGame function to dispatch an event when saving is complete
export function autoSaveGame(gameState: GameState, messages: Message[]): void {
  try {
    // Use a different key for auto-save to avoid conflicts
    const AUTO_SAVE_KEY = `${STORAGE_KEY}-auto`

    // Get current scene name for display purposes
    const sceneName = gameState.currentScene || "Unknown location"

    // Get last message for context
    const lastMessage = messages.length > 0 ? messages[messages.length - 1].text : "No messages"

    const serializedState = JSON.stringify({
      gameState,
      messages,
      lastSaved: new Date().toISOString(),
      sceneName,
      lastMessage: lastMessage.substring(0, 50) + (lastMessage.length > 50 ? "..." : ""),
      messageCount: messages.length,
    })

    localStorage.setItem(AUTO_SAVE_KEY, serializedState)

    // Dispatch a custom event that auto-save has completed
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("game-autosaved"))
    }
  } catch (error) {
    console.error("Error auto-saving game:", error)
  }
}

// Add a function to load auto-saved game
interface GameState {
  currentScene?: string;
  // Add other properties relevant to your game state here
}

interface Message {
  text: string;
  // Add other properties relevant to your message structure here
}

export function loadAutoSavedGame(): { gameState: GameState; messages: Message[] } | null {
  try {
    const AUTO_SAVE_KEY = `${STORAGE_KEY}-auto`
    const serializedState = localStorage.getItem(AUTO_SAVE_KEY)

    if (!serializedState) return null

    const parsed = JSON.parse(serializedState)
    return {
      gameState: parsed.gameState,
      messages: parsed.messages,
    }
  } catch (error) {
    console.error("Error loading auto-saved game:", error)
    return null
  }
}

// Add a function to check if an auto-save exists
export function hasAutoSavedGame(): boolean {
  const AUTO_SAVE_KEY = `${STORAGE_KEY}-auto`
  return localStorage.getItem(AUTO_SAVE_KEY) !== null
}

// Add a function to get the timestamp of the last auto-save
export function getLastAutoSaveTime(): string | null {
  try {
    const AUTO_SAVE_KEY = `${STORAGE_KEY}-auto`
    const serializedState = localStorage.getItem(AUTO_SAVE_KEY)

    if (!serializedState) return null

    const parsed = JSON.parse(serializedState)
    return parsed.lastSaved || null
  } catch (error) {
    console.error("Error getting last auto-save time:", error)
    return null
  }
}
