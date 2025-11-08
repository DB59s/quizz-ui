// Component Imports
import TakeQuiz from '@/views/quiz/TakeQuiz'

type Props = {
  params: Promise<{ quizId: string }>;
  searchParams?: Promise<{ quizzClassId?: string }>;
}

const TakeQuizPage = async ({ params, searchParams }: Props) => {
  const { quizId } = await params
  const resolvedSearchParams = await searchParams
  const quizzClassId = resolvedSearchParams?.quizzClassId

  return <TakeQuiz quizId={quizId} quizzClassId={quizzClassId} />
}

export default TakeQuizPage
