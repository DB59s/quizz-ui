import Box from '@mui/material/Box'

export const LoadingState = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '896px',
          flex: 1,
          px: { xs: 2, sm: 3, lg: 4 },
          py: 4
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                height: 16,
                width: 192,
                borderRadius: '9999px',
                bgcolor: 'action.disabledBackground',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            />
            <Box
              sx={{
                mt: 2,
                height: 8,
                width: '100%',
                borderRadius: '9999px',
                bgcolor: 'action.disabledBackground',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            />
          </Box>
          <Box
            sx={{
              width: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              p: { xs: 3, sm: 4 },
              boxShadow: 1
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box
                sx={{
                  height: 32,
                  width: '33%',
                  borderRadius: 2,
                  bgcolor: 'action.disabledBackground',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              />
              <Box
                sx={{
                  height: 24,
                  width: '100%',
                  borderRadius: 2,
                  bgcolor: 'action.disabledBackground',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                {[1, 2, 3, 4].map(i => (
                  <Box
                    key={i}
                    sx={{
                      height: 56,
                      width: '100%',
                      borderRadius: 2,
                      bgcolor: 'action.disabledBackground',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
