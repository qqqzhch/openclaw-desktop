import { Box, Skeleton } from '@mui/material';

interface LoadingProps {
  type?: 'page' | 'list' | 'status' | 'default';
}

export default function Loading({ type = 'default' }: LoadingProps) {
  if (type === 'page') {
    return (
      <Box sx={{ p: 3 }}>
        {/* 模拟页面骨架屏 */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={200} />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="text" />
        </Box>

        <Box>
          <Skeleton variant="rectangular" width="100%" height={100} />
        </Box>
      </Box>
    );
  }

  if (type === 'list') {
    return (
      <Box sx={{ p: 2 }}>
        {[...Array(5)].map((_, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Skeleton variant="text" width="30%" sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="60%" />
          </Box>
        ))}
      </Box>
    );
  }

  if (type === 'status') {
    return (
      <Box sx={{ p: 3 }}>
        {/* 状态卡片 */}
        <Skeleton variant="rectangular" width="100%" height={120} sx={{ mb: 3 }} />

        {/* 按钮组 */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Skeleton variant="rectangular" width={120} height={48} />
          <Skeleton variant="rectangular" width={120} height={48} />
        </Box>

        {/* 详细信息 */}
        <Skeleton variant="text" width={200} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={250} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={180} />
      </Box>
    );
  }

  // 默认加载状态
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        p: 3
      }}
    >
      <Skeleton variant="circular" width={60} height={60} sx={{ mb: 2 }} />
      <Skeleton variant="text" width={200} />
    </Box>
  );
}
