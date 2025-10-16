// Component Imports
import ClassDetail from '@/views/my-classes/ClassDetail'

type Props = {
  params: Promise<{ classId: string }>
}

const ClassDetailPage = async ({ params }: Props) => {
  const { classId } = await params
  
  return <ClassDetail classId={classId} />
}

export default ClassDetailPage
