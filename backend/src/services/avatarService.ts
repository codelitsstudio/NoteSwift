// backend/src/services/avatarService.ts
export function generateRandomAvatar(): string {
  // Generate a random seed for DiceBear API
  const randomSeed = Math.random().toString(36).substring(2, 15);
  return `https://api.dicebear.com/9.x/open-peeps/png?seed=${randomSeed}`;
}