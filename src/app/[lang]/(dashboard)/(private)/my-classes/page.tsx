// Component Imports
import ClassCard from '@/views/my-classes/ClassCard'

const MyClassesPage = async () => {
  return (
    <div className='flex flex-col gap-6'>
      <h1>Lớp học của bạn</h1>
      <ClassCard />
    </div>
  )
}

export default MyClassesPage
