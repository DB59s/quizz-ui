// Component Imports
import ClassAssignments from '@/views/my-classes/ClassAssignments'

type Props = {
  params: Promise<{ classId: string }>
}

const ClassAssignmentsPage = async ({ params }: Props) => {
  const { classId } = await params
  
  return <ClassAssignments classId={classId} />
}

export default ClassAssignmentsPage
