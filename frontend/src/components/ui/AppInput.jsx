import { TextField } from '@mui/material';

const sx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: '#f9fafb',
    fontSize: '0.875rem',
    fontWeight: 500,
    '& fieldset': { borderColor: '#e8eaef', transition: 'border-color 0.15s' },
    '&:hover fieldset': { borderColor: '#09C8E5' },
    '&.Mui-focused fieldset': { borderColor: '#07A0B8', borderWidth: '1.5px' },
  },
  '& .MuiOutlinedInput-input': { py: '11px' },
  '& input::placeholder': { color: '#adb5bd', opacity: 1 },
  '& input': { color: '#111' },
  '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
    WebkitBoxShadow: '0 0 0 1000px #f9fafb inset',
    WebkitTextFillColor: '#111',
    caretColor: '#111',
  },
};

export default function AppInput({ inputProps, ...props }) {
  return (
    <TextField
      fullWidth
      size="small"
      InputLabelProps={{ required: false }}
      inputProps={inputProps}
      sx={sx}
      {...props}
    />
  );
}
