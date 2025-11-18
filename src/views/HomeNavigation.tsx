'use client'

// React Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
// import Fab from '@mui/material/Fab'

const HomeNavigation = () => {
  const params = useParams()
  const router = useRouter()
  const { lang: locale } = params

  const navigationCards = [
    {
      title: 'Lớp học của bạn',
      description: 'Xem danh sách các lớp học mà bạn đang tham gia và đăng kí lớp học mới',
      icon: 'tabler-school',
      href: `/${locale}/my-classes`,
      color: 'primary'
    },
    {
      title: 'Đơn đăng kí',
      description: 'Quản lý các đơn đăng kí lớp học của bạn',
      icon: 'tabler-file-text',
      href: `/${locale}/applications`,
      color: 'info'
    }
  ]

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex justify-between items-center'>
        <h1>Trang chủ</h1>
      </div>

      <Grid container spacing={6}>
        {navigationCards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card 
              className='h-full cursor-pointer hover:shadow-lg transition-shadow'
              onClick={() => router.push(card.href)}
            >
              <CardContent className='flex flex-col gap-4 h-full'>
                <div className='flex items-center gap-4'>
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-${card.color}-100`}>
                    <i className={`${card.icon} text-2xl text-${card.color}-main`} />
                  </div>
                  <Typography variant='h3'>{card.title}</Typography>
                </div>
                <Typography variant='body2' color='text.secondary' className='flex-grow'>
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  )
}

export default HomeNavigation
