'use client'

import { Button } from "@mui/material"
import { useState, useEffect } from "react"
import ClassInformation from "@/views/register-class/ClassInformation"

const STORAGE_KEY = 'last_searched_class_code'

const RegisterClassSection = () => {
  const [classCode, setClassCode] = useState('')
  const [searchedCode, setSearchedCode] = useState('')

  // Restore last searched code from sessionStorage on mount
  useEffect(() => {
    const lastSearched = sessionStorage.getItem(STORAGE_KEY)
    if (lastSearched) {
      setSearchedCode(lastSearched)
      setClassCode(lastSearched)
    }
  }, [])

  const handleSearch = () => {
    if (classCode.trim()) {
      const trimmedCode = classCode.trim()
      setSearchedCode(trimmedCode)
      // Save to sessionStorage
      sessionStorage.setItem(STORAGE_KEY, trimmedCode)
      // Keep input value for reference
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleClearSearch = () => {
    setSearchedCode('')
    setClassCode('')
  }

  return (
    <div className="w-full">
      {!searchedCode ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Đăng kí lớp học mới</h2>
          <p className="text-gray-600 mb-4">Nhập mã lớp học để tìm kiếm và đăng kí một lớp học mới</p>
          <div className="flex gap-3 w-full">
            <input
              type="text"
              placeholder="Nhập mã lớp học..."
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button variant="contained" onClick={handleSearch}>
              Tìm kiếm
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <Button
            variant="outlined"
            onClick={handleClearSearch}
            className="mb-4"
          >
            ← Thay đổi mã lớp
          </Button>
          <ClassInformation classCode={searchedCode} />
        </div>
      )}
    </div>
  )
}

export default RegisterClassSection
