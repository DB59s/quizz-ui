'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { styled, useTheme } from '@mui/material/styles'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

// Icons
import { Target, BookOpen, MessageCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

// ============= STYLED COMPONENTS =============

const InfoPanel = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover}40 100%)`,
  padding: theme.spacing(2),
  borderBottom: `1.5px solid ${theme.palette.primary.main}20`,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  borderRadius: '12px',
  margin: theme.spacing(1.5, 2),
  boxShadow: `0 2px 8px ${theme.palette.primary.main}15`
}))

const TestScenariosHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    opacity: 0.8
  }
}))

const HeaderTitle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  flex: 1
}))

const HeaderTitleText = styled(Typography)(({ theme }) => ({
  fontSize: '15px',
  fontWeight: 700,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text'
}))

const TestScenariosContainer = styled(Box, {
  shouldForwardProp: prop => prop !== 'expanded'
})<{ expanded?: boolean }>(({ theme, expanded }) => ({
  display: expanded ? 'flex' : 'none',
  gap: theme.spacing(1.2),
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'flex-start',
  marginTop: expanded ? theme.spacing(1) : 0,
  animation: expanded ? 'slideDown 0.3s ease' : 'none',
  '@keyframes slideDown': {
    from: {
      opacity: 0,
      transform: 'translateY(-10px)'
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)'
    }
  }
}))

const ScenarioButton = styled(Button, {
  shouldForwardProp: prop => prop !== 'active'
})<{ active?: boolean }>(({ theme, active }) => ({
  textTransform: 'none',
  padding: theme.spacing(1.1, 2.2),
  borderRadius: '24px',
  border: `2px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: active ? theme.palette.primary.main : theme.palette.background.paper,
  color: active ? '#ffffff' : theme.palette.primary.main,
  fontSize: '13px',
  fontWeight: 600,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  whiteSpace: 'nowrap',
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.75),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transition: 'left 0.3s ease',
    zIndex: 0
  },
  '&:hover::before': {
    left: '100%'
  },
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : theme.palette.action.hover,
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-3px)',
    boxShadow: active
      ? `0 4px 12px ${theme.palette.primary.main}40`
      : `0 4px 12px ${theme.palette.primary.main}25`
  },
  '&:active': {
    transform: 'translateY(-1px)'
  },
  '& > *': {
    position: 'relative',
    zIndex: 1
  }
}))

// ============= TYPES =============

export type ScenarioType = 'question_bank' | 'knowledge_base' | 'general'

export interface Scenario {
  id: ScenarioType
  label: string
  icon: typeof Target
}

// ============= MAIN COMPONENT =============

type TestScenariosPanelProps = {
  currentScenario: ScenarioType | null
  onScenarioChange: (scenario: ScenarioType | null) => void
}

const TestScenariosPanel = ({ currentScenario, onScenarioChange }: TestScenariosPanelProps) => {
  const theme = useTheme()
  const [expanded, setExpanded] = useState(true)

  // Test scenarios
  const scenarios: Scenario[] = [
    { id: 'question_bank', label: 'Question Bank', icon: Target },
    { id: 'knowledge_base', label: 'Knowledge Base', icon: BookOpen },
    { id: 'general', label: 'General Chat', icon: MessageCircle }
  ]

  const handleToggle = () => {
    setExpanded(prev => !prev)
  }

  return (
    <InfoPanel>
      <TestScenariosHeader onClick={handleToggle}>
        <HeaderTitle>
          <Sparkles size={20} color={theme.palette.primary.main} />
          <HeaderTitleText>Chọn chế độ</HeaderTitleText>
        </HeaderTitle>
        <IconButton
          size='small'
          onClick={(e) => { e.stopPropagation(); handleToggle(); }}
          sx={{
            color: 'primary.main',
            transition: 'transform 0.3s ease',
            transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)'
          }}
        >
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </IconButton>
      </TestScenariosHeader>
      <TestScenariosContainer expanded={expanded}>
        {scenarios.map(scenario => {
          const IconComponent = scenario.icon
          const isActive = currentScenario === scenario.id
          return (
            <ScenarioButton
              key={scenario.id}
              active={isActive}
              onClick={() => onScenarioChange(isActive ? null : scenario.id)}
              startIcon={<IconComponent size={17} />}
            >
              {scenario.label}
            </ScenarioButton>
          )
        })}
      </TestScenariosContainer>
    </InfoPanel>
  )
}

export default TestScenariosPanel

