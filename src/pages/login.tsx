import { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  useTheme,
  styled,
} from "@mui/material";
import { motion } from "framer-motion";
import { client } from "@/lib/api/client";
import { authStore } from "@/stores/AuthStore";
import "@fontsource/poppins/700.css";
import "@fontsource/noto-sans-kr/400.css";
import "@fontsource/noto-sans-kr/700.css";

// 스타일된 컴포넌트
const LoginContainer = styled(Container)(({ theme }) => ({
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: "100%",
  maxWidth: "400px",
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontFamily: "Poppins",
  fontWeight: 700,
  fontSize: "2rem",
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  marginBottom: theme.spacing(4),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    transition: "transform 0.2s ease-in-out",
    "&:hover": {
      transform: "translateY(-2px)",
    },
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  borderRadius: "12px",
  padding: "12px",
  fontSize: "1.1rem",
  fontWeight: 700,
  textTransform: "none",
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
  },
}));

interface LoginForm {
  username: string;
  password: string;
}

const schema = yup.object().shape({
  username: yup.string().required("사용자명을 입력해주세요"),
  password: yup.string().required("비밀번호를 입력해주세요"),
});

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const theme = useTheme();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await client.post("/api/token/", data);
      const { access, refresh } = response.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      const userResponse = await client.get("/api/users/me/");
      authStore.setUser(userResponse.data);

      router.push("/");
    } catch (error) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <LoginContainer maxWidth={false}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StyledPaper elevation={0}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <LogoText variant="h1">
             Govis Task Management
            </LogoText>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2, 
                  width: "100%",
                  borderRadius: "12px",
                  animation: "shake 0.5s ease-in-out",
                  "@keyframes shake": {
                    "0%, 100%": { transform: "translateX(0)" },
                    "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
                    "20%, 40%, 60%, 80%": { transform: "translateX(2px)" },
                  },
                }}
              >
                {error}
              </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
              <StyledTextField
                {...register("username")}
                margin="normal"
                fullWidth
                label="사용자명"
                error={!!errors.username}
                helperText={errors.username?.message}
                sx={{ mb: 2 }}
              />
              <StyledTextField
                {...register("password")}
                margin="normal"
                fullWidth
                label="비밀번호"
                type="password"
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{ mb: 3 }}
              />
              <LoginButton
                type="submit"
                fullWidth
                variant="contained"
                disableElevation
              >
                로그인
              </LoginButton>
            </form>
          </Box>
        </StyledPaper>
      </motion.div>
    </LoginContainer>
  );
}
