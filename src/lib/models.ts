export type ModelId = 
  | 'gpt-5'
  | 'gpt-5-mini'
  | 'gpt-5-nano'
  | 'gpt-4.1'
  | 'gpt-4.1-mini'
  | 'gpt-4.1-nano'
  | 'o3'
  | 'o4-mini'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4o-realtime-preview';

export type Model = {
  id: ModelId;
  name: string;
  description: string;
  tier: 'latest' | 'standard' | 'mini' | 'nano' | 'reasoning';
};

export const MODELS: Model[] = [
  { 
    id: 'gpt-4o-mini', 
    name: 'GPT-4o Mini', 
    description: 'Fast and efficient',
    tier: 'mini'
  },
  { 
    id: 'gpt-4o', 
    name: 'GPT-4o', 
    description: 'Most capable multimodal',
    tier: 'standard'
  },
  { 
    id: 'gpt-5', 
    name: 'GPT-5', 
    description: 'Next-generation model',
    tier: 'latest'
  },
  { 
    id: 'gpt-5-mini', 
    name: 'GPT-5 Mini', 
    description: 'Efficient next-gen',
    tier: 'mini'
  },
  { 
    id: 'gpt-5-nano', 
    name: 'GPT-5 Nano', 
    description: 'Ultra-fast next-gen',
    tier: 'nano'
  },
  { 
    id: 'o3', 
    name: 'o3', 
    description: 'Advanced reasoning',
    tier: 'reasoning'
  },
  { 
    id: 'o4-mini', 
    name: 'o4 Mini', 
    description: 'Fast reasoning',
    tier: 'reasoning'
  },
  { 
    id: 'gpt-4.1', 
    name: 'GPT-4.1', 
    description: 'Enhanced capabilities',
    tier: 'standard'
  },
  { 
    id: 'gpt-4.1-mini', 
    name: 'GPT-4.1 Mini', 
    description: 'Efficient enhanced',
    tier: 'mini'
  },
  { 
    id: 'gpt-4.1-nano', 
    name: 'GPT-4.1 Nano', 
    description: 'Ultra-fast enhanced',
    tier: 'nano'
  },
];

export const DEFAULT_MODEL: ModelId = 'gpt-4o-mini';

export function getModelById(id: ModelId): Model | undefined {
  return MODELS.find(m => m.id === id);
}

