import "@/styles/globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import type { AppProps } from "next/app";
import { theme } from "@/styles/theme";
import { queryClient } from "@/lib/queryClient";
import { useEffect } from "react";
import { observer } from "mobx-react";
import { authStore } from "@/stores/AuthStore";
import { Box, CircularProgress } from "@mui/material";

const App = observer(({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    const init = async () => {
      if (!authStore.isInitialized) {
        await authStore.initializeAuth();
      }
    };
    init();
  }, []);

  if (!authStore.isInitialized) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
});

export default App;
