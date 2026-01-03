import { toast } from "sonner";

/**
 * 🔊 Utility to play notification sounds
 * @param {'success' | 'error' | 'info' | 'warning' | 'delete'} type
 */
const playSound = (type = "info") => {
  let soundPath = "/sounds/notify.wav"; // default sound

  switch (type) {
    case "success":
      soundPath = "/sounds/sucess.wav";
      break;
    case "error":
      soundPath = "/sounds/error.m4a";
      break;
    case "warning":
      soundPath = "/sounds/warning.wav";
      break;
    case "delete":
        soundPath = "/sounds/delete.m4a";
        break;
    default:
      soundPath = "/sounds/notify.wav";
  }

  const audio = new Audio(soundPath);
  audio.volume = 0.6; // adjust volume if needed
  audio.play().catch((err) => {
    console.warn("Audio blocked by browser:", err);
  });
};

/**
 * 🧩 Toast Notification Utility
 * Use: notify.success("Saved!"), notify.error("Failed!"), etc.
 */
export const notify = {
  success: (message) => {
    playSound("success");
    toast.success(message);
  },
  error: (message) => {
    playSound("error");
    toast.error(message);
  },
  warning: (message) => {
    playSound("warning");
    toast.warning(message);
  },
  delete: (message) => {
    playSound("delete");
    toast.warning(message, {
        style: {
          backgroundColor: "#ffdddd",
          color: "#a10000",
          fontWeight: "bold",
        },
        icon: "🗑️",
      });
  },
  info: (message) => {
    playSound("info");
    toast(message);
  },
};
