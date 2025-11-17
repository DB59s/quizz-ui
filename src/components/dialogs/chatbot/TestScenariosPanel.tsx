'use client'

// MUI Imports
import Box from '@mui/material/Box'

// Icons
import { Target, BookOpen, MessageCircle } from 'lucide-react'

// Styled Components
import { TestScenariosContainer, ScenarioButton } from './styles/TestScenariosPanel.styles'

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
  // Test scenarios
  const scenarios: Scenario[] = [
    { id: 'question_bank', label: 'Question Bank', icon: Target },
    { id: 'knowledge_base', label: 'Knowledge Base', icon: BookOpen },
    { id: 'general', label: 'General Chat', icon: MessageCircle }
  ]

  return (
    <TestScenariosContainer>
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
  )
}

export default TestScenariosPanel
