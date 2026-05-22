import { router } from "expo-router";

export const goToLogin = () => {
  router.replace("/login");
};

export const goToHome = () => {
  router.replace("/(app)/(tabs)/(home)");
};
