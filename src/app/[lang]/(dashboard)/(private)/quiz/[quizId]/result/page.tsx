// Component Imports
import QuizResult from '@/views/quiz/QuizResult'

type Props = {
  params: Promise<{ quizId: string }>
}

const QuizResultPage = async ({ params }: Props) => {
  const { quizId } = await params

  // quizId from URL is actually the submission_id
  return <QuizResult submissionId={quizId} />
}

export default QuizResultPage
