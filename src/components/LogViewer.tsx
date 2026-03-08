import React, { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Delete as ClearIcon
} from '@mui/icons-material';

import { Log, LogLevel } from '../types';

interface LogViewerProps {
  logs: Log[];
  onRefresh?: () => void;
  onClear?: () => void;
}

export default function LogViewer({ logs, onRefresh, onClear }: LogViewerProps) {
  const [localKeyword, setLocalKeyword] = useState('');
  const [localLevel, setLocalLevel] = useState<LogLevel>('ALL');
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const getLogLevelColor = (level: string): string => {
    switch (level) {
      case 'INFO':
        return '#4caf50';
      case 'WARN':
        return '#ff9800';
      case 'ERROR':
        return '#f44336';
      case 'DEBUG':
        return '#2196f3';
      default:
        return '#9e9e9e';
    }
  };

  const filteredLogs = logs.filter((log: Log) => {
    const matchesLevel = localLevel === 'ALL' || log.level === localLevel;
    const matchesKeyword = localKeyword === '' || log.message.toLowerCase().includes(localKeyword.toLowerCase());
    return matchesLevel && matchesKeyword;
  });

  const handleKeywordChange = (keyword: string) => {
    setLocalKeyword(keyword);
  };

  const handleLevelChange = (level: string) => {
    setLocalLevel(level as LogLevel);
  };

  const handleRefresh = () => {
    setLogsLoading(true);
    onRefresh?.();
    setTimeout(() => {
      setLogsLoading(false);
    }, 1000);
  };

  const handleClear = () => {
    onClear?.();
    setLocalKeyword('');
  };

  if (logsLoading && logs.length === 0) {
    return (
      <Box>
        <Typography>加载中...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        日志查看器
      </Typography>

      {logsError && (
        <Typography color="error" sx={{ mb: 2 }}>
          {logsError}
        </Typography>
      )}

      <Stack spacing={2}>
        {/* 控制栏 */}
        <Card>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              {/* 搜索框 */}
              <TextField
                size="small"
                placeholder="搜索日志..."
                value={localKeyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ minWidth: 200, flex: 1 }}
              />

              {/* 日志级别过滤 */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>日志级别</InputLabel>
                <Select
                  value={localLevel}
                  label="日志级别"
                  onChange={(e) => handleLevelChange(e.target.value as string)}
                >
                  <MenuItem value="ALL">全部</MenuItem>
                  <MenuItem value="INFO">INFO</MenuItem>
                  <MenuItem value="WARN">WARN</MenuItem>
                  <MenuItem value="ERROR">ERROR</MenuItem>
                  <MenuItem value="DEBUG">DEBUG</MenuItem>
                </Select>
              </FormControl>

              {/* 统计信息 */}
              <Stack direction="row" spacing={1}>
                <Chip label={`总计: ${logs.length}`} size="small" />
                <Chip label={`显示: ${filteredLogs.length}`} size="small" color="primary" />
              </Stack>

              {/* 操作按钮 */}
              <Box sx={{ flexGrow: 1 }} />
              <Stack direction="row" spacing={1}>
                <IconButton onClick={handleRefresh} title="刷新">
                  <RefreshIcon />
                </IconButton>
                <IconButton onClick={handleClear} title="清空">
                  <ClearIcon />
                </IconButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* 日志内容 */}
        <Card>
          <CardContent>
            <Box
              ref={scrollRef}
              sx={{
                height: '500px',
                overflow: 'auto',
                bgcolor: '#0d0d0d',
                borderRadius: 1,
                p: 2,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                '&::-webkit-scrollbar': {
                  width: 8,
                },
                '&::-webkit-scrollbar-track': {
                  bgcolor: '#1e1e1e',
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: '#424242',
                  borderRadius: 4,
                },
              }}
            >
              {filteredLogs.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                  {logs.length === 0 ? '暂无日志' : '没有匹配的日志'}
                </Typography>
              ) : (
                filteredLogs.map((log: Log, index: number) => (
                  <Box
                    key={`${log.timestamp}-${index}`}
                    sx={{
                      py: 0.5,
                      borderBottom: '1px solid' #1e1e1e',
                      color: getLogLevelColor(log.level),
                      display: 'flex',
                      gap: 2
                    }}
                  >
                    <Box component="span" sx={{ color: '#666', minWidth: 150, flexShrink: 0 }}>
                      {log.timestamp}
                    </Box>
                    <Box component="span" sx={{ minWidth: 60, flexShrink: 0, fontWeight: 'bold' }}>
                      [{log.level}]
                    </Box>
                    <Box component="span" sx={{ flex: 1 }}>
                      {log.message}
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
