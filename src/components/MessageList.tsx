import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useAppStore } from '../store';
import Loading from './Loading';
import type { Message } from '../api/openclaw';

export default function MessageList() {
  const {
    messages,
    messagesLoading,
    messagesError,
    fetchMessages,
    addMessage
  } = useAppStore();

  const [inputMessage, setInputMessage] = useState('');
  const [inputChannel, setInputChannel] = useState('general');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages(undefined, 50); // 获取最近 50 条消息

    const interval = setInterval(() => {
      fetchMessages(undefined, 50);
    }, 5000); // 每 5 秒刷新一次

    return () => clearInterval(interval);
  }, [fetchMessages]);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setLoading(true);

    try {
      // 调用 API 发送消息
      // 注意：这里需要实现 openclawApi.sendMessage
      // 目前先添加到本地列表
      const newMessage: Message = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        channel: inputChannel,
        content: inputMessage,
        author: 'User'
      };

      addMessage(newMessage);
      setInputMessage('');
    } catch (error) {
      console.error('发送消息失败:', error);
      alert('发送失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }

    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClear = () => {
    // 清空本地消息列表
    // 注意：store 中没有 clearMessages 方法，暂时不做
    // 可以添加到 store 中
  };

  const handleDelete = (_id: string) => {
    // TODO: 实现删除消息功能
  };

  const handleRefresh = () => {
    fetchMessages(undefined, 50);
  };

  const filteredMessages = messages.filter(msg =>
    filter === '' ||
    msg.content.toLowerCase().includes(filter.toLowerCase()) ||
    msg.channel.toLowerCase().includes(filter.toLowerCase())
  );

  const messageCount = {
    total: messages.length,
    channels: [...new Set(messages.map(m => m.channel))].length
  };

  if (messagesLoading && messages.length === 0) {
    return <Loading type="list" />;
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        消息列表
      </Typography>

      {messagesError && (
        <Typography color="error" sx={{ mb: 2 }}>
          {messagesError}
        </Typography>
      )}

      <Stack spacing={2}>
        {/* 控制栏 */}
        <Card>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <TextField
                size="small"
                placeholder="搜索消息..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={{ minWidth: 200, flex: 1 }}
              />

              <Stack direction="row" spacing={1}>
                <Chip label={`总计: ${messageCount.total}`} size="small" />
                <Chip label={`频道: ${messageCount.channels}`} size="small" color="primary" />
              </Stack>

              <Box sx={{ flexGrow: 1 }} />

              <Stack direction="row" spacing={1}>
                <IconButton onClick={handleRefresh} title="刷新">
                  <RefreshIcon />
                </IconButton>
                <IconButton onClick={handleClear} title="清空消息">
                  <ClearIcon />
                </IconButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* 消息列表 */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box
              ref={scrollRef}
              sx={{
                height: '400px',
                overflow: 'auto',
                bgcolor: '#0d0d0d',
                p: 2,
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
              {filteredMessages.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                  {messages.length === 0 ? '暂无消息' : '没有匹配的消息'}
                </Typography>
              ) : (
                <List>
                  {filteredMessages.map((message) => (
                    <ListItem
                      key={message.id}
                      sx={{
                        borderBottom: '1px solid #1e1e1e',
                        bgcolor: '#1a1a1a',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                              label={message.channel}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            {message.author && (
                              <Typography variant="caption" color="text.secondary">
                                @{message.author}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {new Date(message.timestamp).toLocaleString('zh-CN')}
                            </Typography>
                          </Box>
                        }
                        secondary={message.content}
                        secondaryTypographyProps={{
                          sx: {
                            color: 'text.primary',
                            mt: 0.5,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                          }
                        }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleDelete(message.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* 消息输入框 */}
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>频道</InputLabel>
                <Select
                  value={inputChannel}
                  label="频道"
                  onChange={(e) => setInputChannel(e.target.value)}
                >
                  <MenuItem value="general">general</MenuItem>
                  <MenuItem value="status">status</MenuItem>
                  <MenuItem value="log">log</MenuItem>
                </Select>
              </FormControl>
              <TextField
                multiline
                fullWidth
                placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                maxRows={4}
                sx={{
                  '& .MuiInputBase-root': {
                    bgcolor: '#0d0d0d',
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || loading}
                endIcon={<SendIcon />}
                sx={{ minWidth: 100, alignSelf: 'flex-start', mt: 2 }}
              >
                发送
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
