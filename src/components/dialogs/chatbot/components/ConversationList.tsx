'use client'

// React Imports
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { toast } from 'react-toastify'

// MUI Imports
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import IconButton from '@mui/material/IconButton'

// Icons
import { Trash2, Edit2 } from 'lucide-react'

// Services
import { chatbotService, type Conversation } from '@/services/chatbot.service'

// Utils
import { removeDuplicateConversations, formatConversationDate, truncateText, throttle } from '../utils/chatbot.utils'

// Styles
import '../styles/ConversationList.css'

// ============= TYPES =============

export type ConversationListProps = {
  onConversationSelect?: (conversation: Conversation, messages: any[]) => void
  currentConversationId?: string | null
  onConversationUpdate?: (conversation: Conversation) => void
  cachedConversations?: Conversation[]
  onConversationsChange?: (conversations: Conversation[]) => void
}

// ============= MAIN COMPONENT =============

const ConversationList = ({
  onConversationSelect,
  currentConversationId,
  onConversationUpdate,
  cachedConversations = [],
  onConversationsChange
}: ConversationListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>(cachedConversations)
  const [loading, setLoading] = useState(false)
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
  const listScrollRef = useRef<HTMLDivElement | null>(null)
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
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, offset, onConversationsChange])

  // Throttled scroll handler
  const handleListScroll = useMemo(
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

  const handleSelectConversation = useCallback(
    async (conversation: Conversation) => {
      if (onConversationSelect) {
        try {
          const messagesResponse = await chatbotService.getMessages(conversation.id)
          onConversationSelect(conversation, messagesResponse.data || [])
        } catch (err) {
          console.error('Error fetching messages:', err)
          onConversationSelect(conversation, [])
        }
      }
    },
    [onConversationSelect]
  )

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
    },
    [onConversationsChange]
  )

  // Expose method to parent via useEffect
  useEffect(() => {
    if (onConversationUpdate) {
      ;(window as any).__updateConversationInList = updateConversationInList
    }
    return () => {
      delete (window as any).__updateConversationInList
    }
  }, [onConversationUpdate, updateConversationInList])

  const handleDeleteClick = useCallback((conversation: Conversation, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setConversationToDelete(conversation)
    setDeleteDialogOpen(true)
  }, [])

  const handleEditTitleClick = useCallback((conversation: Conversation, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setConversationToEdit(conversation)
    setEditTitle(conversation.title)
    setEditDialogOpen(true)
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

        toast.success('Xóa cuộc trò chuyện thành công')
      }
    } catch (err) {
      console.error('Error deleting conversation:', err)
      toast.error('Không thể xóa cuộc trò chuyện')
    } finally {
      setDeletingId(null)
      setDeleteDialogOpen(false)
      setConversationToDelete(null)
    }
  }, [conversationToDelete, onConversationsChange])

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false)
    setConversationToDelete(null)
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
        toast.success('Cập nhật tiêu đề thành công')
      }
    } catch (err) {
      console.error('Error updating conversation:', err)
      toast.error('Không thể cập nhật tiêu đề')
    } finally {
      setUpdatingId(null)
    }
  }, [conversationToEdit, editTitle, onConversationsChange])

  if (loading) {
    return (
      <Box className='conversation-list-loading'>
        <CircularProgress size={18} />
        <Typography className='loading-text'>Đang tải lịch sử...</Typography>
      </Box>
    )
  }

  if (conversations.length === 0) {
    return (
      <Box className='conversation-list-empty'>
        <Typography>Chưa có cuộc trò chuyện nào</Typography>
      </Box>
    )
  }

  return (
    <>
      <Box
        className='conversation-list'
        ref={listScrollRef}
        onScroll={handleListScroll}
        component='div'
        sx={{ maxHeight: 400, overflowY: 'auto', padding: 0 }}
      >
        <List disablePadding>
          {displayedConversations.map(conversation => (
            <ListItem
              key={conversation.id}
              className={`conversation-item ${conversation.id === currentConversationId ? 'selected' : ''}`}
              disablePadding
              secondaryAction={
                <Box className='conversation-actions'>
                  <IconButton
                    size='small'
                    onClick={e => handleEditTitleClick(conversation, e)}
                    disabled={updatingId === conversation.id || deletingId === conversation.id}
                    title='Sửa tiêu đề'
                    className='edit-button'
                  >
                    {updatingId === conversation.id ? <CircularProgress size={14} /> : <Edit2 size={14} />}
                  </IconButton>
                  <IconButton
                    size='small'
                    onClick={e => handleDeleteClick(conversation, e)}
                    disabled={deletingId === conversation.id || updatingId === conversation.id}
                    title='Xóa'
                    className='delete-button'
                  >
                    {deletingId === conversation.id ? <CircularProgress size={14} /> : <Trash2 size={14} />}
                  </IconButton>
                </Box>
              }
            >
              <ListItemButton onClick={() => handleSelectConversation(conversation)}>
                <Box className='conversation-content'>
                  <Typography className='conversation-title' title={conversation.title}>
                    {truncateText(conversation.title, 35)}
                  </Typography>
                  <Typography className='conversation-date'>
                    {formatConversationDate(conversation.created_at)}
                  </Typography>
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
          {loadingMore && (
            <Box className='loading-more'>
              <CircularProgress size={16} />
              <Typography>Đang tải thêm...</Typography>
            </Box>
          )}
          {!hasMore && displayedConversations.length > 0 && (
            <Box className='all-loaded'>
              <Typography>Đã hiển thị tất cả</Typography>
            </Box>
          )}
        </List>
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditCancel}
        maxWidth='sm'
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(2px)'
            }
          }
        }}
        PaperProps={{
          sx: {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            backgroundColor: theme => theme.palette.background.paper
          }
        }}
        sx={{ zIndex: 1500 }}
      >
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
            sx={{ mt: 2 }}
            placeholder='Nhập tiêu đề mới cho cuộc trò chuyện'
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleEditCancel} variant='outlined' disabled={updatingId !== null}>
            Hủy
          </Button>
          <Button
            onClick={handleEditConfirm}
            variant='contained'
            color='primary'
            disabled={!editTitle.trim() || updatingId !== null}
            sx={{ minWidth: '80px' }}
          >
            {updatingId ? <CircularProgress size={16} /> : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth='sm'
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(2px)'
            }
          }
        }}
        PaperProps={{
          sx: {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            backgroundColor: theme => theme.palette.background.paper
          }
        }}
        sx={{ zIndex: 1500 }}
      >
        <DialogTitle>Xác nhận xóa cuộc trò chuyện</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 1 }}>
            <Typography sx={{ mb: 1 }}>Bạn có chắc chắn muốn xóa cuộc trò chuyện này?</Typography>
            <Typography className='delete-conversation-title'>&quot;{conversationToDelete?.title}&quot;</Typography>
            <Typography sx={{ mt: 1.5, fontSize: '13px', color: 'text.secondary' }}>
              Hành động này không thể hoàn tác.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleDeleteCancel} variant='outlined' disabled={deletingId !== null}>
            Hủy
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant='contained'
            color='error'
            disabled={deletingId !== null}
            sx={{ minWidth: '80px' }}
          >
            {deletingId ? <CircularProgress size={16} color='error' /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ConversationList
