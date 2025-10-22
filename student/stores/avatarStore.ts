import { create } from 'zustand';

interface AvatarState {
  avatarEmoji: string;
  setAvatar: (emoji: string) => void;
  getRandomEmoji: () => string;
}

export const useAvatarStore = create<AvatarState>((set) => ({
  avatarEmoji: `https://api.dicebear.com/9.x/open-peeps/png?seed=default`, // Default avatar

  setAvatar: (emoji: string) => {
    set({ avatarEmoji: emoji });
  },

  getRandomEmoji: () => {
    const seed = Math.random().toString(36).substring(7);
    return `https://api.dicebear.com/9.x/open-peeps/png?seed=${seed}`;
  },
}));

export const avatarStore = {
  setAvatar: (emoji: string) => {
    useAvatarStore.getState().setAvatar(emoji);
  },
  getRandomEmoji: () => {
    return useAvatarStore.getState().getRandomEmoji();
  },
  clearAvatar: () => {
    useAvatarStore.getState().setAvatar(`https://api.dicebear.com/9.x/open-peeps/png?seed=default`);
  },
};
