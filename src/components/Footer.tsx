import { Box, Typography } from '@mui/material';

interface FooterProps {
  version?: string;
  status?: string;
}

export default function Footer({ version = '0.1.0', status = '未知' }: FooterProps) {
  return (
    <Box
      sx={{
        bgcolor: '#1E1E1E',
        borderTop: 1,
        borderColor: 'divider',
        p: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <Typography variant="caption" color="text.secondary">
        OpenClaw Desktop v{version} | Tauri
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {status}
      </Typography>
    </Box>
  );
}
