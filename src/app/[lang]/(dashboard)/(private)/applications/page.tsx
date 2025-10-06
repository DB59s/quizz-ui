// Component Imports
import ApplicationsTable from '@/views/applications/ApplicationsTable'

const ApplicationsPage = async () => {
  return (
    <div className='flex flex-col gap-6'>
      <h1>Đơn đăng kí</h1>
      <ApplicationsTable />
    </div>
  )
}

export default ApplicationsPage
