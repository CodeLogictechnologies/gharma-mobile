import { createMMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware/persist";

export const storage = createMMKV({
  id: "gharma-v1",
  encryptionKey: "GHARMA_APP",
});

export const zustandStorage: StateStorage = {
  setItem: (name: string, value: string) => {
    return storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    return storage.remove(name);
  },
};

