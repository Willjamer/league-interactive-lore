"use client"

import { useState, useEffect } from "react"
import ChatInterface from "@/components/chat-interface"
import GameControls from "@/components/game-controls"
import { getBackgroundForScene } from "@/lib/scene-manager"
import { saveGameProgress, loadGameProgress } from "@/lib/game-storage"
import type { Message } from "@/types/message"

export default function Home() {
  // Add a loading state and indicator
  // Add this state near the top of the component:
  const [isLoading, setIsLoading] = useState(true)
  const [currentBackground, setCurrentBackground] = useState("/images/piltover-plaza.png")
  const [gameState, setGameState] = useState({
    currentScene: "piltover-plaza",
    characterRelations: {
      caitlyn: 0,
      vi: 0,
      jinx: 0,
      jayce: 0,
      viktor: 0,
      ekko: 0,
    },
    visitedLocations: ["piltover-plaza"],
    inventory: [],
  })
  const [textSpeed, setTextSpeed] = useState(15) // Changed default from 30 to 15

  // Add state for the current character being displayed
  const [currentCharacter, setCurrentCharacter] = useState("caitlyn")

  // Add state for messages at the top level
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "caitlyn",
      text: "Welcome to Piltover, traveler. I'm Sheriff Caitlyn. What brings you to our city of progress?",
      timestamp: Date.now(),
    },
  ])

  // Load saved game on initial render
  useEffect(() => {
    // Update the loadSavedData function in the useEffect to set loading state:
    const loadSavedData = async () => {
      setIsLoading(true)
      try {
        // First try to load auto-saved game which is the most recent
        const { loadAutoSavedGame, loadGameProgress } = await import("@/lib/game-storage")

        // Try auto-save first (most recent)
        const autoSavedGame = loadAutoSavedGame()

        if (autoSavedGame && autoSavedGame.messages && autoSavedGame.messages.length > 0) {
          console.log("Loading auto-saved game...")
          setGameState(autoSavedGame.gameState)
          setMessages(autoSavedGame.messages)
          updateBackground(autoSavedGame.gameState.currentScene)

          // Update current character based on the last message
          const lastCharacterMessage = [...autoSavedGame.messages]
            .reverse()
            .find((m) => m.sender !== "player" && m.sender !== "system")

          if (lastCharacterMessage) {
            setCurrentCharacter(lastCharacterMessage.sender)
          }

          setIsLoading(false)
          return // Exit if we loaded auto-save
        }

        // If no auto-save, try regular save
        const savedGame = loadGameProgress()
        if (savedGame) {
          console.log("Loading saved game...")
          setGameState(savedGame.gameState)
          if (savedGame.messages && savedGame.messages.length > 0) {
            setMessages(savedGame.messages)

            // Update current character based on the last message
            const lastCharacterMessage = [...savedGame.messages]
              .reverse()
              .find((m) => m.sender !== "player" && m.sender !== "system")

            if (lastCharacterMessage) {
              setCurrentCharacter(lastCharacterMessage.sender)
            }
          }
          updateBackground(savedGame.gameState.currentScene)
        }
      } catch (error) {
        console.error("Error loading saved game:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSavedData()
  }, [])

  const updateBackground = async (scene: string) => {
    // In a real app, this would call the LLM to determine the appropriate background
    const background = await getBackgroundForScene(scene)
    setCurrentBackground(background)
  }

  // Update the load game function to handle messages
  const handleLoadGame = () => {
    const savedGame = loadGameProgress()
    if (savedGame) {
      setGameState(savedGame.gameState)
      if (savedGame.messages && savedGame.messages.length > 0) {
        setMessages(savedGame.messages)
      }
      updateBackground(savedGame.gameState.currentScene)
      // Show load confirmation
      alert("Game progress loaded!")
    } else {
      alert("No saved game found!")
    }
  }

  // Add a function to handle starting a new chat
  const handleNewChat = () => {
    // Confirm with the user before starting a new chat
    if (window.confirm("Are you sure you want to start a new chat? All unsaved progress will be lost.")) {
      // Reset game state to initial values
      const initialGameState = {
        currentScene: "piltover-plaza",
        characterRelations: {
          caitlyn: 0,
          vi: 0,
          jinx: 0,
          jayce: 0,
          viktor: 0,
          ekko: 0,
        },
        visitedLocations: ["piltover-plaza"],
        inventory: [],
      }

      // Reset messages to initial welcome message
      const initialMessages = [
        {
          id: "1",
          sender: "caitlyn",
          text: "Welcome to Piltover, traveler. I'm Sheriff Caitlyn. What brings you to our city of progress?",
          timestamp: Date.now(),
        },
      ]

      // Update state
      setGameState(initialGameState)
      setMessages(initialMessages)
      setCurrentCharacter("caitlyn")
      updateBackground("piltover-plaza")
    }
  }

  // Update handleSaveGame to save messages too
  const handleSaveGame = () => {
    // Get the current messages from the ChatInterface component
    // We'll need to pass a ref to access this
    saveGameProgress(gameState, messages)
    // Show save confirmation
    alert("Game progress saved!")
  }

  // Function to update the current character based on the latest message
  const updateCurrentCharacter = (messages: Message[]) => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      // If the last message is from a character (not the player), update the current character
      if (lastMessage.sender !== "player" && lastMessage.sender !== "system") {
        setCurrentCharacter(lastMessage.sender)
      }
    }
  }

  return (
    <main className="h-screen w-full flex flex-col relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/70">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-indigo-500 border-r-transparent border-b-indigo-500 border-l-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-white text-lg">Loading saved game...</p>
          </div>
        </div>
      )}
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{ backgroundImage: `url(${currentBackground})` }}
      />

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Character Portrait */}
      <div className="absolute inset-0 flex items-center justify-end pointer-events-none">
        <img
          src={`/images/${currentCharacter}.png`}
          alt={currentCharacter}
          className="h-full max-h-[100vh] object-contain object-bottom"
          style={{ marginTop: "0vh" }} // Push the character down a bit
        />
      </div>

      {/* Game Controls */}
      <GameControls
        onSave={() => saveGameProgress(gameState, messages)}
        onLoad={handleLoadGame}
        onNewChat={handleNewChat}
        textSpeed={textSpeed}
        onTextSpeedChange={setTextSpeed}
        messages={messages}
        currentScene={gameState.currentScene}
      />

      {/* Chat Interface */}
      <div className="flex-1 flex items-end justify-center p-4 z-10">
        <ChatInterface
          gameState={gameState}
          setGameState={setGameState}
          updateBackground={updateBackground}
          textSpeed={textSpeed}
          onMessageUpdate={updateCurrentCharacter}
          messages={messages}
          setMessages={setMessages}
        />
      </div>
    </main>
  )
}
