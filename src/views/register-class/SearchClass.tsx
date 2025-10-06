'use client'

import { Button } from "@mui/material"
import { useState, useEffect } from "react"
import ClassInformation from "./ClassInformation"

const STORAGE_KEY = 'last_searched_class_code'

const SearchClass = () => {
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
      // Clear input after search
      setClassCode('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="w-full">
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
      
      {searchedCode && <ClassInformation classCode={searchedCode} />}
    </div>
  )
}

export default SearchClass



