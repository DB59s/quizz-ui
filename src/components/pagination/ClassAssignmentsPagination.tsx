'use client'

// MUI Imports
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { ArrowLeft2, ArrowRight2 } from 'iconsax-react'
import Pagination from 'rc-pagination/lib/Pagination'

// Styles
import 'rc-pagination/assets/index.css'

interface PaginationProps {
  pagination: {
    page?: number
    limit?: number
    totalItems?: number
    total_pages?: number
    items_per_page?: number
    total_items?: number
    current_page?: number
  }
  onChangePage: (page: number) => void
  onChangeLimit?: (limit: number) => void
}

const ClassAssignmentsPagination = ({ pagination, onChangePage, onChangeLimit }: PaginationProps) => {
  // Support both naming conventions from API
  const page = Number(pagination?.page || pagination?.current_page) || 1
  const limit = Number(pagination?.limit || pagination?.items_per_page) || 10
  const totalItems = Number(pagination?.totalItems || pagination?.total_items) || 0

  const startEntry = totalItems === 0 ? 0 : (page - 1) * limit + 1
  const endEntry = Math.min(page * limit, totalItems)

  const handleLimitChange = (event: any) => {
    if (onChangeLimit) {
      onChangeLimit(Number(event.target.value))
    }
  }

  // Custom pagination styles with primary-dark color
  const paginationStyles = `
    .rc-pagination {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .rc-pagination-item {
      min-width: 32px;
      height: 32px;
      line-height: 30px;
      text-align: center;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      background-color: var(--mui-palette-background-paper);
      color: var(--mui-palette-text-primary);
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 0;
      font-size: 14px;
    }

    .rc-pagination-item:hover {
      border-color: var(--mui-palette-primary-main);
      background-color: #f3f4f6;
    }

    .rc-pagination-item-active {
      background-color: var(--mui-palette-primary-dark);
      color: white;
      border-color: var(--mui-palette-primary-dark);
      font-weight: 600;
    }

    .rc-pagination-item-active a {
    color: white;
}

    .rc-pagination-item-active:hover {
      background-color: var(--mui-palette-primary-dark);
      border-color: var(--mui-palette-primary-dark);
    }

    .rc-pagination-prev,
    .rc-pagination-next {
      min-width: 32px;
      height: 32px;
      line-height: 30px;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      background-color: var(--mui-palette-background-paper);
      color: var(--mui-palette-text-primary);
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin: 0 2px;
    }

    .rc-pagination-prev:hover,
    .rc-pagination-next:hover {
      border-color: var(--mui-palette-primary-main);
      background-color: #f3f4f6;
    }

    .rc-pagination-prev.rc-pagination-disabled,
    .rc-pagination-next.rc-pagination-disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background-color: var(--mui-palette-background-paper);
      border-color: #e5e7eb;
    }

    .rc-pagination-jump-prev,
    .rc-pagination-jump-next {
      min-width: 32px;
      height: 32px;
      line-height: 30px;
      text-align: center;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      background-color: var(--mui-palette-background-paper);
      color: var(--mui-palette-text-primary);
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 0;
      margin: 0 2px;
    }

    .rc-pagination-jump-prev:hover,
    .rc-pagination-jump-next:hover {
      border-color: var(--mui-palette-primary-main);
      background-color: #f3f4f6;
    }

    .rc-pagination-jump-prev .rc-pagination-item-link-icon,
    .rc-pagination-jump-next .rc-pagination-item-link-icon {
      font-size: 12px;
    }
  `

  return (
    <>
      <style>{paginationStyles}</style>
      <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-5 gap-2'>
        <div className='flex items-center gap-4'>
          <Typography color='text.disabled' variant='body2'>
            {`Hiển thị ${startEntry} - ${endEntry} trong tổng số ${totalItems}`}
          </Typography>
          {onChangeLimit && (
            <div className='flex items-center gap-2'>
              <Typography color='text.disabled' variant='body2'>
                Số bản ghi:
              </Typography>
              <Select
                value={limit}
                onChange={handleLimitChange}
                size='small'
                sx={{
                  minWidth: 80,
                  height: 32,
                  '& .MuiSelect-select': {
                    py: 0.5
                  }
                }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </div>
          )}
        </div>
        <Pagination
          current={page}
          total={totalItems}
          pageSize={limit}
          hideOnSinglePage
          showTitle={false}
          showPrevNextJumpers
          className='hover:cursor-pointer'
          onChange={onChangePage}
          nextIcon={<ArrowRight2 color='var(--mui-palette-text-primary)' size='16' />}
          prevIcon={<ArrowLeft2 size='16' color='var(--mui-palette-text-primary)' />}
          jumpPrevIcon={<span style={{ fontSize: '12px', fontWeight: 'bold' }}>«</span>}
          jumpNextIcon={<span style={{ fontSize: '12px', fontWeight: 'bold' }}>»</span>}
        />
      </div>
    </>
  )
}

export default ClassAssignmentsPagination
