import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useSettingsStore } from "./settings.store";
import { useGamificationStore } from "@/components/sidebar.store";
import type { SettingsTab, ThemeColor } from "./settings.type";

export const useSettings = () => {
  const settingsStore = useSettingsStore();
  const gamificationStore = useGamificationStore();
  const { settings } = storeToRefs(settingsStore);
  const { profile } = storeToRefs(gamificationStore);

  const activeTab = ref<SettingsTab>("profile");
  const showResetConfirm = ref(false);
  const displayNameInput = ref(profile.value.displayName);
  const isSaved = ref(false);

  const tabs = [
    { key: "profile", label: "Profile", icon: "pi-user" },
    { key: "appearance", label: "Appearance", icon: "pi-palette" },
    { key: "notifications", label: "Notifications", icon: "pi-bell" },
    { key: "data", label: "Data", icon: "pi-database" },
  ];

  const themeOptions: { label: string; value: ThemeColor; color: string }[] = [
    { label: "Terracotta", value: "terracotta", color: "#c2622a" },
    { label: "Ocean", value: "ocean", color: "#0077b6" },
    { label: "Forest", value: "forest", color: "#2d7a4f" },
    { label: "Lavender", value: "lavender", color: "#7c5cbf" },
    { label: "Rose", value: "rose", color: "#be3455" },
  ];

  const saveProfile = () => {
    if (!displayNameInput.value.trim()) return;
    settingsStore.updateDisplayName(displayNameInput.value.trim());
    isSaved.value = true;
    setTimeout(() => (isSaved.value = false), 2000);
  };

  const confirmReset = () => {
    settingsStore.resetData();
    showResetConfirm.value = false;
  };

  return {
    activeTab,
    showResetConfirm,
    displayNameInput,
    isSaved,
    tabs,
    themeOptions,
    settings,
    profile,
    saveProfile,
    confirmReset,
    setDarkMode: settingsStore.setDarkMode,
    setThemeColor: settingsStore.setThemeColor,
    updateNotifications: settingsStore.updateNotifications,
  };
};
