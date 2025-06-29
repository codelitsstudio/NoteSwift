import { create } from 'zustand';

const PEOPLE_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '☺️',
  '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗',
  '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓',
  '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕',
  '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤'
];

interface AvatarState {
  avatarEmoji: string;
  setAvatar: (emoji: string) => void;
  getRandomEmoji: () => string;
}

export const useAvatarStore = create<AvatarState>((set: (arg0: { avatarEmoji: any; }) => void) => ({
  avatarEmoji: '🙂', // Default emoji
  
  setAvatar: (emoji: any) => {
    set({ avatarEmoji: emoji });
  },
  
  getRandomEmoji: () => {
    return PEOPLE_EMOJIS[Math.floor(Math.random() * PEOPLE_EMOJIS.length)];
  }
}));

// Standalone functions
export const avatarStore = {
  setAvatar: (emoji: string) => useAvatarStore.getState().setAvatar(emoji),
  getRandomEmoji: () => useAvatarStore.getState().getRandomEmoji(),
};