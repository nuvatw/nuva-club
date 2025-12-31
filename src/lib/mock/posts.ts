import { MOCK_USERS } from './users';

// 貼文分類定義
export const POST_CATEGORIES = {
  all: { label: '全部', emoji: '📋' },
  general: { label: '一般討論', emoji: '💬' },
  question: { label: '問題詢問', emoji: '❓' },
  showcase: { label: '成果分享', emoji: '🏆' },
  resource: { label: '資源分享', emoji: '📚' },
  challenge: { label: '挑戰貼文', emoji: '🎯' },
} as const;

export type PostCategory = keyof typeof POST_CATEGORIES;

export interface MockComment {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image';
  fireCount: number;
  hasFired?: boolean;
  createdAt: string;
}

export interface MockPost {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  userLevel: number;
  title: string;
  content: string;
  category: 'general' | 'showcase' | 'question' | 'resource' | 'challenge';
  challengeId?: string; // When category is 'challenge', this links to the challenge
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  fireCount: number;
  hasFired?: boolean;
  firedByUsers?: string[]; // Track who fired this post
  commentCount: number;
  comments: MockComment[];
  isPinned?: boolean;
  createdAt: string;
}

export const MOCK_POSTS: MockPost[] = [
  {
    id: 'post-1',
    userId: 'user-admin',
    userName: '管理員',
    userImage: MOCK_USERS[3].image,
    userLevel: 12,
    title: '歡迎來到 Nuva Club 社群！',
    content: '很高興你加入我們！這裡是分享你的 AI 學習旅程、提問問題、展示專案、與其他學習者交流的地方。\n\n幾個基本規則：\n- 互相尊重、彼此支持\n- 分享學習心得、幫助他人\n- 使用適當的分類發文\n- 一起開心探索 AI！\n\n歡迎在下方自我介紹！',
    category: 'general',
    fireCount: 89,
    hasFired: true,
    commentCount: 24,
    comments: [
      {
        id: 'comment-1',
        userId: 'user-xiaomei',
        userName: '小美',
        userImage: MOCK_USERS[0].image,
        content: '很開心來到這裡！期待和大家一起學習。',
        fireCount: 12,
        hasFired: false,
        createdAt: '2024-10-15T10:30:00Z',
      },
      {
        id: 'comment-2',
        userId: 'user-yating',
        userName: '雅婷',
        userImage: MOCK_USERS[2].image,
        content: '這個社群太棒了！第一週就學到好多東西。',
        fireCount: 8,
        hasFired: true,
        createdAt: '2024-10-16T14:00:00Z',
      },
    ],
    isPinned: true,
    createdAt: '2024-10-01T09:00:00Z',
  },
  {
    id: 'post-2',
    userId: 'user-ajie',
    userName: '阿傑',
    userImage: MOCK_USERS[1].image,
    userLevel: 8,
    title: '我的 AI 學習之旅：從新手到教練',
    content: '六個月前，我對 AI 的了解僅限於電影中看到的。今天，我已經是認證的努努教練，在幫助其他人學習！\n\n以下是幫助我成長的關鍵：\n\n1. **每天持續練習** - 即使只有 30 分鐘也會累積起來\n2. **實作專案** - 每月挑戰推動我走出舒適圈\n3. **勇於提問** - 這個社群非常支持\n4. **教導他人** - 解釋概念鞏固了我的理解\n\n給所有剛開始的人：你可以的！AI 革命才剛開始，每個人都有機會。',
    category: 'showcase',
    mediaUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
    mediaType: 'image',
    fireCount: 67,
    hasFired: true,
    commentCount: 15,
    comments: [
      {
        id: 'comment-3',
        userId: 'user-xiaofang',
        userName: '小芳',
        userImage: MOCK_USERS[4].image,
        content: '好激勵人心！我上週才剛開始，這樣的文章讓我很有動力。',
        fireCount: 5,
        hasFired: false,
        createdAt: '2024-12-10T16:00:00Z',
      },
    ],
    createdAt: '2024-12-10T11:00:00Z',
  },
  {
    id: 'post-3',
    userId: 'user-yating',
    userName: '雅婷',
    userImage: MOCK_USERS[2].image,
    userLevel: 5,
    title: '學習提示詞工程的最佳資源？',
    content: '我完成了這裡的提示詞工程課程，很喜歡！想找更多資源深入學習。有什麼推薦嗎？\n\n我特別想了解：\n- 複雜推理的進階技巧\n- 特定用例的提示詞優化\n- 實際案例研究\n\n先謝謝大家！',
    category: 'question',
    fireCount: 23,
    hasFired: false,
    commentCount: 8,
    comments: [
      {
        id: 'comment-4',
        userId: 'user-ajie',
        userName: '阿傑',
        userImage: MOCK_USERS[1].image,
        content: '看看 Anthropic 的提示詞工程指南，超棒的！OpenAI 的 cookbook 也有很多好例子。',
        fireCount: 15,
        hasFired: true,
        createdAt: '2024-12-18T10:00:00Z',
      },
      {
        id: 'comment-5',
        userId: 'user-xiaomei',
        userName: '小美',
        userImage: MOCK_USERS[0].image,
        content: '我覺得「Learn Prompting」網站也很有幫助。免費而且內容很完整！',
        fireCount: 9,
        hasFired: false,
        createdAt: '2024-12-18T11:30:00Z',
      },
    ],
    createdAt: '2024-12-18T08:00:00Z',
  },
  {
    id: 'post-4',
    userId: 'user-xiaomei',
    userName: '小美',
    userImage: MOCK_USERS[0].image,
    userLevel: 3,
    title: '免費 AI 工具大全',
    content: '我整理了在學習過程中發現的免費 AI 工具清單。希望對大家有幫助！\n\n**文字與寫作：**\n- Claude（免費版）\n- ChatGPT（免費版）\n- Notion AI（有限免費）\n\n**圖像生成：**\n- Leonardo AI（每日免費額度）\n- Playground AI（免費版）\n- Microsoft Designer\n\n**程式碼：**\n- GitHub Copilot（學生免費）\n- Codeium（免費）\n- Tabnine（免費版）\n\n**音訊：**\n- ElevenLabs（免費版）\n- LOVO AI（有限免費）\n\n發現更多會持續更新！歡迎在留言分享你的最愛。',
    category: 'resource',
    fireCount: 134,
    hasFired: true,
    commentCount: 31,
    comments: [
      {
        id: 'comment-6',
        userId: 'user-yating',
        userName: '雅婷',
        userImage: MOCK_USERS[2].image,
        content: '這太讚了！收藏起來。你應該加上 Canva 的 AI 功能！',
        fireCount: 8,
        hasFired: true,
        createdAt: '2024-12-20T09:00:00Z',
      },
    ],
    createdAt: '2024-12-19T14:00:00Z',
  },
  {
    id: 'post-5',
    userId: 'user-xiaofang',
    userName: '小芳',
    userImage: MOCK_USERS[4].image,
    userLevel: 2,
    title: '第一個 AI 專案 - 歡迎回饋！',
    content: '大家好！剛完成我的第一個 AI 專案 - 為我的小店做的簡單聊天機器人。它可以回答顧客關於我們烘焙坊的常見問題。\n\n雖然很基本但我很驕傲！用了「建構 AI 應用」入門模組學到的技能。\n\n歡迎任何回饋或改進建議！',
    category: 'showcase',
    mediaUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop',
    mediaType: 'image',
    fireCount: 45,
    hasFired: false,
    commentCount: 12,
    comments: [
      {
        id: 'comment-7',
        userId: 'user-ajie',
        userName: '阿傑',
        userImage: MOCK_USERS[1].image,
        content: '很棒的第一個專案！介面看起來很乾淨。建議：可以加一個「轉接真人客服」的備用選項。',
        fireCount: 6,
        hasFired: true,
        createdAt: '2024-12-22T11:00:00Z',
      },
    ],
    createdAt: '2024-12-22T09:00:00Z',
  },
  // Challenge submission posts
  {
    id: 'post-challenge-1',
    userId: 'user-yating',
    userName: '雅婷',
    userImage: MOCK_USERS[2].image,
    userLevel: 5,
    title: '冬季仙境 AI 賀卡',
    content: '用 Midjourney 創作了這張冬季仙境賀卡！AI 完美捕捉了溫馨壁爐的氛圍。祝大家佳節愉快！',
    category: 'challenge',
    challengeId: 'challenge-dec-2024',
    mediaUrl: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=600&h=400&fit=crop',
    mediaType: 'image',
    fireCount: 45,
    hasFired: false,
    firedByUsers: ['user-ajie', 'user-xiaomei', 'user-xiaofang'],
    commentCount: 8,
    comments: [],
    createdAt: '2024-12-15T14:30:00Z',
  },
  {
    id: 'post-challenge-2',
    userId: 'user-xiaofang',
    userName: '小芳',
    userImage: MOCK_USERS[4].image,
    userLevel: 2,
    title: '機器人聖誕老人',
    content: '我的第一次 AI 藝術嘗試！用 DALL-E 創作了這個有友善機器人聖誕老人的雪景。雖然還是新手，但很開心能參與挑戰！',
    category: 'challenge',
    challengeId: 'challenge-dec-2024',
    mediaUrl: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&h=400&fit=crop',
    mediaType: 'image',
    fireCount: 28,
    hasFired: false,
    firedByUsers: ['user-yating', 'user-ajie'],
    commentCount: 5,
    comments: [],
    createdAt: '2024-12-16T09:15:00Z',
  },
  {
    id: 'post-challenge-3',
    userId: 'user-ajie',
    userName: '阿傑',
    userImage: MOCK_USERS[1].image,
    userLevel: 8,
    title: 'AI 詩意賀卡',
    content: '結合多種 AI 工具 - 用 Claude 寫詩，Midjourney 做視覺設計。希望這張賀卡能傳遞溫暖！祝大家佳節愉快！',
    category: 'challenge',
    challengeId: 'challenge-dec-2024',
    mediaUrl: 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=600&h=400&fit=crop',
    mediaType: 'image',
    fireCount: 62,
    hasFired: true,
    firedByUsers: ['user-yating', 'user-xiaomei', 'user-xiaofang', 'user-admin'],
    commentCount: 12,
    comments: [],
    createdAt: '2024-12-14T18:45:00Z',
  },
  // 新增更多中文貼文
  {
    id: 'post-6',
    userId: 'user-xiaomei',
    userName: '小美',
    userImage: MOCK_USERS[0].image,
    userLevel: 3,
    title: 'Claude 和 ChatGPT 哪個比較好用？',
    content: '最近在猶豫要不要訂閱付費版，想問問大家的經驗。\n\n我主要的使用情境是：\n- 寫工作報告和文案\n- 整理會議紀錄\n- 偶爾問一些程式問題\n\n有人兩個都用過嗎？差異大嗎？',
    category: 'question',
    fireCount: 38,
    hasFired: false,
    commentCount: 6,
    comments: [
      {
        id: 'comment-8',
        userId: 'user-ajie',
        userName: '阿傑',
        userImage: MOCK_USERS[1].image,
        content: '兩個我都有訂閱！簡單說：Claude 的回答比較有邏輯、擅長長文；ChatGPT 生態系比較完整，有 GPTs 可以用。寫報告我個人偏好 Claude。',
        fireCount: 18,
        hasFired: true,
        createdAt: '2024-12-23T10:00:00Z',
      },
      {
        id: 'comment-9',
        userId: 'user-yating',
        userName: '雅婷',
        userImage: MOCK_USERS[2].image,
        content: '我覺得可以先用免費版都試試看！我是覺得 Claude 寫中文比較自然，但 ChatGPT 的插件功能很方便。',
        fireCount: 12,
        hasFired: false,
        createdAt: '2024-12-23T11:30:00Z',
      },
      {
        id: 'comment-10',
        userId: 'user-xiaofang',
        userName: '小芳',
        userImage: MOCK_USERS[4].image,
        content: '新手分享～我是先從 ChatGPT 免費版開始的，等熟悉之後再考慮付費！',
        fireCount: 5,
        hasFired: false,
        createdAt: '2024-12-23T14:00:00Z',
      },
    ],
    createdAt: '2024-12-23T08:00:00Z',
  },
  {
    id: 'post-7',
    userId: 'user-yating',
    userName: '雅婷',
    userImage: MOCK_USERS[2].image,
    userLevel: 5,
    title: '用 AI 做了一個自動化工作流程，超省時！',
    content: '分享一下我最近做的自動化流程～\n\n**情境：**每週要整理團隊的週報\n\n**以前：**手動收集 → 整理 → 排版 → 校對，大概要 2 小時\n\n**現在：**\n1. 用 Zapier 自動收集大家填的表單\n2. 丟給 Claude 整理成週報格式\n3. 自動發送到群組\n\n整個流程不到 10 分鐘！省下來的時間可以做更有價值的事。\n\n有興趣的話我可以再分享詳細設定～',
    category: 'showcase',
    fireCount: 78,
    hasFired: true,
    commentCount: 9,
    comments: [
      {
        id: 'comment-11',
        userId: 'user-xiaomei',
        userName: '小美',
        userImage: MOCK_USERS[0].image,
        content: '太強了！可以教我怎麼設定嗎？我們公司也有類似需求～',
        fireCount: 8,
        hasFired: true,
        createdAt: '2024-12-21T15:00:00Z',
      },
      {
        id: 'comment-12',
        userId: 'user-ajie',
        userName: '阿傑',
        userImage: MOCK_USERS[1].image,
        content: '很棒的應用！這就是我們常說的 AI 不是取代人，而是讓人更有效率。',
        fireCount: 14,
        hasFired: true,
        createdAt: '2024-12-21T16:30:00Z',
      },
    ],
    createdAt: '2024-12-21T12:00:00Z',
  },
  {
    id: 'post-8',
    userId: 'user-xiaofang',
    userName: '小芳',
    userImage: MOCK_USERS[4].image,
    userLevel: 2,
    title: '請問這樣的提示詞哪裡可以改進？',
    content: '我在嘗試讓 AI 幫我寫產品描述，但效果不太好。\n\n我的提示詞是：\n「幫我寫一個產品描述，產品是手工餅乾」\n\n得到的結果很普通，沒有特色。請問各位大大有什麼建議嗎？',
    category: 'question',
    fireCount: 25,
    hasFired: false,
    commentCount: 5,
    comments: [
      {
        id: 'comment-13',
        userId: 'user-ajie',
        userName: '阿傑',
        userImage: MOCK_USERS[1].image,
        content: '你的提示詞太簡短了！建議加入：\n1. 目標客群是誰\n2. 產品的獨特賣點\n3. 希望的語調（溫馨？專業？）\n4. 字數限制\n5. 可以給一個你喜歡的範例',
        fireCount: 20,
        hasFired: true,
        createdAt: '2024-12-24T09:30:00Z',
      },
      {
        id: 'comment-14',
        userId: 'user-yating',
        userName: '雅婷',
        userImage: MOCK_USERS[2].image,
        content: '補充阿傑說的，你可以試試這樣寫：「你是一位專業的文案寫手。請為我的手工餅乾品牌撰寫產品描述。目標客群是 25-35 歲重視健康的上班族。產品特色是使用有機麵粉、無添加防腐劑。語調要溫暖親切，字數約 100 字。」',
        fireCount: 15,
        hasFired: false,
        createdAt: '2024-12-24T10:15:00Z',
      },
    ],
    createdAt: '2024-12-24T08:00:00Z',
  },
  {
    id: 'post-9',
    userId: 'user-admin',
    userName: '管理員',
    userImage: MOCK_USERS[3].image,
    userLevel: 12,
    title: '一月挑戰預告：AI 新年目標',
    content: '各位學員大家好！\n\n一月挑戰即將開始，主題是「AI 新年目標」！\n\n這次挑戰要請大家運用 AI 工具來制定和視覺化你的 2025 年目標。可以是：\n- 用 AI 生成的願景板\n- AI 輔助制定的 OKR\n- 創意的目標追蹤方式\n\n歡迎發揮創意，期待看到大家的作品！\n\n挑戰期間：1/1 - 2/14（45天）\n\n準備好迎接新的一年了嗎？',
    category: 'challenge',
    fireCount: 56,
    hasFired: true,
    commentCount: 8,
    comments: [
      {
        id: 'comment-15',
        userId: 'user-xiaomei',
        userName: '小美',
        userImage: MOCK_USERS[0].image,
        content: '好期待！正好想用 AI 好好規劃一下明年的學習目標。',
        fireCount: 6,
        hasFired: false,
        createdAt: '2024-12-25T10:00:00Z',
      },
    ],
    createdAt: '2024-12-25T09:00:00Z',
  },
];

export const getPinnedPosts = () => MOCK_POSTS.filter(p => p.isPinned);

export const getPostsByCategory = (category: string) =>
  category === 'all' ? MOCK_POSTS : MOCK_POSTS.filter(p => p.category === category);

export const getPostById = (id: string) => MOCK_POSTS.find(p => p.id === id);

export const getPostsByUser = (userId: string) => MOCK_POSTS.filter(p => p.userId === userId);
