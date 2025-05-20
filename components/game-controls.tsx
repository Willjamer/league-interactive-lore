"use client"

import { Button } from "@/components/ui/button"
import { Menu, Save, Upload, Settings, Volume2, VolumeX } from "lucide-react"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"

// Update the props type to include messages and a new onNewChat function
type GameControlsProps = {
  onSave: () => void
  onLoad: () => void
  onNewChat: () => void
  textSpeed?: number
  onTextSpeedChange?: (speed: number) => void
}

// Update the function signature to use these props with defaults
export default function GameControls({
  onSave,
  onLoad,
  onNewChat,
  textSpeed = 15, // Changed default from 30 to 15
  onTextSpeedChange = () => {},
}: GameControlsProps) {
  const [showSettings, setShowSettings] = useState(false)
  // Keep only the UI state for audio - no actual audio playback
  const [isAudioMuted, setIsAudioMuted] = useState(true)
  // Add volume state for the slider in settings
  const [volume, setVolume] = useState(50)

  // Add a notification when auto-save happens
  const [showAutoSaveNotification, setShowAutoSaveNotification] = useState(false)

  // Add this useEffect to listen for auto-save events:
  useEffect(() => {
    // Create a custom event listener for auto-save
    const handleAutoSave = () => {
      setShowAutoSaveNotification(true)
      setTimeout(() => setShowAutoSaveNotification(false), 2000)
    }

    window.addEventListener("game-autosaved", handleAutoSave)

    return () => {
      window.removeEventListener("game-autosaved", handleAutoSave)
    }
  }, [])

  // Toggle audio icon state only - no actual audio playback
  const toggleAudioIcon = () => {
    setIsAudioMuted(!isAudioMuted)
  }

  // Add a function to handle save with messages
  const handleSave = () => {
    // Call the onSave function which will now handle messages too
    onSave()
  }

  return (
    <div className="w-full p-4 flex justify-between items-center z-10">
      {/* Left side controls - now with only the menu button */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-black/30 border-white/30 text-white hover:bg-black/50 hover:text-white"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-black/80 text-white border-white/20">
            <DropdownMenuLabel>Game Menu</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/20" />
            <DropdownMenuItem onClick={handleSave} className="hover:bg-white/10 cursor-pointer">
              <Save className="mr-2 h-4 w-4" />
              Save Game
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLoad} className="hover:bg-white/10 cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Load Game
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onNewChat} className="hover:bg-white/10 cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Start New Chat
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/20" />
            <DropdownMenuItem onClick={() => setShowSettings(true)} className="hover:bg-white/10 cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Add audio toggle button - visual only */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleAudioIcon}
          className="bg-black/30 border-white/30 text-white hover:bg-black/50 hover:text-white"
          title={isAudioMuted ? "Audio muted" : "Audio enabled"}
        >
          {isAudioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Right side controls - text speed control removed */}
      <div className="flex items-center gap-4">{/* Empty div to maintain layout */}</div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-black/90 text-white border-white/20">
          <DialogHeader>
            <DialogTitle>Game Settings</DialogTitle>
            <DialogDescription className="text-white/70">Adjust your game settings here.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <span>Volume</span>
              <div className="flex items-center gap-2 w-48">
                <Volume2 className="h-4 w-4 text-white/70" />
                <Slider
                  value={[volume]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setVolume(value[0])}
                  className="flex-1"
                />
                <span className="text-sm text-white/70 w-8">{volume}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span>Text Speed</span>
              <div className="w-48">
                <Slider
                  value={[textSpeed]}
                  min={5}
                  max={50}
                  step={1}
                  onValueChange={(value) => onTextSpeedChange(value[0])}
                  className="flex-1"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-white/70">Fast</span>
                  <span className="text-xs text-white/70">{textSpeed}ms</span>
                  <span className="text-xs text-white/70">Slow</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showAutoSaveNotification && (
        <div className="fixed bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-md animate-fade-in-out">
          Game auto-saved
        </div>
      )}
    </div>
  )
}
