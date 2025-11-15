'use client'

// React Imports
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

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
import type { MenuProps } from '@mui/material/Menu'

// Icons
import { Trash2, Edit2 } from 'lucide-react'

// Services
import { chatbotService, type Conversation } from '@/services/chatbot.service'

// Utils
import { removeDuplicateConversations, formatConversationDate, truncateText, throttle } from './utils/chatbot.utils'

// Styled Components
import {
  StyledFormControl,
  StyledMenuItem,
  LoadingBox,
  LoadingText,
  EmptyStateBox,
  ConversationItemBox,
  ConversationContent,
  ConversationTitle,
  ConversationDate,
  ConversationActions,
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
  const [displayedConversations, setDisplayedConversations] = useState<Conversation[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const menuScrollRef = useRef<HTMLDivElement | null>(null)
  const hasFetchedRef = useRef(cachedConversations.length > 0)
  const INITIAL_LIMIT = 10
  const LOAD_MORE_LIMIT = 10

  // Update conversations when cachedConversations changes
  useEffect(() => {
    if (cachedConversations.length > 0) {
      const uniqueConversations = removeDuplicateConversations(cachedConversations)
      setConversations(uniqueConversations)
      setDisplayedConversations(uniqueConversations.slice(0, INITIAL_LIMIT))
      setHasMore(uniqueConversations.length > INITIAL_LIMIT)
      setOffset(INITIAL_LIMIT)
      hasFetchedRef.current = true
    }
  }, [cachedConversations])

  // Fetch initial conversations only if not cached
  const fetchInitialConversations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await chatbotService.getConversations(INITIAL_LIMIT, 0)
      const fetchedConversations = response.data || []
      const uniqueConversations = removeDuplicateConversations(fetchedConversations)
      setConversations(uniqueConversations)
      setDisplayedConversations(uniqueConversations)
      setHasMore(uniqueConversations.length >= INITIAL_LIMIT)
      setOffset(INITIAL_LIMIT)
      hasFetchedRef.current = true
      if (onConversationsChange) {
        onConversationsChange(uniqueConversations)
      }
    } catch (err) {
      setError('Failed to load conversations')
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [onConversationsChange])

  useEffect(() => {
    if (hasFetchedRef.current || conversations.length > 0) {
      return
    }
    fetchInitialConversations()
  }, [conversations.length, fetchInitialConversations])

  // Load more conversations when scrolling
  const loadMoreConversations = useCallback(async () => {
    if (loadingMore || !hasMore) return

    try {
      setLoadingMore(true)
      const response = await chatbotService.getConversations(LOAD_MORE_LIMIT, offset)
      const newConversations = response.data || []

      if (newConversations.length > 0) {
        setConversations(prev => {
          const existingIds = new Set(prev.map(c => c.id))
          const uniqueNew = newConversations.filter(c => !existingIds.has(c.id))
          if (uniqueNew.length === 0) {
            setHasMore(false)
            return prev
          }
          const updated = [...prev, ...uniqueNew]
          if (onConversationsChange) {
            onConversationsChange(updated)
          }
          return updated
        })
        setDisplayedConversations(prev => {
          const existingIds = new Set(prev.map(c => c.id))
          const uniqueNew = newConversations.filter(c => !existingIds.has(c.id))
          return uniqueNew.length > 0 ? [...prev, ...uniqueNew] : prev
        })
        setOffset(prev => prev + newConversations.length)
        setHasMore(newConversations.length >= LOAD_MORE_LIMIT)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Error loading more conversations:', err)
      setError('Failed to load more conversations')
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, offset, onConversationsChange])

  // Throttled scroll handler
  const handleMenuScroll = useMemo(
    () =>
      throttle((e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget
        const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight

        if (scrollBottom < 50 && hasMore && !loadingMore) {
          loadMoreConversations()
        }
      }, 200),
    [hasMore, loadingMore, loadMoreConversations]
  )

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

  const handleSelectChange = useCallback(
    async (conversationId: string) => {
      setSelectedId(conversationId)
      const selected = conversations.find(c => c.id === conversationId)

      if (selected && onConversationSelect) {
        try {
          const messagesResponse = await chatbotService.getMessages(conversationId)
          onConversationSelect(selected, messagesResponse.data || [])
        } catch (err) {
          console.error('Error fetching messages:', err)
          onConversationSelect(selected, [])
        }
      }
    },
    [conversations, onConversationSelect]
  )

  const handleCreateConversation = useCallback(() => {
    if (onStartNewConversation) {
      onStartNewConversation()
    }
    setSelectedId('')
  }, [onStartNewConversation])

  // Method to add/update conversation in the list (called from parent)
  const updateConversationInList = useCallback(
    (conversation: Conversation) => {
      setConversations(prev => {
        const filtered = prev.filter(c => c.id !== conversation.id)
        const updated = [conversation, ...filtered]
        if (onConversationsChange) {
          onConversationsChange(updated)
        }
        return updated
      })
      setDisplayedConversations(prev => {
        const existingIndex = prev.findIndex(c => c.id === conversation.id)
        if (existingIndex >= 0) {
          const filtered = prev.filter(c => c.id !== conversation.id)
          return [conversation, ...filtered]
        } else if (prev.length < INITIAL_LIMIT) {
          return [conversation, ...prev]
        }
        return prev
      })
      setSelectedId(conversation.id)
    },
    [onConversationsChange]
  )

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

  const handleDeleteClick = useCallback((conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation()
    setConversationToDelete(conversation)
    setDeleteDialogOpen(true)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
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
        setDisplayedConversations(prev => prev.filter(c => c.id !== conversationToDelete.id))
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
  }, [conversationToDelete, onConversationsChange, selectedId])

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false)
    setConversationToDelete(null)
  }, [])

  const handleEditClick = useCallback((conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation()
    setConversationToEdit(conversation)
    setEditTitle(conversation.title)
    setEditDialogOpen(true)
  }, [])

  const handleEditCancel = useCallback(() => {
    setEditDialogOpen(false)
    setConversationToEdit(null)
    setEditTitle('')
  }, [])

  const handleEditConfirm = useCallback(async () => {
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
        setDisplayedConversations(prev => prev.map(c => (c.id === conversationToEdit.id ? response.data : c)))
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
  }, [conversationToEdit, editTitle, onConversationsChange])

  // Memoize menu props
  const menuProps: Partial<MenuProps> = useMemo(
    () => ({
      PaperProps: {
        onScroll: handleMenuScroll,
        style: {
          maxHeight: 300
        },
        ref: menuScrollRef
      },
      MenuListProps: {
        style: {
          padding: 0
        }
      }
    }),
    [handleMenuScroll]
  )

  // Memoize selected conversation for renderValue
  const selectedConversation = useMemo(
    () => displayedConversations.find(c => c.id === selectedId) || conversations.find(c => c.id === selectedId),
    [selectedId, displayedConversations, conversations]
  )

  // Memoize render value
  const renderValue = useCallback(
    (value: string) => {
      if (!value) return 'Chọn từ lịch sử...'
      if (!selectedConversation) return 'Chọn từ lịch sử...'
      return truncateText(selectedConversation.title, 25)
    },
    [selectedConversation]
  )

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
          MenuProps={menuProps}
          renderValue={renderValue}
        >
          {displayedConversations.map(conversation => (
            <StyledMenuItem key={conversation.id} value={conversation.id}>
              <ConversationItemBox>
                <ConversationContent>
                  <ConversationTitle title={conversation.title}>
                    {truncateText(conversation.title, 50)}
                  </ConversationTitle>
                  <ConversationDate>{formatConversationDate(conversation.created_at)}</ConversationDate>
                </ConversationContent>
                <ConversationActions className='conversation-actions'>
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
                </ConversationActions>
              </ConversationItemBox>
            </StyledMenuItem>
          ))}
          {loadingMore && (
            <StyledMenuItem disabled>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', py: 1 }}>
                <CircularProgress size={16} />
                <Typography sx={{ fontSize: '12px', color: 'text.secondary', ml: 1 }}>Đang tải thêm...</Typography>
              </Box>
            </StyledMenuItem>
          )}
          {!hasMore && displayedConversations.length > 0 && (
            <StyledMenuItem disabled>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', py: 0.5 }}>
                <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontStyle: 'italic' }}>
                  Đã hiển thị tất cả
                </Typography>
              </Box>
            </StyledMenuItem>
          )}
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
