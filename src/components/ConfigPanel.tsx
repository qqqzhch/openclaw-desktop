import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import UndoIcon from '@mui/icons-material/Undo';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';

import { useAppStore } from '../store';
import Loading from './Loading';
import type { AppConfig } from '../api/openclaw';

const DEFAULT_CONFIG: AppConfig = {
  version: "0.2.0",
  openclaw: {
    enabled: true,
    auto_start: false,
    log_level: "INFO",
    max_logs: 1000
  },
  network: {
    host: "127.0.0.1",
    port: 8080,
    timeout: 30
  },
  ui: {
    theme: "dark",
    auto_refresh: true,
    refresh_interval: 2000
  }
};

export default function ConfigPanel() {
  const {
    config,
    configLoading,
    configError,
    configDirty,
    fetchConfig,
    saveConfig,
    updateConfig
  } = useAppStore();

  const [localConfig, setLocalConfig] = useState<string>(JSON.stringify(DEFAULT_CONFIG, null, 2));
  const [originalConfigStr, setOriginalConfigStr] = useState<string>(JSON.stringify(DEFAULT_CONFIG, null, 2));
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (config) {
      const configStr = JSON.stringify(config, null, 2);
      setLocalConfig(configStr);
      setOriginalConfigStr(configStr);
      setIsValid(true);
      setError('');
    }
  }, [config]);

  const validateJSON = (jsonString: string): AppConfig | null => {
    try {
      const parsed = JSON.parse(jsonString);
      // 基本验证
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('配置必须是一个对象');
      }
      return parsed;
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newConfig = e.target.value;
    setLocalConfig(newConfig);
    const parsed = validateJSON(newConfig);
    setIsValid(parsed !== null);
    if (parsed !== null) {
      setError('');
      // 更新 store
      updateConfig(parsed);
    }
  };

  const handleSave = async () => {
    if (!isValid) {
      alert('配置无效，无法保存');
      return;
    }

    try {
      const result = await saveConfig();
      if (result.success) {
        setSuccess(true);
        setOriginalConfigStr(localConfig);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert('保存失败: ' + (result.message || '未知错误'));
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleReset = () => {
    setLocalConfig(originalConfigStr);
    setError('');
    setIsValid(true);
    if (config) {
      updateConfig(config);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(localConfig);
      const formatted = JSON.stringify(parsed, null, 2);
      setLocalConfig(formatted);
      setError('');
      setIsValid(true);
      updateConfig(parsed);
    } catch (error) {
      setError('JSON 格式错误，无法格式化');
    }
  };

  // 计算统计信息
  const configStats = {
    lines: localConfig.split('\n').length,
    characters: localConfig.length,
    hasChanges: localConfig !== originalConfigStr
  };

  if (configLoading && !config) {
    return <Loading type="page" />;
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        配置面板
      </Typography>

      {configError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
          {configError}
        </Alert>
      )}

      <Stack spacing={2}>
        {/* 状态栏 */}
        <Card>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={isValid ? "✅ JSON 有效" : "❌ JSON 无效"}
                  color={isValid ? "success" : "error"}
                  size="small"
                />
                <Chip
                  label={`${configStats.lines} 行`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`${configStats.characters} 字符`}
                  size="small"
                  variant="outlined"
                />
                {(configDirty || configStats.hasChanges) && (
                  <Chip label="未保存" color="warning" size="small" />
                )}
              </Stack>

              <Stack direction="row" spacing={1}>
                <IconButton onClick={handleFormat} title="格式化 JSON">
                  <FormatAlignLeftIcon />
                </IconButton>
                <IconButton onClick={handleReset} title="重置更改" disabled={!configStats.hasChanges}>
                  <UndoIcon />
                </IconButton>
                <IconButton onClick={() => fetchConfig()} title="重新加载配置">
                  <RefreshIcon />
                </IconButton>
                <IconButton onClick={handleSave} title="保存配置" color="primary" disabled={!isValid}>
                  <SaveIcon />
                </IconButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* 成功提示 */}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(false)}>
            配置保存成功！
          </Alert>
        )}

        {/* 配置编辑器 */}
        <Card>
          <CardContent>
            <TextField
              multiline
              fullWidth
              value={localConfig}
              onChange={handleConfigChange}
              error={!isValid}
              helperText={error || '编辑 OpenClaw 配置'}
              sx={{
                '& .MuiInputBase-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  bgcolor: '#0d0d0d',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: isValid ? '#424242' : '#f44336',
                  },
                },
              }}
              InputProps={{
                sx: {
                  height: '500px',
                  '& textarea': {
                    overflow: 'auto !important',
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
                  },
                },
              }}
            />
          </CardContent>
        </Card>

        {/* 快捷操作 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              快捷操作
            </Typography>
            <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
              <Button variant="outlined" size="small" onClick={handleFormat} startIcon={<FormatAlignLeftIcon />}>
                格式化 JSON
              </Button>
              <Button variant="outlined" size="small" onClick={handleReset} disabled={!configStats.hasChanges} startIcon={<UndoIcon />}>
                重置更改
              </Button>
              <Button variant="outlined" size="small" onClick={() => fetchConfig()} startIcon={<RefreshIcon />}>
                重新加载配置
              </Button>
              <Button variant="contained" size="small" onClick={handleSave} disabled={!isValid} startIcon={<SaveIcon />}>
                保存配置
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
