import { Box } from "@mui/material";
import { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Box sx={{ backgroundColor: "background.default" }}>
      <Header />
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 4,
            minHeight: "calc(100vh - 64px)",
            transition: "all 0.3s",
          }}
        >
          <Box
            sx={{
              maxWidth: "1400px",
              margin: "0 auto",
              animation: "fadeIn 0.5s ease-in-out",
              "@keyframes fadeIn": {
                "0%": {
                  opacity: 0,
                  transform: "translateY(10px)",
                },
                "100%": {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
