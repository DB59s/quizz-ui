'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type ScenarioType = 'question_bank' | 'explain_answer' | 'generate_question' | null

type ChatbotContextType = {
  open: boolean
  initialQuestionContent: string | undefined
  initialQuestionId: string | undefined
  initialScenario: ScenarioType
  openChatbot: (questionContent?: string, scenario?: ScenarioType, questionId?: string) => void
  closeChatbot: () => void
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined)

export const ChatbotProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false)
  const [initialQuestionContent, setInitialQuestionContent] = useState<string | undefined>(undefined)
  const [initialQuestionId, setInitialQuestionId] = useState<string | undefined>(undefined)
  const [initialScenario, setInitialScenario] = useState<ScenarioType>(null)

  const openChatbot = useCallback(
    (questionContent?: string, scenario: ScenarioType = 'question_bank', questionId?: string) => {
      setInitialQuestionContent(questionContent)
      setInitialQuestionId(questionId)
      setInitialScenario(scenario)
      setOpen(true)
    },
    []
  )

  const closeChatbot = useCallback(() => {
    setOpen(false)
    // Clear initial values after a short delay to allow dialog to close
    setTimeout(() => {
      setInitialQuestionContent(undefined)
      setInitialQuestionId(undefined)
      setInitialScenario(null)
    }, 300)
  }, [])

  return (
    <ChatbotContext.Provider
      value={{ open, initialQuestionContent, initialQuestionId, initialScenario, openChatbot, closeChatbot }}
    >
      {children}
    </ChatbotContext.Provider>
  )
}

export const useChatbotContext = () => {
  const context = useContext(ChatbotContext)
  if (context === undefined) {
    throw new Error('useChatbotContext must be used within a ChatbotProvider')
  }
  return context
}
