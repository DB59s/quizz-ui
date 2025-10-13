// Component Imports
import TakeQuiz from '@/views/quiz/TakeQuiz'

type Props = {
  params: Promise<{ quizId: string }>
}

const TakeQuizPage = async ({ params }: Props) => {
  const { quizId } = await params
  
  return <TakeQuiz quizId={quizId} />
}

export default TakeQuizPage
