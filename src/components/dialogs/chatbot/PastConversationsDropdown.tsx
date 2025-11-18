'use client'

// React Imports
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

import { toast } from 'react-toastify'

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
  DeleteButton,
  EditButton
} from './styles/PastConversationsDropdown.styles'

// ============= TYPES =============

export type PastConversationsDropdownProps = {
  onConversationSelect?: (conversation: Conversation, messages: any[]) => void
  currentConversationId?: string | null
  onConversationUpdate?: (conversation: Conversation) => void
  cachedConversations?: Conversation[]
  onConversationsChange?: (conversations: Conversation[]) => void
}

// ============= MAIN COMPONENT =============

const PastConversationsDropdown = ({
  onConversationSelect,
  currentConversationId,
  onConversationUpdate,
  cachedConversations = [],
  onConversationsChange
}: PastConversationsDropdownProps) => {
  const [conversations, setConversations] = useState<Conversation[]>(cachedConversations)
  const [selectedId, setSelectedId] = useState<string>('')
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

  const handleDeleteClick = useCallback(
    (conversation: Conversation, e: React.MouseEvent | React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      e.preventDefault()
      setConversationToDelete(conversation)
      setDeleteDialogOpen(true)
    },
    []
  )

  const handleEditTitleClick = useCallback(
    (conversation: Conversation, e: React.MouseEvent | React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      e.preventDefault()

      // Use setImmediate to ensure dialog opens after Select menu closes
      if (typeof setImmediate !== 'undefined') {
        setImmediate(() => {
          setConversationToEdit(conversation)
          setEditTitle(conversation.title)
          setEditDialogOpen(true)
        })
      } else {
        setConversationToEdit(conversation)
        setEditTitle(conversation.title)
        setEditDialogOpen(true)
      }
    },
    []
  )

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

        toast.success('Xóa cuộc trò chuyện thành công', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        })
      }
    } catch (err) {
      console.error('Error deleting conversation:', err)
      toast.error('Không thể xóa cuộc trò chuyện', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      })
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
        toast.success('Cập nhật tiêu đề thành công', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        })
      }
    } catch (err) {
      console.error('Error updating conversation:', err)
      toast.error('Không thể cập nhật tiêu đề', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      })
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
          maxHeight: '50vh'
        },
        ref: menuScrollRef
      },
      MenuListProps: {
        style: {
          padding: 0
        }
      },
      slotProps: {
        paper: {
          sx: {
            maxHeight: '50vh'
          }
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
    <StyledFormControl size='small' fullWidth>
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
                <ConversationTitle title={conversation.title}>{truncateText(conversation.title, 50)}</ConversationTitle>
                <ConversationDate>{formatConversationDate(conversation.created_at)}</ConversationDate>
              </ConversationContent>
              <ConversationActions className='conversation-actions'>
                <EditButton
                  size='small'
                  onMouseDown={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleEditTitleClick(conversation, e)
                  }}
                  onTouchStart={e => {
                    handleEditTitleClick(conversation, e as any)
                  }}
                  disabled={updatingId === conversation.id || deletingId === conversation.id}
                  title='Sửa tiêu đề'
                  aria-label='Sửa tiêu đề'
                >
                  {updatingId === conversation.id ? <CircularProgress size={14} /> : <Edit2 size={14} />}
                </EditButton>
                <DeleteButton
                  size='small'
                  onMouseDown={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDeleteClick(conversation, e)
                  }}
                  onTouchStart={e => {
                    handleDeleteClick(conversation, e as any)
                  }}
                  disabled={deletingId === conversation.id || updatingId === conversation.id}
                  title='Xóa cuộc trò chuyện'
                  aria-label='Xóa'
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

      {/* Edit Conversation Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditCancel}
        maxWidth='sm'
        fullWidth
        slotProps={{
          backdrop: {
            sx: { zIndex: 1300 }
          }
        }}
        sx={{ zIndex: 1300 }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: '16px' }}>Sửa tiêu đề cuộc trò chuyện</DialogTitle>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth='sm'
        fullWidth
        slotProps={{
          backdrop: {
            sx: { zIndex: 1300 }
          }
        }}
        sx={{ zIndex: 1300 }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: '16px' }}>Xác nhận xóa cuộc trò chuyện</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 1 }}>
            <Typography sx={{ mb: 1 }}>Bạn có chắc chắn muốn xóa cuộc trò chuyện này?</Typography>
            <Typography
              sx={{
                p: 1.5,
                backgroundColor: 'error.lighter',
                borderLeft: '3px solid',
                borderColor: 'error.main',
                borderRadius: '4px',
                color: 'error.main',
                fontWeight: 500,
                fontSize: '13px',
                wordBreak: 'break-word'
              }}
            >
              &quot;{conversationToDelete?.title}&quot;
            </Typography>
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
    </StyledFormControl>
  )
}

export default PastConversationsDropdown
