import { useState } from 'react';
import { IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AppInput from './AppInput';

export default function PasswordInput({ inputProps, ...props }) {
  const [show, setShow] = useState(false);

  return (
    <AppInput
      type={show ? 'text' : 'password'}
      inputProps={inputProps}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={() => setShow(v => !v)}
              edge="end"
              tabIndex={-1}
              sx={{ color: '#9ca3af' }}
            >
              {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
}
