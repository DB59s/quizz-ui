import SearchClass from "@/views/register-class/SearchClass"

const RegisterClassPage = async () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Đăng kí lớp học</h1>
      <SearchClass />
    </div>
  )
}

export default RegisterClassPage
