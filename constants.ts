
import { Contestant, RoundDefinition } from './types';

export const CONTESTANTS: Contestant[] = [
  {
    id: 'c1',
    name: '老崔',
    title: '硬核摇滚 / 音乐诗人',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop' // Placeholder for Image 2
  },
  {
    id: 'c2',
    name: '味全',
    title: '灵魂唱将 / 柔情男声',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=800&auto=format&fit=crop' // Placeholder for Image 3
  },
  {
    id: 'c3',
    name: 'Eric',
    title: '舞台先锋 / 全能偶像',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop' // Placeholder for Image 4
  }
];

export const ROUNDS: RoundDefinition[] = [
  {
    id: 1,
    title: '第一轮：自选曲目',
    description: '展示选手最真实的声音特色与自我风格（满分30分）',
    totalMax: 30,
    criteria: [
      { id: 'pitch', name: '音准与节奏', maxScore: 10 },
      { id: 'technique', name: '气息与唱功', maxScore: 8 },
      { id: 'emotion', name: '情感表达', maxScore: 6 },
      { id: 'stage', name: '舞台表现', maxScore: 4 },
      { id: 'completion', name: '歌曲完成度', maxScore: 2 },
    ]
  },
  {
    id: 2,
    title: '第二轮：抽选曲目',
    description: '考验选手的曲风适应能力与现场应变（满分35分）',
    totalMax: 35,
    criteria: [
      { id: 'pitch', name: '音准与节奏', maxScore: 12 },
      { id: 'technique', name: '气息与唱功', maxScore: 10 },
      { id: 'emotion', name: '情感表达', maxScore: 5 },
      { id: 'stage', name: '舞台表现', maxScore: 4 },
      { id: 'completion', name: '歌曲完成度', maxScore: 4 },
    ]
  },
  {
    id: 3,
    title: '第三轮：互选曲目',
    description: '终极对决，对手间的默契与博弈（满分35分）',
    totalMax: 35,
    criteria: [
      { id: 'pitch', name: '音准与节奏', maxScore: 12 },
      { id: 'technique', name: '气息与唱功', maxScore: 10 },
      { id: 'emotion', name: '情感表达', maxScore: 5 },
      { id: 'stage', name: '舞台表现', maxScore: 4 },
      { id: 'completion', name: '歌曲完成度', maxScore: 4 },
    ]
  }
];

export const MAIN_VISUAL = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop";
