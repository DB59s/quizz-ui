'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import { styled, useTheme } from '@mui/material/styles'
import { X } from 'lucide-react'

// ============= STYLED COMPONENTS =============

const TagContainer = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 8px',
  borderRadius: '6px',
  backgroundColor: theme.palette.primary.main + '20',
  border: `1.5px solid ${theme.palette.primary.main}40`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.main + '25',
    borderColor: theme.palette.primary.main + '60'
  }
}))

const TagText = styled(Box)(({ theme }) => ({
  fontSize: '13px',
  fontWeight: 600,
  color: theme.palette.primary.main,
  maxWidth: '200px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}))

const CloseButton = styled(Box, {
  shouldForwardProp: prop => prop !== 'isVisible'
})<{ isVisible?: boolean }>(({ theme, isVisible }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
  borderRadius: '3px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  color: theme.palette.primary.main,
  opacity: isVisible ? 1 : 0,
  '&:hover': {
    backgroundColor: theme.palette.primary.main + '30'
  }
}))

const TagWrapper = styled(Box)({
  position: 'relative',
  display: 'inline-block'
})

// ============= COMPONENT TYPES =============

export type QuestionIdTagProps = {
  questionId: string
  onRemove: () => void
}

// ============= MAIN COMPONENT =============

const QuestionIdTag = ({ questionId, onRemove }: QuestionIdTagProps) => {
  const theme = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  if (!questionId.trim()) {
    return null
  }

  const displayId = questionId.length > 20 ? questionId.substring(0, 20) + '...' : questionId

  return (
    <TagWrapper onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <TagContainer>
        <TagText title={questionId}>@{displayId}</TagText>
        <CloseButton isVisible={isHovered} onClick={onRemove} title='Xóa câu hỏi'>
          <X size={14} />
        </CloseButton>
      </TagContainer>
    </TagWrapper>
  )
}

export default QuestionIdTag
