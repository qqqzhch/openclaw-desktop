import { useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Alert
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useAppStore } from '../store';
import Loading from './Loading';

function formatUptime(seconds?: number): string {
  if (!seconds) return '0天 0小时 0分钟';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}天 ${hours}小时 ${minutes}分钟`;
}

function formatMemory(bytes?: number): string {
  if (!bytes) return '0MB';
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)}MB`;
  return `${(mb / 1024).toFixed(1)}GB`;
}

export default function StatusMonitor() {
  const {
    status,
    statusLoading,
    statusError,
    startOpenClaw,
    stopOpenClaw,
    fetchStatus
  } = useAppStore();

  const isRunning = status?.running ?? false;

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    const interval = setInterval(fetchStatus, 5000);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleStart = async () => {
    try {
      await startOpenClaw();
    } catch (error) {
      console.error('启动失败:', error);
      alert('启动失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleStop = async () => {
    try {
      await stopOpenClaw();
    } catch (error) {
      console.error('停止失败:', error);
      alert('停止失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleRefresh = () => {
    fetchStatus();
  };

  if (statusLoading && !status) {
    return <Loading type="status" />;
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        OpenClaw 状态监控
      </Typography>

      {statusError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {statusError}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* 运行状态和系统信息卡片 */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* 运行状态卡片 */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                运行状态
              </Typography>
              {statusLoading && <LinearProgress sx={{ mb: 2 }} />}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {isRunning ? (
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                ) : (
                  <PendingIcon color="warning" sx={{ mr: 1 }} />
                )}
                <Typography variant="body1">
                  {isRunning ? '✅ 运行中' : '⏸️ 已停止'}
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleStart}
                  disabled={isRunning || statusLoading}
                  fullWidth
                >
                  启动 OpenClaw
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={handleStop}
                  disabled={!isRunning || statusLoading}
                  fullWidth
                >
                  停止 OpenClaw
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* 系统信息卡片 */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                系统信息
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    进程 ID
                  </Typography>
                  <Typography variant="body2">
                    {status?.pid || '-'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    运行时间
                  </Typography>
                  <Typography variant="body2">
                    {formatUptime(status?.uptime)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    消息数
                  </Typography>
                  <Typography variant="body2">
                    {status?.message_count?.toLocaleString() || '0'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    内存占用
                  </Typography>
                  <Typography variant="body2">
                    {formatMemory(status?.memory_usage)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    端口
                  </Typography>
                  <Typography variant="body2">
                    {status?.port || '-'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {/* 快捷操作卡片 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              快捷操作
            </Typography>
            <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
              >
                刷新状态
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
