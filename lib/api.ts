type ChatResponse = {
  response: string
  newScene?: string
  characterChanges?: Record<string, number>
}

export async function getChatResponse(
  message: string,
  currentScene: string,
): Promise<ChatResponse> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Convert message to lowercase for easier matching
  const messageLower = message.toLowerCase()

  // Check for location change requests
  if (messageLower.includes("go to zaun") || messageLower.includes("visit zaun")) {
    return {
      response: "Let's head down to Zaun. Watch your step, the air gets thicker the deeper we go.",
      newScene: "zaun-depths",
      characterChanges: {
        vi: 1,
        caitlyn: -1,
      },
    }
  }

  if (messageLower.includes("go to piltover") || messageLower.includes("visit piltover")) {
    return {
      response: "Back to Piltover it is. The city of progress welcomes you.",
      newScene: "piltover-plaza",
      characterChanges: {
        caitlyn: 1,
        jayce: 1,
      },
    }
  }

  // Character-specific responses
  if (currentScene === "piltover-plaza") {
    if (messageLower.includes("hextech") || messageLower.includes("technology")) {
      return {
        response:
          "Hextech is the foundation of Piltover's progress. It harnesses the power of arcane crystals to power our innovations. I've dedicated my life to advancing this technology for the betterment of all.",
        characterChanges: {
          jayce: 2,
        },
      }
    }

    if (messageLower.includes("criminal") || messageLower.includes("jinx")) {
      return {
        response:
          "We've been dealing with a particularly troublesome criminal who calls herself 'Jinx'. She's caused significant damage to our city with her chaotic attacks. My partner Vi and I are determined to bring her to justice.",
        characterChanges: {
          caitlyn: 1,
          vi: 1,
        },
      }
    }

    // Default Piltover response
    return {
      response:
        "Piltover is a city of innovation and progress. Our hextech technology has transformed life for citizens across Valoran. Though we face challenges, particularly from below in Zaun, we strive to maintain order and advance society.",
    }
  }

  if (currentScene === "zaun-depths") {
    if (messageLower.includes("evolution") || messageLower.includes("augment")) {
      return {
        response:
          "The future of humanity lies in evolution. While Piltover uses hextech for convenience, I see its true potential - the glorious evolution of mankind. My augmentations have shown me what we can become when we transcend our flesh.",
        characterChanges: {
          viktor: 2,
        },
      }
    }

    if (messageLower.includes("time") || messageLower.includes("device")) {
      return {
        response:
          "My Z-Drive lets me manipulate time - pretty cool, right? Built it from scraps found here in Zaun. We might not have Piltover's resources, but we've got ingenuity. Down here, you learn to make the most with what you've got.",
        characterChanges: {
          ekko: 2,
        },
      }
    }

    // Default Zaun response
    return {
      response:
        "Welcome to Zaun, where the real innovation happens. Sure, it's not as pretty as Piltover up top, but we've got heart. The chem-barons might run things, but people like me are fighting for a better Zaun. Just watch out for the toxic air - and the toxic people.",
      characterChanges: {
        vi: 1,
      },
    }
  }

  // Fallback response
  return {
    response:
      "I'm not sure how to respond to that. Perhaps you could ask me about Piltover, Zaun, or the characters who live there?",
  }
}
