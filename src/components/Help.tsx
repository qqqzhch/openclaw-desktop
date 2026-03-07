import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

export default function Help() {
  const shortcuts = [
    { key: 'Ctrl/Cmd + R', description: '刷新当前页面' },
    { key: 'Ctrl/Cmd + 1-4', description: '切换到标签页 1-4' },
    { key: 'Ctrl/Cmd + Tab', description: '切换到下一个标签页' },
    { key: 'Ctrl/Cmd + Shift + Tab', description: '切换到上一个标签页' },
  ];

  const features = [
    { name: '状态监控', description: '查看 OpenClaw 运行状态、启动/停止服务' },
    { name: '配置面板', description: '编辑和管理 OpenClaw 配置文件' },
    { name: '日志查看', description: '实时查看和过滤系统日志' },
    { name: '消息列表', description: '查看和管理消息流' },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        帮助和文档
      </Typography>

      <Stack spacing={3}>
        {/* 欢迎卡片 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              欢迎使用 OpenClaw Desktop
            </Typography>
            <Typography variant="body2" color="text.secondary">
              OpenClaw Desktop 是 OpenClaw 的桌面管理界面，提供了一个直观的方式来管理您的 OpenClaw 实例。
            </Typography>
          </CardContent>
        </Card>

        {/* 功能介绍 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              主要功能
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {features.map((feature, index) => (
                <Box key={index}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {feature.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* 快捷键 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              键盘快捷键
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 2, bgcolor: '#0d0d0d' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>快捷键</TableCell>
                    <TableCell>功能</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shortcuts.map((shortcut, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip label={shortcut.key} variant="outlined" size="small" />
                      </TableCell>
                      <TableCell>{shortcut.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* 版本信息 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              版本信息
            </Typography>
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>版本:</strong> 0.2.0 MVP
              </Typography>
              <Typography variant="body2">
                <strong>构建:</strong> Tauri + React + TypeScript
              </Typography>
              <Typography variant="body2">
                <strong>状态:</strong> 开发版本
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* 获取帮助 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              获取帮助
            </Typography>
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Typography variant="body2">
                • 查看文档: <a href="#" style={{ color: '#1976D2' }}>OpenClaw Documentation</a>
              </Typography>
              <Typography variant="body2">
                • 提交问题: <a href="#" style={{ color: '#1976D2' }}>GitHub Issues</a>
              </Typography>
              <Typography variant="body2">
                • 加入社区: <a href="#" style={{ color: '#1976D2' }}>Discord / Slack</a>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
