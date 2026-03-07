import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // 记录错误到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误页面
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            bgcolor: '#121212',
            p: 3
          }}
        >
          <Paper
            sx={{
              p: 4,
              maxWidth: 600,
              width: '100%',
              bgcolor: '#1E1E1E'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2
              }}
            >
              <ErrorIcon
                sx={{
                  fontSize: 48,
                  color: 'error.main',
                  mr: 2
                }}
              />
              <Typography variant="h4" color="error">
                出错了
              </Typography>
            </Box>

            <Typography variant="body1" sx={{ mb: 2 }}>
              应用程序遇到了一个错误。您可以尝试重新加载页面，或联系支持团队。
            </Typography>

            {this.state.error && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  错误信息：
                </Typography>
                <Paper
                  component="pre"
                  sx={{
                    p: 2,
                    bgcolor: '#000000',
                    color: '#ff6b6b',
                    fontSize: '0.875rem',
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}
                >
                  {this.state.error.toString()}
                </Paper>
              </Box>
            )}

            {this.state.errorInfo && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  堆栈跟踪：
                </Typography>
                <Paper
                  component="pre"
                  sx={{
                    p: 2,
                    bgcolor: '#000000',
                    color: '#888888',
                    fontSize: '0.75rem',
                    overflow: 'auto',
                    maxHeight: '300px'
                  }}
                >
                  {this.state.errorInfo.componentStack}
                </Paper>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleReset}
                sx={{ flex: 1 }}
              >
                重试
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={this.handleReload}
                sx={{ flex: 1 }}
              >
                重新加载
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
