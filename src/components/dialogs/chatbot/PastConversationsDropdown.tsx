'use client'

// React Imports
import { useState, useEffect, useRef } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Select from '@mui/material/Select'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

// Icons
import { Trash2, Edit2 } from 'lucide-react'

// Services
import { chatbotService, type Conversation } from '@/services/chatbot.service'

// Styled Components
import {
  StyledFormControl,
  StyledMenuItem,
  LoadingBox,
  LoadingText,
  EmptyStateBox,
  ConversationItemBox,
  ConversationTitle,
  ConversationDate,
  Container,
  NewConversationButton,
  DeleteButton,
  EditButton
} from './styles/PastConversationsDropdown.styles'

// ============= TYPES =============

export type PastConversationsDropdownProps = {
  onConversationSelect?: (conversation: Conversation, messages: any[]) => void
  onNewConversation?: (conversation: Conversation) => void
  onStartNewConversation?: () => void
  currentConversationId?: string | null
  onConversationUpdate?: (conversation: Conversation) => void
  cachedConversations?: Conversation[]
  onConversationsChange?: (conversations: Conversation[]) => void
}

// ============= MAIN COMPONENT =============

const PastConversationsDropdown = ({
  onConversationSelect,
  onNewConversation,
  onStartNewConversation,
  currentConversationId,
  onConversationUpdate,
  cachedConversations = [],
  onConversationsChange
}: PastConversationsDropdownProps) => {
  const [conversations, setConversations] = useState<Conversation[]>(cachedConversations)
  const [selectedId, setSelectedId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [conversationToEdit, setConversationToEdit] = useState<Conversation | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const hasFetchedRef = useRef(cachedConversations.length > 0)

  // Update conversations when cachedConversations changes
  useEffect(() => {
    if (cachedConversations.length > 0) {
      setConversations(cachedConversations)
      hasFetchedRef.current = true
    }
  }, [cachedConversations])

  // Fetch conversations only if not cached
  useEffect(() => {
    if (hasFetchedRef.current || conversations.length > 0) {
      return
    }

    const fetchConversations = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await chatbotService.getConversations()
        const fetchedConversations = response.data || []
        setConversations(fetchedConversations)
        hasFetchedRef.current = true
        if (onConversationsChange) {
          onConversationsChange(fetchedConversations)
        }
      } catch (err) {
        setError('Failed to load conversations')
        console.error('Error fetching conversations:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [conversations.length, onConversationsChange])

  // Update selectedId when currentConversationId changes
  useEffect(() => {
    if (currentConversationId) {
      setSelectedId(currentConversationId)
    }
  }, [currentConversationId])

  // Update conversation in list when updated
  useEffect(() => {
    if (onConversationUpdate) {
      // This will be called from parent when conversation is created/updated
    }
  }, [onConversationUpdate])

  const handleSelectChange = async (conversationId: string) => {
    setSelectedId(conversationId)
    const selected = conversations.find(c => c.id === conversationId)

    if (selected && onConversationSelect) {
      try {
        // Fetch messages for this conversation
        const messagesResponse = await chatbotService.getMessages(conversationId)
        onConversationSelect(selected, messagesResponse.data || [])
      } catch (err) {
        console.error('Error fetching messages:', err)
        // Still pass conversation even if messages fail to load
        onConversationSelect(selected, [])
      }
    }
  }

  const handleCreateConversation = () => {
    // Just clear the chat, don't create conversation yet
    if (onStartNewConversation) {
      onStartNewConversation()
    }
    setSelectedId('')
  }

  // Method to add/update conversation in the list (called from parent)
  const updateConversationInList = (conversation: Conversation) => {
    setConversations(prev => {
      const existingIndex = prev.findIndex(c => c.id === conversation.id)
      let updated: Conversation[]
      if (existingIndex >= 0) {
        // Update existing
        updated = [...prev]
        updated[existingIndex] = conversation
      } else {
        // Add new at the beginning
        updated = [conversation, ...prev]
      }
      if (onConversationsChange) {
        onConversationsChange(updated)
      }
      return updated
    })
    setSelectedId(conversation.id)
  }

  // Expose method to parent via useEffect
  useEffect(() => {
    if (onConversationUpdate) {
      // Store the update function reference
      ;(window as any).__updateConversationInDropdown = updateConversationInList
    }
    return () => {
      delete (window as any).__updateConversationInDropdown
    }
  }, [onConversationUpdate])

  const handleDeleteClick = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation()
    setConversationToDelete(conversation)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!conversationToDelete) return

    try {
      setDeletingId(conversationToDelete.id)
      const response = await chatbotService.deleteConversation(conversationToDelete.id)
      if (response.success) {
        setConversations(prev => {
          const updated = prev.filter(c => c.id !== conversationToDelete.id)
          if (onConversationsChange) {
            onConversationsChange(updated)
          }
          return updated
        })
        if (selectedId === conversationToDelete.id) {
          setSelectedId('')
        }
      }
    } catch (err) {
      console.error('Error deleting conversation:', err)
      setError('Failed to delete conversation')
    } finally {
      setDeletingId(null)
      setDeleteDialogOpen(false)
      setConversationToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setConversationToDelete(null)
  }

  const handleEditClick = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation()
    setConversationToEdit(conversation)
    setEditTitle(conversation.title)
    setEditDialogOpen(true)
  }

  const handleEditCancel = () => {
    setEditDialogOpen(false)
    setConversationToEdit(null)
    setEditTitle('')
  }

  const handleEditConfirm = async () => {
    if (!conversationToEdit || !editTitle.trim()) return

    try {
      setUpdatingId(conversationToEdit.id)
      const response = await chatbotService.updateConversation(conversationToEdit.id, editTitle.trim())
      if (response.success && response.data) {
        setConversations(prev => {
          const updated = prev.map(c => (c.id === conversationToEdit.id ? response.data : c))
          if (onConversationsChange) {
            onConversationsChange(updated)
          }
          return updated
        })
        setEditDialogOpen(false)
        setConversationToEdit(null)
        setEditTitle('')
      }
    } catch (err) {
      console.error('Error updating conversation:', err)
      setError('Failed to update conversation')
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const dateObj = new Date(dateString)
    const dateOnly = dateObj.toDateString()

    if (dateOnly === today.toDateString()) {
      return dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    } else if (dateOnly === yesterday.toDateString()) {
      return 'Hôm qua'
    } else {
      return dateObj.toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' })
    }
  }

  if (loading) {
    return (
      <LoadingBox>
        <CircularProgress size={18} />
        <LoadingText>Đang tải lịch sử...</LoadingText>
      </LoadingBox>
    )
  }

  if (conversations.length === 0) {
    return (
      <EmptyStateBox>
        <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>Chưa có cuộc trò chuyện nào</Typography>
      </EmptyStateBox>
    )
  }

  return (
    <Container>
      <StyledFormControl size='small' sx={{ flex: '0 0 calc(50% - 4px)' }}>
        <Select
          value={selectedId}
          onChange={e => handleSelectChange(e.target.value)}
          displayEmpty
          renderValue={value => {
            if (!value) return 'Chọn từ lịch sử...'
            const conversation = conversations.find(c => c.id === value)
            if (!conversation) return 'Chọn từ lịch sử...'
            return conversation.title.length > 25 ? conversation.title.substring(0, 22) + '...' : conversation.title
          }}
        >
          <StyledMenuItem value=''>
            <Typography sx={{ fontSize: '13px', fontStyle: 'italic', color: 'text.secondary' }}>
              Chọn một cuộc trò chuyện...
            </Typography>
          </StyledMenuItem>
          {conversations.map(conversation => (
            <StyledMenuItem key={conversation.id} value={conversation.id}>
              <ConversationItemBox>
                <ConversationTitle title={conversation.title}>
                  {conversation.title.length > 40 ? conversation.title.substring(0, 37) + '...' : conversation.title}
                </ConversationTitle>
                <ConversationDate label={formatDate(conversation.created_at)} size='small' variant='outlined' />
                <EditButton
                  size='small'
                  onClick={e => handleEditClick(conversation, e)}
                  disabled={updatingId === conversation.id || deletingId === conversation.id}
                  title='Sửa tiêu đề'
                >
                  {updatingId === conversation.id ? <CircularProgress size={14} /> : <Edit2 size={14} />}
                </EditButton>
                <DeleteButton
                  size='small'
                  onClick={e => handleDeleteClick(conversation, e)}
                  disabled={deletingId === conversation.id || updatingId === conversation.id}
                  title='Xóa cuộc trò chuyện'
                >
                  {deletingId === conversation.id ? <CircularProgress size={14} /> : <Trash2 size={14} />}
                </DeleteButton>
              </ConversationItemBox>
            </StyledMenuItem>
          ))}
        </Select>
      </StyledFormControl>
      <NewConversationButton onClick={handleCreateConversation}>Tạo cuộc trò chuyện mới</NewConversationButton>

      {/* Edit Conversation Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditCancel} maxWidth='sm' fullWidth>
        <DialogTitle>Sửa tiêu đề cuộc trò chuyện</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Tiêu đề'
            fullWidth
            variant='outlined'
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey && editTitle.trim()) {
                e.preventDefault()
                handleEditConfirm()
              }
            }}
            disabled={updatingId !== null}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel} variant='outlined' color='secondary' disabled={updatingId !== null}>
            Hủy
          </Button>
          <Button
            onClick={handleEditConfirm}
            variant='contained'
            color='primary'
            disabled={!editTitle.trim() || updatingId !== null}
          >
            {updatingId ? <CircularProgress size={20} /> : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth='sm' fullWidth>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa cuộc trò chuyện <strong>"{conversationToDelete?.title}"</strong> ? Hành động này
            không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} variant='outlined' color='secondary'>
            Hủy
          </Button>
          <Button onClick={handleDeleteConfirm} variant='contained' color='error' disabled={deletingId !== null}>
            {deletingId ? <CircularProgress size={20} /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default PastConversationsDropdown
