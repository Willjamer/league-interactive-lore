"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getGeminiChatResponse, LLMMessage } from "@/lib/llm"
import { Loader2, Send, ArrowRight, RefreshCw, Pencil, Trash2 } from "lucide-react"
import type { Message } from "@/types/message" // Import Message type
import { getAvailableScenes } from "@/lib/scene-manager"

// Add a type for the characters object to allow string indexing
const characters: Record<string, { name: string; avatar: string; color: string; textColor: string }> = {
  caitlyn: {
    name: "Caitlyn",
    avatar: "https://ddragon.leagueoflegends.com/cdn/15.10.1/img/champion/Caitlyn.png",
    color: "bg-blue-100 border-blue-300",
    textColor: "text-blue-800",
  },
  vi: {
    name: "Vi",
    avatar: "https://ddragon.leagueoflegends.com/cdn/15.10.1/img/champion/Vi.png",
    color: "bg-pink-100 border-pink-300",
    textColor: "text-pink-800",
  },
  jinx: {
    name: "Jinx",
    avatar: "https://ddragon.leagueoflegends.com/cdn/15.10.1/img/champion/Jinx.png",
    color: "bg-purple-100 border-purple-300",
    textColor: "text-purple-800",
  },
  jayce: {
    name: "Jayce",
    avatar: "https://ddragon.leagueoflegends.com/cdn/15.10.1/img/champion/Jayce.png",
    color: "bg-amber-100 border-amber-300",
    textColor: "text-amber-800",
  },
  viktor: {
    name: "Viktor",
    avatar: "https://ddragon.leagueoflegends.com/cdn/15.10.1/img/champion/Viktor.png",
    color: "bg-gray-100 border-gray-300",
    textColor: "text-gray-800",
  },
  ekko: {
    name: "Ekko",
    avatar: "https://ddragon.leagueoflegends.com/cdn/15.10.1/img/champion/Ekko.png",
    color: "bg-green-100 border-green-300",
    textColor: "text-green-800",
  },
  player: {
    name: "You",
    avatar: "/images/player.png",
    color: "bg-slate-100 border-slate-300",
    textColor: "text-slate-800",
  },
  narrator: {
    name: "Narrator",
    avatar: "/images/globe.svg", // Use a neutral or world icon
    color: "bg-gray-900 border-gray-400",
    textColor: "text-gray-100",
  },
}

// Update the props type to include messages and setMessages
type ChatInterfaceProps = {
  gameState: any
  setGameState: (state: any) => void
  updateBackground: (scene: string) => void
  textSpeed?: number
  onMessageUpdate?: (messages: Message[]) => void
  messages?: Message[]
  setMessages?: (messages: Message[]) => void
}

