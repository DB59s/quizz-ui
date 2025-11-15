import { apiClient } from '@/libs/axios-client'

// Types
export interface Conversation {
  id: string
  account_id: string
  title: string
  created_at: string
}

export interface CreateConversationRequest {
  title: string
}

export interface CreateConversationResponse {
  success: boolean
  message: string
  data: Conversation
}

export interface GetConversationsResponse {
  success: boolean
  message: string
  data: Conversation[]
}

export interface GetConversationResponse {
  success: boolean
  message: string
  data: Conversation
}

export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  conversation_id?: string
}

export interface GetMessagesResponse {
  success: boolean
  message: string
  data: ChatMessage[]
}

const CHATBOT_API_BASE = process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'https://api.vuquangduy.io.vn'

export const chatbotService = {
  /**
   * Get all conversations for current user
   */
  getConversations: async () => {
    const response = await apiClient.get<GetConversationsResponse>(`${CHATBOT_API_BASE}/api/v1/chatbot/conversations`)
    return response.data
  },

  /**
   * Create a new conversation
   */
  createConversation: async (title: string) => {
    const response = await apiClient.post<CreateConversationResponse>(
      `${CHATBOT_API_BASE}/api/v1/chatbot/conversations`,
      {
        title
      }
    )
    return response.data
  },

  /**
   * Get conversation by ID
   */
  getConversation: async (id: string) => {
    const response = await apiClient.get<GetConversationResponse>(`${CHATBOT_API_BASE}/api/v1/chatbot/${id}`)
    return response.data
  },

  /**
   * Get all messages in a conversation
   */
  getMessages: async (conversationId: string) => {
    const response = await apiClient.get<GetMessagesResponse>(
      `${CHATBOT_API_BASE}/api/v1/chatbot/conversations/${conversationId}/messages`
    )
    return response.data
  }
}
