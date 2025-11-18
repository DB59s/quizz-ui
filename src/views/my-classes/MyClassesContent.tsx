'use client'

import { useState, memo } from 'react'
import { Button } from '@mui/material'
import ClassCard from './ClassCard'
import RegisterClassSection from './RegisterClassSection'

const MyClassesContent = memo(() => {
  const [showRegisterSection, setShowRegisterSection] = useState(false)

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex justify-between items-center'>
        <h1>Lớp học của bạn</h1>
        {!showRegisterSection && (
          <Button
            variant='contained'
            onClick={() => setShowRegisterSection(true)}
          >
            Đăng kí lớp học mới
          </Button>
        )}
      </div>

      {showRegisterSection && (
        <div className='mb-4'>
          <Button
            variant='outlined'
            onClick={() => setShowRegisterSection(false)}
            className='mb-4'
          >
            ← Quay lại danh sách lớp
          </Button>
          <RegisterClassSection />
        </div>
      )}

      {!showRegisterSection && <ClassCard />}
    </div>
  )
})

MyClassesContent.displayName = 'MyClassesContent'

export default MyClassesContent
