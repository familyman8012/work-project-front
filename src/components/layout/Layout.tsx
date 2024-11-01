import { Box } from "@mui/material";
import { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: "64px", // AppBar 높이만큼 여백
            minHeight: "100vh",
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
}
