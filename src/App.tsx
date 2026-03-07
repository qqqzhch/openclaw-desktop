import { useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Tabs, Tab, Typography, AppBar, Toolbar, IconButton, Fade } from '@mui/material';
import { Settings as SettingsIconSettings, Description as DescriptionIcon, Message as MessageIcon, Assessment as AssessmentIcon, Help as HelpIcon } from '@mui/icons-material';

// 导入组件
import StatusMonitor from './components/StatusMonitor';
import LogViewer from './components/LogViewer';
import ConfigPanel from './components/ConfigPanel';
import MessageList from './components/MessageList';
import Footer from './components/Footer';
import Help from './components/Help';

// 导入 store
import { useAppStore } from './store';

// 创建深色主题
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976D2',
    },
    secondary: {
      main: '#FF6B6B',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      <Fade in={value === index} timeout={300}>
        <Box sx={{ p: 3 }}>
          {value === index && children}
        </Box>
      </Fade>
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function App() {
  // 从 store 获取状态和 actions
  const {
    currentTab,
    setCurrentTab,
    status,
    version,
    fetchStatus,
    fetchVersion
  } = useAppStore();

  useEffect(() => {
    // 初始化数据
    fetchVersion();
    fetchStatus();

    // 定时更新状态
    const interval = setInterval(fetchStatus, 5000);

    return () => clearInterval(interval);
  }, [fetchVersion, fetchStatus]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // 获取状态文本
  const getStatusText = () => {
    if (!status) return '未知';
    return status.running ? '运行中' : '已停止';
  };

  // 获取版本号
  const getVersionText = () => {
    if (version?.version) {
      return version.version;
    }
    return '0.1.0';
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* 顶部应用栏 */}
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              OpenClaw Desktop
            </Typography>
            <Typography variant="body2" sx={{ mr: 2 }}>
              v{getVersionText()}
            </Typography>
            <IconButton color="inherit">
              <SettingsIconSettings />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Tab 导航 */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#1E1E1E' }}>
          <Tabs
            value={currentTab}
            onChange={handleChange}
            aria-label="OpenClaw 管理面板"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<AssessmentIcon />}
              label={`状态监控 (${getStatusText()})`}
              {...a11yProps(0)}
            />
            <Tab icon={<SettingsIconSettings />} label="配置面板" {...a11yProps(1)} />
            <Tab icon={<DescriptionIcon />} label="日志查看" {...a11yProps(2)} />
            <Tab icon={<MessageIcon />} label="消息列表" {...a11yProps(3)} />
            <Tab icon={<HelpIcon />} label="帮助" {...a11yProps(4)} />
          </Tabs>
        </Box>

        {/* Tab 内容 */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <TabPanel value={currentTab} index={0}>
            <StatusMonitor />
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <ConfigPanel />
          </TabPanel>
          <TabPanel value={currentTab} index={2}>
            <LogViewer />
          </TabPanel>
          <TabPanel value={currentTab} index={3}>
            <MessageList />
          </TabPanel>
          <TabPanel value={currentTab} index={4}>
            <Help />
          </TabPanel>
        </Box>

        {/* 底部状态栏 */}
        <Footer version={getVersionText()} status={getStatusText()} />
      </Box>
    </ThemeProvider>
  );
}
