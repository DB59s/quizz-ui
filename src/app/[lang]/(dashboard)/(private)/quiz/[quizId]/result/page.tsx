// Component Imports
import QuizResult from '@/views/quiz/QuizResult'

type Props = {
  params: Promise<{ quizId: string }>
}

const QuizResultPage = async ({ params }: Props) => {
  const { quizId } = await params
  
  return <QuizResult quizId={quizId} />
}

export default QuizResultPage
