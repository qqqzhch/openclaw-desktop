import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Stack,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon
} from '@mui/icons-material';

import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  onSend?: (message: string) => void;
}

export default function MessageList({ messages, onSend }: MessageListProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSend = async () => {
    if (inputMessage.trim() && onSend && !sending) {
      setSending(true);
      try {
        await onSend(inputMessage);
        setInputMessage('');
      } catch (error) {
        console.error('发送消息失败：', error);
      } finally {
        setSending(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredMessages = messages.filter((msg: Message) => {
    if (searchKeyword === '') {
      return true;
    }
    return msg.content.toLowerCase().includes(searchKeyword.toLowerCase());
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        消息列表
      </Typography>

      <Stack spacing={2}>
        {/* 搜索框 */}
        <Card>
          <CardContent>
            <TextField
              size="small"
              placeholder="搜索消息..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ width: '100%' }}
              onKeyPress={handleKeyPress}
}
          </CardContent>
        </Card>

        {/* 消息输入 */}
        <Card>
          <CardContent>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                placeholder="输入消息..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={sending}
                onKeyPress={handleKeyPress}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={handleSend}
                      disabled={sending || !inputMessage.trim()}
                      size="small"
                    >
                      <SendIcon />
                    </IconButton>
                  ),
                }}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* 消息列表 */}
        <Card>
          <CardContent>
            {messages.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                暂无消息
              </Typography>
            ) : (
              <Box sx={{ height: 400, overflow: 'auto', bgcolor: '#0d1117', borderRadius: 1, p: 2 }}>
                {filteredMessages.map((msg: Message) => (
                  <Box
                    key={msg.id}
                    sx={{
                      py: 1.5,
                      borderBottom: '1px solid #1e1e1e',
                      color: msg.message_type === 'user' ? '#2196f3' : '#666',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Box
                        sx={{
                          minWidth: 150,
                          flexShrink: 0,
                          fontWeight: msg.message_type === 'user' ? 'bold' : 'normal',
                        }}
                      >
                        {msg.timestamp}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        {msg.content}
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* 统计信息 */}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            总计：{messages.length} 条消息
          </Typography>
          <Typography variant="body2" color="text.secondary">
            显示：{filteredMessages.length} 条
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