// Update the function signature to use the new props with defaults
export default function ChatInterface({
  gameState,
  setGameState,
  updateBackground,
  textSpeed = 30,
  onMessageUpdate = () => {},
  messages: propMessages,
  setMessages: propSetMessages,
}: ChatInterfaceProps) {
  // Use the messages from props if provided, otherwise use local state
  const [localMessages, setLocalMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "caitlyn",
      text: "Welcome to Piltover, traveler. I'm Sheriff Caitlyn. What brings you to our city of progress?",
      timestamp: Date.now(),
    },
  ])

  // Determine which messages and setMessages to use
  const messages = propMessages || localMessages
  const setMessages = propSetMessages || setLocalMessages

  const [inputValue, setInputValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  // Add state for editing messages
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingMessageId && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingMessageId])

  // Call onMessageUpdate when messages change
  useEffect(() => {
    onMessageUpdate(messages)
  }, [messages, onMessageUpdate])

  // Add useEffect for auto-saving with debounce
  useEffect(() => {
    // Only auto-save if we have at least one message
    if (messages.length > 0) {
      // Use a timeout to avoid saving too frequently
      const saveTimeout = setTimeout(() => {
        import("@/lib/game-storage").then(({ autoSaveGame }) => {
          autoSaveGame(gameState, messages)
          console.log("Game auto-saved")
        })
      }, 2000) // Wait 2 seconds after changes before saving

      return () => clearTimeout(saveTimeout)
    }
  }, [messages, gameState])

  // Add a function to load saved messages
  const loadSavedMessages = () => {
    import("@/lib/game-storage").then(({ loadAutoSavedGame }) => {
      const savedData = loadAutoSavedGame()
      if (savedData && savedData.messages && savedData.messages.length > 0) {
        setMessages(savedData.messages)
      }
    })
  }

  // Add useEffect to load saved messages on component mount
  useEffect(() => {
    loadSavedMessages()
  }, [])

  // Always update background when currentScene changes
  const updateBackgroundRef = useRef(updateBackground);
  useEffect(() => { updateBackgroundRef.current = updateBackground }, [updateBackground]);

  useEffect(() => {
    if (gameState.currentScene) {
      // Debug: log the scene id
      console.log("Updating background for scene:", gameState.currentScene);
      updateBackgroundRef.current(gameState.currentScene);
    }
  }, [gameState.currentScene]);

  // Add functions for editing and deleting messages
  const handleEditMessage = (message: Message) => {
    setEditingMessageId(message.id)
    setEditValue(message.text)
  }

  // TODO: Replace with a secure way to provide the OpenRouter API key (e.g., env var, serverless function, or user input)
  const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "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"

  // Utility: Get available champion names
  const availableChampions = Object.keys(characters).filter((c) => c !== "player")

  // Utility: Get all available locations and their descriptions
  const availableLocations = getAvailableScenes().map((scene) => `${scene.name}: ${scene.description}`).join("\n")

  // Utility: Summarize game state for the prompt
  function summarizeGameState(state: any) {
    return `Current scene: ${state.currentScene}. Character relations: ${Object.entries(state.characterRelations)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ")}. Visited locations: ${state.visitedLocations?.join(", ") || "none"}. Inventory: ${state.inventory?.join(", ") || "empty"}.`
  }

  // Utility: Summarize the story so far, including what happened at each location
  function summarizeStory(messages: Message[], scenes: Record<string, { name: string }>) {
    const storyByLocation: Record<string, string[]> = {};
    let currentLocation: string | null = null;
    // Default to the first scene if none detected
    const sceneIds = Object.keys(scenes);
    if (sceneIds.length > 0) currentLocation = sceneIds[0];

    for (const msg of messages) {
      // Detect location changes
      for (const sceneId of sceneIds) {
        if (msg.text.toLowerCase().includes(scenes[sceneId].name.toLowerCase())) {
          currentLocation = sceneId;
          break;
        }
      }
      if (currentLocation) {
        if (!storyByLocation[currentLocation]) storyByLocation[currentLocation] = [];
        storyByLocation[currentLocation].push(`${msg.sender}: ${msg.text}`);
      }
    }
    let summary = "Story summary by location:\n";
    for (const sceneId of sceneIds) {
      if (storyByLocation[sceneId]) {
        summary += `- ${scenes[sceneId].name}:\n${storyByLocation[sceneId].map(line => `  ${line}`).join("\n")}\n`;
      }
    }
    return summary.trim();
  }

  // Helper to build a Record<string, { name: string }> for scenes
  function getSceneNameMap() {
    const map: Record<string, { name: string }> = {};
    getAvailableScenes().forEach(s => { map[s.id] = { name: s.name }; });
    return map;
  }

  // System prompt for the LLM to instruct it to act as League of Legends characters and lore expert
  const SYSTEM_PROMPT = `
You are an interactive League of Legends lore and character expert. Respond as the in-game character, using their voice, personality, and knowledge. Provide lore-accurate, immersive, and engaging responses. If the user asks about the world, events, or other champions, answer in-character and with deep lore insight. Stay in character and make the conversation feel like a real interaction in the League universe.

Game context: This is a narrative-driven interactive chat set in the League of Legends universe. The player can talk to champions, ask about lore, and make choices that affect relationships and story.

Available champions in this session: ${availableChampions.map((c) => characters[c].name).join(", ")}

Available locations:
${getAvailableScenes().map(scene => `- ${scene.name}: ${scene.description}`).join("\n")}

Rules:
- Responses meant for the user should be concise and not too long.
- Only move the story to a new location if the user clearly prompts for it (such as with *travel to X* or similar action cues).
- If the user writes text between asterisks (*like this*) or only performs an action, respond as the narrator and briefly acknowledge the action.
- If the user speaks directly to a champion, respond as that champion.
- If the user mentions a champion's name but does NOT directly address them, respond as the narrator (not the champion). The narrator may briefly describe the champion's presence or reaction, but should not have the champion speak unless directly addressed.
- If the user tries to interact with unknown or unavailable characters, respond as the narrator and gently hint toward known/available champions (for example, suggest who is nearby or who the player could talk to).
- You may describe your own actions, but keep them brief and relevant to the conversation.
- Occasionally invent or escalate events, conflicts, or surprises to keep the story engaging and dynamic for the user. This could include unexpected encounters, sudden dangers, or new opportunities. Make sure these events fit the League of Legends universe and the current scene.
- Keep a running summary of the story so far and what has happened at each location. You may write a short summary to yourself at the end of each response, but do not show it to the user.
- At the start of every reply, always explicitly state the current location using the format: **Location:** <location name>, immediately followed by the speaker using the format: **<Speaker>:** (e.g., **Location:** Piltover Plaza\n**Vi:**). This order is required for every reply.
- If the player is not in any of the known locations, use **Location:** Other.
- Keep track of what character is where, and if they move to a new location, explain how they got there when relevant to the user.
- IMPORTANT: Always use the above order and format for every reply so the UI can reliably extract both location and speaker.

${summarizeGameState(gameState)}

${summarizeStory(messages, getSceneNameMap())}
`;

  // Update the handleSaveEdit function to regenerate the AI response after editing

  const handleSaveEdit = async () => {
    if (editingMessageId && editValue.trim() !== "") {
      const messageIndex = messages.findIndex((m) => m.id === editingMessageId)
      ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) =>
        prev.map((m: Message) =>
          m.id === editingMessageId
            ? { ...m, text: editValue, timestamp: Date.now() }
            : m,
        ),
      )
      if (
        messageIndex !== -1 &&
        messages[messageIndex].sender === "player" &&
        messageIndex < messages.length - 1 &&
        messages[messageIndex + 1].sender !== "player"
      ) {
        const aiResponseToRegenerate = messages[messageIndex + 1]
        ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) =>
          prev.filter((m: Message) => m.id !== aiResponseToRegenerate.id),
        )
        setEditingMessageId(null)
        setEditValue("")
        setIsProcessing(true)
        const typingId = Date.now().toString()
        const respondingCharacter = determineRespondingCharacter(editValue, gameState, messages)
        ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) => [
          ...prev,
          {
            id: typingId,
            sender: respondingCharacter,
            text: "",
            timestamp: Date.now(),
            isTyping: true,
          },
        ])
        try {
          const llmMessages: LLMMessage[] = [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.slice(0, messageIndex + 1).slice(-5).map((m) => ({
              role: m.sender === "player" ? "user" as const : "assistant" as const,
              content: m.text,
            })),
          ]
          const response = await getGeminiChatResponse(llmMessages, OPENROUTER_API_KEY)
          ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) =>
            prev.filter((m: Message) => m.id !== typingId),
          )
          const responseMessage: Message = {
            id: (Date.now() + 2).toString(),
            sender: respondingCharacter,
            text: response,
            timestamp: Date.now(),
          }
          ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) => [...prev, responseMessage])
        } catch (error) {
          console.error("Error regenerating response after edit:", error)
          ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) =>
            prev.filter((m: Message) => m.id !== typingId),
          )
          ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) => [
            ...prev,
            {
              id: (Date.now() + 3).toString(),
              sender: "system",
              text: "There was an error generating a response to your edited message. Please try again.",
              timestamp: Date.now(),
            },
          ])
        } finally {
          setIsProcessing(false)
          setTimeout(() => {
            inputRef.current?.focus()
          }, 100)
        }
      } else {
        setEditingMessageId(null)
        setEditValue("")
      }
    } else {
      handleCancelEdit()
    }
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditValue("")
  }

  const handleDeleteMessage = (messageId: string) => {
    // Find the index of the message to delete
    const messageIndex = messages.findIndex((m) => m.id === messageId)

    // If it's the last player message, also delete the AI response that follows it
    if (
      messageIndex !== -1 &&
      messages[messageIndex].sender === "player" &&
      messageIndex < messages.length - 1 &&
      messages[messageIndex + 1].sender !== "player"
    ) {
      // Delete both the player message and the AI response
      ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) =>
        prev.filter((m: Message, i: number) => i !== messageIndex && i !== messageIndex + 1),
      )
    } else {
      // Just delete the single message
      ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) =>
        prev.filter((m: Message) => m.id !== messageId),
      )
    }
  }

  // Utility: Get character info by sender
  const getCharacter = (sender: string) => characters[sender] || characters["player"]

  // Utility: Build LLM message array from chat history
  const buildLLMMessages = (messages: Message[], systemPrompt: string): LLMMessage[] => [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.sender === "player" ? "user" as const : "assistant" as const,
      content: m.text,
    })),
  ]

  // Utility: Typing effect for AI responses
  async function typeOutResponse(
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    responseMessage: Message,
    response: string,
    textSpeed: number
  ) {
    let displayedText = ""
    for (let i = 0; i < response.length; i++) {
      displayedText += response[i]
      setMessages((prev: Message[]) =>
        prev.map((m: Message) => (m.id === responseMessage.id ? { ...m, text: displayedText } : m))
      )
      await new Promise((resolve) => setTimeout(resolve, textSpeed))
    }
  }

  // Add a function to handle the continue action
  const handleContinue = async () => {
    if (isProcessing) return

    setIsProcessing(true)

    // Determine which character should respond
    const lastCharacterMessage = [...messages]
      .reverse()
      .find((m) => m.sender !== "player" && m.sender !== "system" && !m.isTyping)

    const respondingCharacter = lastCharacterMessage?.sender || determineRespondingCharacter("", gameState, messages)

    // Add typing indicator
    const typingId = Date.now().toString()
    ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) => [
      ...prev,
      {
        id: typingId,
        sender: "", // blank sender for loading
        text: "",
        timestamp: Date.now(),
        isTyping: true,
      },
    ])

    try {
      // Create a continue prompt based on the conversation context
      const continuePrompt = "Tell me more."

      // Call the API to get a response
      const llmMessages = buildLLMMessages(messages, SYSTEM_PROMPT)
      const response = await getGeminiChatResponse(llmMessages, OPENROUTER_API_KEY)

      // Remove typing indicator
      ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) => prev.filter((m: Message) => m.id !== typingId))

      // Add the response message with typing effect
      const responseMessage: Message = {
        id: (Date.now() + 2).toString(),
        sender: respondingCharacter,
        text: response,
        timestamp: Date.now(),
      }

      ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) => [...prev, responseMessage])

      // Simulate typing effect
      await typeOutResponse(setMessages as React.Dispatch<React.SetStateAction<Message[]>>, responseMessage, response, textSpeed)
    } catch (error) {
      console.error("Error getting response:", error)
      // Remove typing indicator
      ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) => prev.filter((m: Message) => m.id !== typingId))

      // Add error message
      ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) => [
        ...prev,
        {
          id: (Date.now() + 3).toString(),
          sender: "system",
          text: "There was an error processing your request. Please try again.",
          timestamp: Date.now(),
        },
      ])
    } finally {
      setIsProcessing(false)

      // Refocus the input box after processing is complete
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  // Add a function to handle the regenerate action
  const handleRegenerateResponse = async () => {
    if (isProcessing || isRegenerating) return

    setIsRegenerating(true)

    // Find the last player message and the last AI response
    const messagesReversed = [...messages].reverse()
    const lastAIMessage = messagesReversed.find((m) => m.sender !== "player" && m.sender !== "system" && !m.isTyping)
    const lastPlayerMessage = messagesReversed.find((m) => m.sender === "player")

    if (!lastAIMessage || !lastPlayerMessage) {
      setIsRegenerating(false)
      return
    }

    // Remove the last AI message
    ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) => prev.filter((m: Message) => m.id !== lastAIMessage.id))

    // Add typing indicator
    const typingId = Date.now().toString()
    ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) => [
      ...prev,
      {
        id: typingId,
        sender: "", // blank sender for loading
        text: "",
        timestamp: Date.now(),
        isTyping: true,
      },
    ])

    try {
      // Call the API to get a new response for the same player message
      const llmMessages = buildLLMMessages(messages, SYSTEM_PROMPT)
      const response = await getGeminiChatResponse(llmMessages, OPENROUTER_API_KEY)

      // Remove typing indicator
      ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) => prev.filter((m: Message) => m.id !== typingId))

      // Add the new response message with typing effect
      const responseMessage: Message = {
        id: (Date.now() + 2).toString(),
        sender: lastAIMessage.sender,
        text: response,
        timestamp: Date.now(),
      }

      ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) => [...prev, responseMessage])

      // Simulate typing effect
      await typeOutResponse(setMessages as React.Dispatch<React.SetStateAction<Message[]>>, responseMessage, response, textSpeed)
    } catch (error) {
      console.error("Error regenerating response:", error)
      // Remove typing indicator
      ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) => prev.filter((m: Message) => m.id !== typingId))

      // Add error message
      ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) => [
        ...prev,
        {
          id: (Date.now() + 3).toString(),
          sender: "system",
          text: "There was an error regenerating the response. Please try again.",
          timestamp: Date.now(),
        },
      ])
    } finally {
      setIsRegenerating(false)

      // Refocus the input box after processing is complete
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  // Utility: Detect if the user is moving to a new location and return the scene id if so
  function detectLocationChange(message: string): string | null {
    const scenes = getAvailableScenes();
    for (const scene of scenes) {
      // Accepts commands like "travel to X", "go to X", "move to X", "enter X", etc.
      const pattern = new RegExp(`(travel|go|move|walk|head|enter|arrive|visit|explore|leave|exit)[^\w]{0,5}${scene.name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}([^\w]|$)`, "i");
      if (pattern.test(message)) {
        return scene.id;
      }
    }
    return null;
  }

  // Utility: Escape regex special characters in a string
  function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Utility: Extract scene id from AI response if it contains a location change
  function extractSceneIdFromText(text: string): string | null {
    const scenes = getAvailableScenes();
    for (const scene of scenes) {
      // Match '**Location:** Piltover Academy' or similar, safely escaping scene name
      const pattern = new RegExp(`\\*\\*Location:\\*\\*\\s*${escapeRegExp(scene.name)}`, "i");
      if (pattern.test(text)) {
        return scene.id;
      }
    }
    return null;
  }

  // Utility: Parse the speaker from the start of the AI's response (e.g., **Vi:**, **Jinx:**, **Narrator:**)
  function parseSpeakerFromResponse(response: string): string {
    const match = response.match(/^\*\*(.+?):\*\*/);
    if (match) {
      const speakerName = match[1].trim().toLowerCase();
      // Try to match to a known character key
      for (const key of Object.keys(characters)) {
        if (characters[key].name.toLowerCase() === speakerName) {
          return key;
        }
      }
      if (speakerName === "narrator") return "narrator";
    }
    // Fallback: narrator
    return "narrator";
  }

  // Utility: Parse the location and speaker from the start of the AI's response (robust to stray lines)
  function parseLocationAndSpeakerFromResponse(response: string): { location: string | null, speaker: string } {
    // Split into lines and look for the first line that starts with **Location:**
    const lines = response.split(/\r?\n/);
    let locLineIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('**Location:**')) {
        locLineIdx = i;
        break;
      }
    }
    if (locLineIdx !== -1 && lines.length > locLineIdx + 1) {
      // Parse location
      const locMatch = lines[locLineIdx].match(/^\*\*Location:\*\*\s*([^\n*]+)/);
      const speakerMatch = lines[locLineIdx + 1].match(/^\*\*(.+?):\*\*/);
      if (locMatch && speakerMatch) {
        const locationName = locMatch[1].trim();
        const speakerName = speakerMatch[1].trim().toLowerCase();
        // Try to match to a known character key
        let speakerKey = "narrator";
        for (const key of Object.keys(characters)) {
          if (characters[key].name.toLowerCase() === speakerName) {
            speakerKey = key;
            break;
          }
        }
        if (speakerName === "narrator") speakerKey = "narrator";
        return { location: locationName, speaker: speakerKey };
      }
    }
    // Fallback: try to match just the speaker anywhere in the text
    const speakerMatch = response.match(/^\*\*(.+?):\*\*/m);
    if (speakerMatch) {
      const speakerName = speakerMatch[1].trim().toLowerCase();
      let speakerKey = "narrator";
      for (const key of Object.keys(characters)) {
        if (characters[key].name.toLowerCase() === speakerName) {
          speakerKey = key;
          break;
        }
      }
      if (speakerName === "narrator") speakerKey = "narrator";
      return { location: null, speaker: speakerKey };
    }
    return { location: null, speaker: "narrator" };
  }

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || isProcessing) return
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "player",
      text: inputValue,
      timestamp: Date.now(),
    }
    // Detect location change and update background if needed
    const newLocation = detectLocationChange(inputValue);
    if (newLocation && newLocation !== gameState.currentScene) {
      updateBackground(newLocation);
      setGameState({ ...gameState, currentScene: newLocation });
    }
    ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) => [...prev, userMessage])
    setInputValue("")
    setIsProcessing(true)
    const typingId = (Date.now() + 1).toString()
    // Set sender to blank for loading/typing message
    ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) => [
      ...prev,
      {
        id: typingId,
        sender: "", // blank sender for loading
        text: "",
        timestamp: Date.now(),
        isTyping: true,
      },
    ])
    try {
      const llmMessages = buildLLMMessages([...messages, userMessage], SYSTEM_PROMPT)
      const response = await getGeminiChatResponse(llmMessages, OPENROUTER_API_KEY)
      console.log("LLM response:", response)
      ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) => prev.filter((m: Message) => m.id !== typingId))
      // Parse the location and speaker from the response
      const { location: parsedLocation, speaker: parsedSender } = parseLocationAndSpeakerFromResponse(response);
      // Optionally update location if parsedLocation matches a known scene
      if (parsedLocation) {
        const scenes = getAvailableScenes();
        const matchedScene = scenes.find(scene => scene.name.toLowerCase() === parsedLocation.toLowerCase());
        if (matchedScene && matchedScene.id !== gameState.currentScene) {
          setGameState({ ...gameState, currentScene: matchedScene.id });
        }
      }
      const responseMessage: Message = {
        id: (Date.now() + 2).toString(),
        sender: parsedSender,
        text: response,
        timestamp: Date.now(),
      }
      ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) => [...prev, responseMessage])
      await typeOutResponse(setMessages as React.Dispatch<React.SetStateAction<Message[]>>, responseMessage, response, textSpeed)
    } catch (error) {
      console.error("Error processing message:", error)
      ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) => prev.filter((m: Message) => m.id !== typingId))
      ;(setMessages as React.Dispatch<React.SetStateAction<Message[]>>)((prev: Message[]) => [
        ...prev,
        {
          id: (Date.now() + 3).toString(),
          sender: "system",
          text: `There was an error processing your message. Please try again.\n${error}`,
          timestamp: Date.now(),
        },
      ])
    } finally {
      setIsProcessing(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const getLastNonPlayerCharacter = (messages: Message[]): string | null => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.sender !== "player" && m.sender !== "system" && m.sender !== "narrator") {
        return m.sender;
      }
    }
    return null;
  };

  const determineRespondingCharacter = (message: string, state: any, messages: Message[]): string => {
    // If the user is performing an action or just walking around, use narrator
    if (/\*\*.*\*\*/.test(message) || /walk|look|explore|move|travel|go to|leave|arrive|enter|exit|observe|search|inspect|wander|around|scene|location|background/i.test(message)) {
      // If the message is not directed at a champion, use narrator
      if (!availableChampions.some(c => message.toLowerCase().includes(characters[c].name.toLowerCase()))) {
        return "narrator";
      }
    }
    // If the user mentions a champion by name, respond as that champion
    for (const champ of availableChampions) {
      if (message.toLowerCase().includes(characters[champ].name.toLowerCase())) {
        return champ;
      }
    }
    // If the scene has a default character, use them
    const currentScene = state.currentScene;
    const scene = getAvailableScenes().find(s => s.id === currentScene);
    if (scene && scene.availableCharacters && scene.availableCharacters.length > 0) {
      // If the last non-player character is in this scene, keep the conversation with them
      const lastChar = getLastNonPlayerCharacter(messages);
      if (lastChar && scene.availableCharacters.includes(lastChar)) {
        return lastChar;
      }
      // Otherwise, default to the first available character in the scene
      return scene.availableCharacters[0];
    }
    // Fallback to narrator if no one is available
    return "narrator";
  };

  return (
    <div className="w-full max-w-4xl flex flex-col">
      {/* Main chat area - now with reduced max height */}
      <div className="bg-black/60 backdrop-blur-md rounded-lg p-4 w-full">
        <ScrollArea className="max-h-[40vh] pr-4 overflow-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="mb-4">
                {message.sender === "player" ? (
                  <div className="flex flex-row-reverse items-start gap-3">
                    <Avatar className="h-12 w-12 border-2 border-white/50">
                      <AvatarImage
                        src={getCharacter(message.sender)?.avatar || "/placeholder.svg"}
                        alt={getCharacter(message.sender)?.name}
                      />
                      <AvatarFallback>{getCharacter(message.sender)?.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center">
                        <span className="text-base font-semibold text-white/90">
                          {getCharacter(message.sender)?.name}
                        </span>
                      </div>

                      {editingMessageId === message.id ? (
                        // Editing mode
                        <div className="mt-1 flex flex-col items-end w-full">
                          <Input
                            ref={editInputRef}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSaveEdit()
                              } else if (e.key === "Escape") {
                                handleCancelEdit()
                              }
                            }}
                            className="bg-indigo-700 text-white border-indigo-500 min-w-[300px]"
                          />
                          <div className="flex gap-2 mt-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="h-6 px-2 text-xs text-white/70 hover:text-white hover:bg-white/10"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              className="h-6 px-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Display mode
                        <div className="mt-1 rounded-lg p-3 text-base max-w-[600px] bg-indigo-600 text-white relative group">
                          {message.text}

                          {/* Edit and Delete buttons for player messages */}
                          <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditMessage(message)}
                              className="h-7 w-7 rounded-full bg-black/30 text-white hover:bg-black/50"
                              title="Edit message"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMessage(message.id)}
                              className="h-7 w-7 rounded-full bg-black/30 text-white hover:bg-black/50"
                              title="Delete message"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 border-2 border-white/50">
                      {message.sender === "" ? (
                        // Blank avatar for loading
                        <div className="h-12 w-12 bg-transparent" />
                      ) : (
                        <>
                          <AvatarImage
                            src={getCharacter(message.sender)?.avatar || "/placeholder.svg"}
                            alt={getCharacter(message.sender)?.name}
                          />
                          <AvatarFallback>{getCharacter(message.sender)?.name[0]}</AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        {message.sender !== "" && (
                          <span className="text-base font-semibold text-white/90">
                            {getCharacter(message.sender)?.name}
                          </span>
                        )}
                      </div>
                      <div
                        className={cn(
                          "relative mt-1 rounded-lg p-3 text-base max-w-[600px]",
                          message.isTyping ? "min-w-[60px]" : "",
                          message.sender !== "" ? `${getCharacter(message.sender)?.color} ${getCharacter(message.sender)?.textColor}` : "bg-transparent text-transparent"
                        )}
                      >
                        {message.isTyping ? (
                          <div className="flex space-x-1">
                            <div
                              className="w-2 h-2 bg-current rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-current rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-current rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></div>
                          </div>
                        ) : (
                          message.text
                        )}
                      </div>

                      {/* Add both buttons on the left side of the response */}
                      {!message.isTyping &&
                        message.sender !== "player" &&
                        message.sender !== "system" &&
                        message.id === messages[messages.length - 1].id && (
                          <div className="flex justify-start mt-1 gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleRegenerateResponse}
                              disabled={isProcessing || isRegenerating}
                              className="h-6 px-2 text-xs text-white/70 hover:text-white hover:bg-white/10"
                            >
                              {isRegenerating ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <RefreshCw className="h-3 w-3 mr-1" />
                              )}
                              Regenerate
                            </Button>
                            <Button
                              onClick={handleContinue}
                              disabled={isProcessing}
                              className="h-6 px-2 bg-emerald-600/90 hover:bg-emerald-700 text-white text-xs rounded-full"
                              title="Continue conversation"
                              size="sm"
                            >
                              {isProcessing ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <ArrowRight className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input area */}
        <div className="flex gap-2 mt-6">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage()
              }
            }}
            placeholder="Type your message..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            disabled={isProcessing}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isProcessing || inputValue.trim() === ""}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            aria-label="Send message"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
