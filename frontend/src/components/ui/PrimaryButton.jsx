import { Button } from '@mui/material';

export default function PrimaryButton({ children, sx, ...props }) {
  return (
    <Button
      variant="contained"
      fullWidth
      disableElevation
      sx={[{
        py: 1.5,
        bgcolor: '#07A0B8',
        color: '#fff',
        fontWeight: 700,
        fontSize: '0.875rem',
        textTransform: 'none',
        borderRadius: '12px',
        letterSpacing: '0.01em',
        '&:hover': { bgcolor: '#445494' },
        '&.Mui-disabled': { bgcolor: '#e5e7eb', color: '#9ca3af' },
      }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...props}
    >
      {children}
    </Button>
  );
}
