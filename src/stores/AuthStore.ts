import { makeAutoObservable } from "mobx";
import { User } from "@/types";
import { client } from "@/lib/api/client";

class AuthStore {
  user: User | null = null;
  isAuthenticated = false;
  isInitialized = false;

  constructor() {
    makeAutoObservable(this);
  }

  async initializeAuth() {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      try {
        const response = await client.get("/api/users/me/");
        this.setUser(response.data);
      } catch (error) {
        this.logout();
      }
    }
    this.isInitialized = true;
  }

  setUser(user: User | null) {
    this.user = user;
    this.isAuthenticated = !!user;
  }

  logout() {
    this.user = null;
    this.isAuthenticated = false;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
}

export const authStore = new AuthStore();
