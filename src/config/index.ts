const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  isDevelopment: process.env.NODE_ENV === "development",
};

export default config;
