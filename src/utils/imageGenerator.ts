// Helper to compute a deterministic hash seed from a string
export function getStringSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) || 12345;
}

// Generate consistent character portrait avatar
export function getCharacterAvatarUrl(characterName: string, archetype: string, customPrompt?: string): string {
  const seed = getStringSeed(characterName + "_" + archetype + "_" + (customPrompt || ""));
  const prompt = encodeURIComponent(
    `Anime isekai main hero character portrait, ${characterName}, ${archetype.replace('_', ' ')} fantasy style, handsome energetic anime protagonist, detailed face portrait, glowing aura, masterpiece`
  );
  return `https://image.pollinations.ai/prompt/${prompt}?width=512&height=512&seed=${seed}&nologo=true`;
}

// Generate consistent skill artwork
export function getSkillImageUrl(skillName: string, skillType?: string): string {
  const seed = getStringSeed("skill_" + skillName);
  const prompt = encodeURIComponent(
    `Anime fantasy magic skill icon art, ${skillName}, ${skillType || 'magic power'}, glowing particle aura, vibrant spell energy, masterpiece`
  );
  return `https://image.pollinations.ai/prompt/${prompt}?width=400&height=400&seed=${seed}&nologo=true`;
}

// Generate consistent companion portrait
export function getCompanionAvatarUrl(companionName: string, role: string): string {
  const seed = getStringSeed("companion_" + companionName + "_" + role);
  const prompt = encodeURIComponent(
    `Anime fantasy companion character portrait, ${companionName}, ${role}, beautiful anime artwork, detailed visual novel face portrait`
  );
  return `https://image.pollinations.ai/prompt/${prompt}?width=400&height=400&seed=${seed}&nologo=true`;
}

// Generate consistent item image
export function getItemImageUrl(itemName: string, type?: string): string {
  const seed = getStringSeed("item_" + itemName);
  const prompt = encodeURIComponent(
    `Anime fantasy RPG item icon, ${itemName}, ${type || 'equipment treasure'}, detailed fantasy inventory item, glowing magic background`
  );
  return `https://image.pollinations.ai/prompt/${prompt}?width=400&height=400&seed=${seed}&nologo=true`;
}

// Generate story scene illustration
export function getSceneImageUrl(location: string, promptText?: string): string {
  const seed = getStringSeed("scene_" + location + "_" + (promptText || ""));
  const prompt = encodeURIComponent(
    `Anime fantasy background landscape scene, ${location}, ${promptText || 'epic scenery'}, cinematic anime visual novel background, beautiful atmosphere`
  );
  return `https://image.pollinations.ai/prompt/${prompt}?width=800&height=450&seed=${seed}&nologo=true`;
}
