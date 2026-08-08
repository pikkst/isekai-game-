import type { WorldArchetype, ReincarnationMethod, CheatSkill, Language } from './types';
import { getSkillImageUrl } from './imageGenerator';

export interface WorldPreset {
  id: WorldArchetype;
  title: Record<Language, string>;
  description: Record<Language, string>;
  bgGradient: string;
  badge: Record<Language, string>;
  iconName: string;
  defaultWorldName: Record<Language, string>;
}

export const WORLD_PRESETS: WorldPreset[] = [
  {
    id: 'high_fantasy',
    title: {
      et: 'Aetheria: Mõõk ja Maagia',
      en: 'Aetheria: Sword & Sorcery',
    },
    description: {
      et: 'Klassikaline fantaasiamaailm võimsate lohede, kuningriikide ja iidse Deemonikuninga usuga.',
      en: 'A classic high fantasy realm with elemental magic, royal guilds, and an awakening Demon King.',
    },
    bgGradient: 'from-amber-900/60 via-purple-950/70 to-slate-950',
    badge: { et: 'Klassikaline RPG', en: 'Classic RPG' },
    iconName: 'Sword',
    defaultWorldName: { et: 'Aetheria Kuningriik', en: 'Kingdom of Aetheria' },
  },
  {
    id: 'cyberpunk_cultivation',
    title: {
      et: 'Neo-Edo: Küber-Kultiveerimine',
      en: 'Neo-Edo: Cyber-Cultivation',
    },
    description: {
      et: 'Tulevikumaailm, kus neoonlinnade varjus kohtub digitaalne qi-energia ja küberneetilised surematad.',
      en: 'A futuristic metropolis where digital Qi energy merges with cybernetic martial arts cults.',
    },
    bgGradient: 'from-cyan-950/70 via-fuchsia-950/70 to-slate-950',
    badge: { et: 'Küber / Kultiveerimine', en: 'Cyber / Cultivation' },
    iconName: 'Cpu',
    defaultWorldName: { et: 'Neo-Edo Mega-Linn', en: 'Neo-Edo Megacity' },
  },
  {
    id: 'dark_demon_lord',
    title: {
      et: 'Grimm Realm: Deemonite Valdused',
      en: 'Grimm Realm: Demon Domain',
    },
    description: {
      et: 'Tume fantaasiamaailm, kus sa sündinud Deemonite armee kindraliks või troonipärijaks inimeste vastu.',
      en: 'A dark fantasy world where you reincarnate into the Demon Legion or a dark lord candidate.',
    },
    bgGradient: 'from-red-950/80 via-zinc-950/80 to-slate-950',
    badge: { et: 'Tume Fantaasia', en: 'Dark Fantasy' },
    iconName: 'Skull',
    defaultWorldName: { et: 'Varjumaa Imperium', en: 'Shadowlands Empire' },
  },
  {
    id: 'otome_academy',
    title: {
      et: 'Valoria: Akadeemia ja Kurikael',
      en: 'Valoria: Noble Academy',
    },
    description: {
      et: 'Aadlike ja võlukunsti akadeemia, kus igapäevane poliitika ja romantika varjavad iidset vandenõud.',
      en: 'An aristocratic magic academy full of royal intrigue, romantic routes, and villainess plotlines.',
    },
    bgGradient: 'from-pink-950/60 via-rose-950/70 to-slate-950',
    badge: { et: 'Otome / Akadeemia', en: 'Otome / Academy' },
    iconName: 'Crown',
    defaultWorldName: { et: 'Valoria Võluakadeemia', en: 'Valoria Royal Academy' },
  },
  {
    id: 'post_apocalyptic',
    title: {
      et: 'Kaelus: Apokalüpsise Mehha',
      en: 'Kaelus: Post-Apocalyptic Mecha',
    },
    description: {
      et: 'Varemetes maailm, kus maagilised titaanid ja iidne tehnoloogia peavad võitlust ellujäämise eest.',
      en: 'A ruined wasteland where ancient magic Titans and lost technology fight for survival.',
    },
    bgGradient: 'from-emerald-950/60 via-stone-950/80 to-slate-950',
    badge: { et: 'Mehha / Tulevik', en: 'Mecha / Apocalyptic' },
    iconName: 'ShieldAlert',
    defaultWorldName: { et: 'Kaelus Varemed', en: 'Wastelands of Kaelus' },
  },
  {
    id: 'custom',
    title: {
      et: 'Loo Oma Kohandatud Maailm',
      en: 'Custom World Prompt',
    },
    description: {
      et: 'Kirjelda oma unistuste isekai maailma (nt "Piraatide lendavad saared ja lohed").',
      en: 'Describe your custom dreamed Isekai world (e.g. "Floating sky pirate islands with dragon airships").',
    },
    bgGradient: 'from-indigo-950/70 via-purple-950/70 to-slate-950',
    badge: { et: 'Vaba Looming', en: 'Custom AI' },
    iconName: 'Sparkles',
    defaultWorldName: { et: 'Tundmatu Tähismaailm', en: 'Unmapped Cosmos' },
  },
];

