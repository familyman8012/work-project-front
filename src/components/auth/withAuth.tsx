/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react";
import { authStore } from "@/stores/AuthStore";
import { CircularProgress, Box } from "@mui/material";

export const withAuth = (WrappedComponent: React.ComponentType) => {
  return observer(function WithAuth(props: any) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        if (!authStore.isInitialized) {
          await authStore.initializeAuth();
        }

        if (!authStore.isAuthenticated) {
          router.replace("/login");
        }
        setIsLoading(false);
      };

      checkAuth();
    }, [router]);

    if (isLoading || !authStore.isInitialized) {
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

    if (!authStore.isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  });
};