export interface ReincarnationPreset {
  id: ReincarnationMethod;
  title: Record<Language, string>;
  description: Record<Language, string>;
  icon: string;
}

export const REINCARNATION_PRESETS: ReincarnationPreset[] = [
  {
    id: 'truck_kun',
    title: { et: 'Veok-Kun (Tavaline Veoki Õnnetus)', en: 'Truck-kun Accident' },
    description: {
      et: 'Päästsid tänaval kassi või koolilapse ja ärkasid uues maailmas.',
      en: 'Saved someone from an oncoming truck and woke up in a glowing magical circle.',
    },
    icon: 'Truck',
  },
  {
    id: 'goddess_summon',
    title: { et: 'Jumalanna Rituaalne Kutse', en: 'Divine Goddess Summon' },
    description: {
      et: 'Särav valgus murdis läbi toa ja Jumalanna palus sul maailm päästa.',
      en: 'Summoned directly to a grand temple by a holy Goddess to defeat chaos.',
    },
    icon: 'Sun',
  },
  {
    id: 'reborn_as_monster',
    title: { et: 'Sündisid Monsterina (Loom / Koletis)', en: 'Reborn as a Monster' },
    description: {
      et: 'Reinkarneerusid koopas väikese limakogumi, ämbliku või punase lohekupuna.',
      en: 'Reborn in a dark dungeon as a Slime, Spiderling, or Dragon Hatchling.',
    },
    icon: 'Flame',
  },
  {
    id: 'vrmmo_trapped',
    title: { et: 'VRMMO Mängu Lõksus', en: 'Trapped in VRMMO' },
    description: {
      et: 'Virtuaalreaalsuse server sulgus, kuid sina jäid oma tipp-tegelasena sisse.',
      en: 'The servers shut down, but your level 100 avatar stayed fully conscious.',
    },
    icon: 'Gamepad2',
  },
  {
    id: 'god_mistake',
    title: { et: 'Jumala Kogemata Viga & Vabandus', en: "God's Apology Mistake" },
    description: {
      et: 'Jumal lennutas kogemata välju ja annab vabanduseks hiiglasliku lisajõu.',
      en: 'God accidentally dropped a thunderbolt on you and granted supreme cheat powers as an apology.',
    },
    icon: 'Zap',
  },
];

export const CHEAT_SKILLS_PRESETS: CheatSkill[] = [
  {
    id: 'cheat_appraisal_steal',
    name: 'Universal Appraisal & Skill Steal',
    description: 'Inspect any entity status and absorb powers from defeated foes.',
    cooldown: 0,
    type: 'utility',
    imageUrl: getSkillImageUrl('Universal Appraisal & Skill Steal', 'utility'),
  },
  {
    id: 'cheat_instant_death',
    name: 'Instant Death Aura',
    description: 'Instantly obliterate foes or barriers at will, bypassing magical defenses.',
    cooldown: 2,
    type: 'offensive',
    imageUrl: getSkillImageUrl('Instant Death Aura', 'offensive'),
  },
  {
    id: 'cheat_time_rewind',
    name: 'Divine Time Rewind',
    description: 'Rewind time prior to fatal mistakes or deadly encounters.',
    cooldown: 3,
    type: 'divine',
    imageUrl: getSkillImageUrl('Divine Time Rewind', 'divine'),
  },
  {
    id: 'cheat_item_duplicator',
    name: 'Infinite Item Duplicator',
    description: 'Duplicate any item, gear, potion, or gold endlessly.',
    cooldown: 1,
    type: 'utility',
    imageUrl: getSkillImageUrl('Infinite Item Duplicator', 'utility'),
  },
  {
    id: 'cheat_goddess_blessing',
    name: 'Goddess Blessing (10x All Stats)',
    description: 'All attributes amplified 10x with guaranteed critical strikes.',
    cooldown: 0,
    type: 'passive',
    imageUrl: getSkillImageUrl('Goddess Blessing', 'passive'),
  },
  {
    id: 'cheat_shadow_monarch',
    name: 'Shadow Army Monarch',
    description: 'Extract and command shadow soldier legions from fallen enemies.',
    cooldown: 2,
    type: 'offensive',
    imageUrl: getSkillImageUrl('Shadow Army Monarch', 'offensive'),
  },
];
