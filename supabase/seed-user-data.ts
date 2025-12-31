/**
 * Seed comprehensive user activity data
 * Simulates 6+ months of platform usage for all demo users
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  level: number;
}

async function seedUserData() {
  console.log('Fetching users...');

  // Get all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');

  if (profilesError || !profiles) {
    console.error('Failed to fetch profiles:', profilesError);
    return;
  }

  console.log(`Found ${profiles.length} users\n`);

  const vavas = profiles.filter(p => p.role === 'vava');
  const nunus = profiles.filter(p => p.role === 'nunu');
  const guardians = profiles.filter(p => p.role === 'guardian');

  // Get courses and lessons
  const { data: courses } = await supabase.from('courses').select('*');
  const { data: lessons } = await supabase.from('lessons').select('*');
  const { data: challenges } = await supabase.from('challenges').select('*');
  const { data: events } = await supabase.from('events').select('*');

  if (!courses || !lessons) {
    console.error('No courses or lessons found');
    return;
  }

  // ============================================
  // 1. COACH-STUDENT ASSIGNMENTS
  // ============================================
  console.log('Creating coach-student assignments...');

  const coachStudents = [
    // 陳教練 (nunu1) manages 小明, 小華
    { coach_id: nunus[0]?.id, student_id: vavas[0]?.id, feedback_count: 15 },
    { coach_id: nunus[0]?.id, student_id: vavas[1]?.id, feedback_count: 12 },
    // 林教練 (nunu2) manages 小美, 小強
    { coach_id: nunus[1]?.id, student_id: vavas[2]?.id, feedback_count: 8 },
    { coach_id: nunus[1]?.id, student_id: vavas[3]?.id, feedback_count: 20 },
    // 王教練 (nunu3) manages 小芳
    { coach_id: nunus[2]?.id, student_id: vavas[4]?.id, feedback_count: 5 },
  ].filter(cs => cs.coach_id && cs.student_id);

  for (const cs of coachStudents) {
    await supabase.from('coach_students').upsert(cs, { onConflict: 'coach_id,student_id' });
  }
  console.log(`  Created ${coachStudents.length} coach-student assignments\n`);

  // ============================================
  // 2. USER COURSE PROGRESS
  // ============================================
  console.log('Creating course progress...');

  const courseProgress: any[] = [];

  for (const user of profiles) {
    // Each user enrolled in courses up to their level
    const userCourses = courses.filter(c => c.level <= user.level);

    for (const course of userCourses) {
      const isCompleted = course.level < user.level;
      const courseLessons = lessons.filter(l => l.course_id === course.id);
      const currentLesson = isCompleted ? null : courseLessons[Math.floor(Math.random() * courseLessons.length)]?.id;

      courseProgress.push({
        user_id: user.id,
        course_id: course.id,
        is_enrolled: true,
        enrolled_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(), // Random date in last 6 months
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString() : null,
        current_lesson_id: currentLesson,
      });
    }
  }

  // Batch insert
  for (let i = 0; i < courseProgress.length; i += 50) {
    const batch = courseProgress.slice(i, i + 50);
    await supabase.from('user_course_progress').upsert(batch, { onConflict: 'user_id,course_id' });
  }
  console.log(`  Created ${courseProgress.length} course progress records\n`);

  // ============================================
  // 3. USER LESSON PROGRESS
  // ============================================
  console.log('Creating lesson progress...');

  const lessonProgress: any[] = [];

  for (const user of profiles) {
    const userCourses = courses.filter(c => c.level <= user.level);

    for (const course of userCourses) {
      const courseLessons = lessons.filter(l => l.course_id === course.id);
      const isCourseDone = course.level < user.level;

      for (let i = 0; i < courseLessons.length; i++) {
        const lesson = courseLessons[i];
        let progress: number;
        let isCompleted: boolean;

        if (isCourseDone) {
          // Completed course - all lessons done
          progress = 100;
          isCompleted = true;
        } else if (course.level === user.level) {
          // Current level - partial progress
          if (i < courseLessons.length / 2) {
            progress = 100;
            isCompleted = true;
          } else if (i === Math.floor(courseLessons.length / 2)) {
            progress = Math.floor(Math.random() * 70) + 20; // 20-90%
            isCompleted = false;
          } else {
            progress = 0;
            isCompleted = false;
          }
        } else {
          progress = 0;
          isCompleted = false;
        }

        if (progress > 0) {
          lessonProgress.push({
            user_id: user.id,
            lesson_id: lesson.id,
            course_id: course.id,
            progress,
            watch_time: Math.floor(lesson.video_duration * (progress / 100)),
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString() : null,
            last_watched_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
      }
    }
  }

  for (let i = 0; i < lessonProgress.length; i += 50) {
    const batch = lessonProgress.slice(i, i + 50);
    await supabase.from('user_lesson_progress').upsert(batch, { onConflict: 'user_id,lesson_id' });
  }
  console.log(`  Created ${lessonProgress.length} lesson progress records\n`);

  // ============================================
  // 4. CHALLENGE PARTICIPATIONS
  // ============================================
  console.log('Creating challenge participations...');

  const challengeParticipations: any[] = [];

  if (challenges) {
    for (const user of vavas) {
      // Each vava joins 1-2 challenges randomly
      const numChallenges = Math.floor(Math.random() * 2) + 1;
      const userChallenges = challenges.slice(0, numChallenges);

      for (const challenge of userChallenges) {
        const statuses = ['joined', 'submitted', 'completed'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        challengeParticipations.push({
          user_id: user.id,
          challenge_id: challenge.id,
          status,
          submission_url: status !== 'joined' ? `https://github.com/${user.name}/challenge-${challenge.id}` : null,
          submitted_at: status !== 'joined' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        });
      }
    }

    for (const cp of challengeParticipations) {
      await supabase.from('challenge_participations').upsert(cp, { onConflict: 'user_id,challenge_id' });
    }
  }
  console.log(`  Created ${challengeParticipations.length} challenge participations\n`);

  // ============================================
  // 5. EVENT RSVPS
  // ============================================
  console.log('Creating event RSVPs...');

  const eventRsvps: any[] = [];

  if (events) {
    for (const user of profiles) {
      // Each user RSVPs to 1-3 events
      const numEvents = Math.floor(Math.random() * 3) + 1;
      const shuffledEvents = [...events].sort(() => Math.random() - 0.5);
      const userEvents = shuffledEvents.slice(0, numEvents);

      for (const event of userEvents) {
        eventRsvps.push({
          user_id: user.id,
          event_id: event.id,
        });
      }
    }

    for (const rsvp of eventRsvps) {
      await supabase.from('event_rsvps').upsert(rsvp, { onConflict: 'user_id,event_id' });
    }
  }
  console.log(`  Created ${eventRsvps.length} event RSVPs\n`);

  // ============================================
  // 6. COMMUNITY POSTS
  // ============================================
  console.log('Creating community posts...');

  const posts = [
    // Questions
    { id: 'post-1', user_id: vavas[0]?.id, type: 'question', title: 'React useEffect 依賴陣列問題', content: '請問為什麼我的 useEffect 會無限執行？我已經加了依賴陣列但還是一直跑。程式碼如下...', likes_count: 12, comments_count: 5 },
    { id: 'post-2', user_id: vavas[1]?.id, type: 'question', title: 'TypeScript 泛型怎麼用？', content: '最近在學 TypeScript，泛型的部分看不太懂，有人可以用簡單的例子說明嗎？', likes_count: 8, comments_count: 3 },
    { id: 'post-3', user_id: vavas[2]?.id, type: 'question', title: 'CSS Flexbox vs Grid', content: '什麼時候應該用 Flexbox，什麼時候用 Grid？兩者有什麼差別？', likes_count: 15, comments_count: 7 },
    { id: 'post-4', user_id: vavas[3]?.id, type: 'question', title: 'Next.js 13 App Router 問題', content: '從 Pages Router 轉到 App Router 遇到很多問題，有推薦的學習資源嗎？', likes_count: 20, comments_count: 8 },

    // Shares
    { id: 'post-5', user_id: vavas[0]?.id, type: 'share', title: '終於完成第一個 React 專案！', content: '花了兩週終於把 Todo App 做完了！雖然很簡單但超有成就感，感謝平台的課程！', likes_count: 45, comments_count: 12 },
    { id: 'post-6', user_id: vavas[1]?.id, type: 'share', title: '分享我的學習筆記整理法', content: '我習慣用 Notion 整理學習筆記，每個課程一個頁面，搭配程式碼片段和自己的理解...', likes_count: 32, comments_count: 6 },
    { id: 'post-7', user_id: nunus[0]?.id, type: 'share', title: '給初學者的建議', content: '作為教練想分享幾個學習程式的心得：1. 不要害怕錯誤 2. 多動手練習 3. 加入社群...', likes_count: 88, comments_count: 15 },
    { id: 'post-8', user_id: vavas[3]?.id, type: 'share', title: '成功轉職前端工程師！', content: '學習了 8 個月，終於拿到第一份前端工作 offer！感謝 Nuva 平台和各位教練的幫助！', likes_count: 156, comments_count: 28 },

    // Challenge posts
    { id: 'post-9', user_id: vavas[0]?.id, type: 'challenge', title: '30天挑戰 Day 15 打卡', content: '今天學了 React Hooks，useState 和 useEffect 終於搞懂了！繼續加油！', challenge_id: 'challenge-1', likes_count: 18, comments_count: 4 },
    { id: 'post-10', user_id: vavas[1]?.id, type: 'challenge', title: '30天挑戰完成！', content: '終於完成 30 天連續學習挑戰！這一個月學到超多東西，謝謝大家的鼓勵！', challenge_id: 'challenge-1', likes_count: 67, comments_count: 11 },
    { id: 'post-11', user_id: vavas[2]?.id, type: 'challenge', title: '作品集挑戰進度分享', content: '我的作品集網站初版完成了！用了 Next.js + Tailwind，歡迎大家給建議～', challenge_id: 'challenge-2', likes_count: 34, comments_count: 9 },
    { id: 'post-12', user_id: vavas[4]?.id, type: 'challenge', title: '新手第一次參加挑戰', content: '剛加入平台一週，決定挑戰 30 天學習計畫，希望可以堅持下去！', challenge_id: 'challenge-1', likes_count: 25, comments_count: 8 },
  ].filter(p => p.user_id);

  for (const post of posts) {
    await supabase.from('posts').upsert(post);
  }
  console.log(`  Created ${posts.length} posts\n`);

  // ============================================
  // 7. COMMENTS
  // ============================================
  console.log('Creating comments...');

  const comments = [
    // Comments on post-1 (React useEffect question)
    { id: 'comment-1', post_id: 'post-1', user_id: nunus[0]?.id, content: '這通常是因為依賴陣列中的物件每次 render 都是新的參考。試試用 useMemo 或把物件移到 useEffect 外面。', likes_count: 8 },
    { id: 'comment-2', post_id: 'post-1', user_id: vavas[1]?.id, content: '我之前也遇過一樣的問題！後來發現是 function 要用 useCallback 包起來。', likes_count: 5 },
    { id: 'comment-3', post_id: 'post-1', user_id: nunus[1]?.id, content: '可以貼一下你的程式碼嗎？這樣比較好幫你看問題在哪裡。', likes_count: 3 },

    // Comments on post-5 (React project completion)
    { id: 'comment-4', post_id: 'post-5', user_id: nunus[0]?.id, content: '恭喜！第一個專案完成是很重要的里程碑，繼續加油！💪', likes_count: 12 },
    { id: 'comment-5', post_id: 'post-5', user_id: vavas[1]?.id, content: '太棒了！我也剛完成，可以互相交流一下嗎？', likes_count: 4 },
    { id: 'comment-6', post_id: 'post-5', user_id: vavas[3]?.id, content: '有 GitHub repo 可以分享嗎？想看看你是怎麼實作的！', likes_count: 6 },

    // Comments on post-7 (Coach advice)
    { id: 'comment-7', post_id: 'post-7', user_id: vavas[0]?.id, content: '感謝教練分享！「不要害怕錯誤」這點對我幫助很大。', likes_count: 15 },
    { id: 'comment-8', post_id: 'post-7', user_id: vavas[2]?.id, content: '請問教練有推薦的練習網站嗎？', likes_count: 8 },
    { id: 'comment-9', post_id: 'post-7', user_id: nunus[0]?.id, content: '推薦 LeetCode 練習演算法，Frontend Mentor 練習切版！', likes_count: 20 },

    // Comments on post-8 (Job success)
    { id: 'comment-10', post_id: 'post-8', user_id: nunus[0]?.id, content: '恭喜！！！看到學員成功轉職真的超開心！🎉', likes_count: 25 },
    { id: 'comment-11', post_id: 'post-8', user_id: nunus[1]?.id, content: '太厲害了！8 個月就轉職成功，你很努力！', likes_count: 18 },
    { id: 'comment-12', post_id: 'post-8', user_id: vavas[0]?.id, content: '好勵志！請問可以分享一下你的學習計畫嗎？', likes_count: 12 },
    { id: 'comment-13', post_id: 'post-8', user_id: vavas[2]?.id, content: '恭喜恭喜！希望我也可以跟你一樣！', likes_count: 8 },
    { id: 'comment-14', post_id: 'post-8', user_id: guardians[0]?.id, content: '恭喜！這就是我們平台的價值所在 😊', likes_count: 30 },
  ].filter(c => c.user_id);

  for (const comment of comments) {
    await supabase.from('comments').upsert(comment);
  }
  console.log(`  Created ${comments.length} comments\n`);

  // ============================================
  // 8. MESSAGES (Nunu-Vava conversations)
  // ============================================
  console.log('Creating messages...');

  const messages = [
    // Conversation between 陳教練 and 小明
    { id: 'msg-1', sender_id: vavas[0]?.id, receiver_id: nunus[0]?.id, content: '教練好！我在 React 的課程卡關了，可以請教您嗎？', is_read: true },
    { id: 'msg-2', sender_id: nunus[0]?.id, receiver_id: vavas[0]?.id, content: '當然可以！你遇到什麼問題呢？', is_read: true },
    { id: 'msg-3', sender_id: vavas[0]?.id, receiver_id: nunus[0]?.id, content: '我不太理解 props 和 state 的差別...', is_read: true },
    { id: 'msg-4', sender_id: nunus[0]?.id, receiver_id: vavas[0]?.id, content: '簡單來說，props 是父元件傳給子元件的資料，是唯讀的。state 是元件自己管理的資料，可以改變。你可以把 props 想成是別人給你的禮物，state 是你自己的東西。', is_read: true },
    { id: 'msg-5', sender_id: vavas[0]?.id, receiver_id: nunus[0]?.id, content: '原來如此！這樣我就懂了，謝謝教練！', is_read: true },

    // Conversation between 陳教練 and 小華
    { id: 'msg-6', sender_id: nunus[0]?.id, receiver_id: vavas[1]?.id, content: '小華，你最近的學習進度很棒！TypeScript 課程完成得很快。', is_read: true },
    { id: 'msg-7', sender_id: vavas[1]?.id, receiver_id: nunus[0]?.id, content: '謝謝教練鼓勵！我覺得有了 JavaScript 基礎後 TypeScript 學起來比較順。', is_read: true },
    { id: 'msg-8', sender_id: nunus[0]?.id, receiver_id: vavas[1]?.id, content: '很好！建議你接下來可以挑戰 Next.js，這樣前端技能就更完整了。', is_read: false },

    // Conversation between 林教練 and 小美
    { id: 'msg-9', sender_id: vavas[2]?.id, receiver_id: nunus[1]?.id, content: '教練，我想問一下 CSS 的 Flexbox 和 Grid 要怎麼選擇使用？', is_read: true },
    { id: 'msg-10', sender_id: nunus[1]?.id, receiver_id: vavas[2]?.id, content: '好問題！一般來說，一維排列（橫向或縱向）用 Flexbox，二維排列（同時控制行列）用 Grid。例如導航列用 Flexbox，整個頁面佈局用 Grid。', is_read: true },

    // Conversation between 林教練 and 小強
    { id: 'msg-11', sender_id: nunus[1]?.id, receiver_id: vavas[3]?.id, content: '恭喜你完成 Next.js 課程！你的專案做得很好！', is_read: true },
    { id: 'msg-12', sender_id: vavas[3]?.id, receiver_id: nunus[1]?.id, content: '謝謝教練！我想繼續學系統設計，您覺得我準備好了嗎？', is_read: true },
    { id: 'msg-13', sender_id: nunus[1]?.id, receiver_id: vavas[3]?.id, content: '以你的程度來說可以開始了！建議先從基本概念開始，不用急著學很複雜的架構。', is_read: true },
    { id: 'msg-14', sender_id: vavas[3]?.id, receiver_id: nunus[1]?.id, content: '好的，我會按照建議來學習！', is_read: false },

    // Conversation between 王教練 and 小芳
    { id: 'msg-15', sender_id: vavas[4]?.id, receiver_id: nunus[2]?.id, content: '教練好，我是新加入的學員，請多指教！', is_read: true },
    { id: 'msg-16', sender_id: nunus[2]?.id, receiver_id: vavas[4]?.id, content: '歡迎！有任何問題都可以問我。建議你先從 HTML 課程開始，打好基礎很重要。', is_read: true },
    { id: 'msg-17', sender_id: vavas[4]?.id, receiver_id: nunus[2]?.id, content: '好的！我會努力學習的！', is_read: true },
  ].filter(m => m.sender_id && m.receiver_id);

  for (const msg of messages) {
    await supabase.from('messages').upsert(msg);
  }
  console.log(`  Created ${messages.length} messages\n`);

  // ============================================
  // 9. FEEDBACK (Coach to Student)
  // ============================================
  console.log('Creating feedback...');

  const feedback = [
    // 陳教練 feedback to students
    { id: 'fb-1', nunu_id: nunus[0]?.id, vava_id: vavas[0]?.id, course_id: 'course-3', lesson_id: 'lesson-3-5', content: '函式的概念掌握得很好！建議可以多練習 arrow function 的寫法。', rating: 4 },
    { id: 'fb-2', nunu_id: nunus[0]?.id, vava_id: vavas[0]?.id, course_id: 'course-4', lesson_id: 'lesson-4-5', content: 'State 管理理解正確，繼續保持！', rating: 5 },
    { id: 'fb-3', nunu_id: nunus[0]?.id, vava_id: vavas[1]?.id, course_id: 'course-5', lesson_id: 'lesson-5-3', content: 'Express.js 的路由設計很清晰，不過記得加上錯誤處理。', rating: 4 },
    { id: 'fb-4', nunu_id: nunus[0]?.id, vava_id: vavas[1]?.id, course_id: 'course-7', lesson_id: 'lesson-7-3', content: 'TypeScript 介面定義得很好！型別安全意識很強。', rating: 5 },

    // 林教練 feedback
    { id: 'fb-5', nunu_id: nunus[1]?.id, vava_id: vavas[2]?.id, course_id: 'course-2', lesson_id: 'lesson-2-3', content: 'Flexbox 用得不錯，但 justify-content 和 align-items 容易混淆，多練習！', rating: 3 },
    { id: 'fb-6', nunu_id: nunus[1]?.id, vava_id: vavas[3]?.id, course_id: 'course-7', lesson_id: 'lesson-7-5', content: '泛型用得很靈活！可以開始學習更進階的 TypeScript 技巧了。', rating: 5 },
    { id: 'fb-7', nunu_id: nunus[1]?.id, vava_id: vavas[3]?.id, course_id: 'course-8', lesson_id: 'lesson-8-6', content: 'Server Actions 理解正確，專案架構很清晰！', rating: 5 },

    // 王教練 feedback
    { id: 'fb-8', nunu_id: nunus[2]?.id, vava_id: vavas[4]?.id, course_id: 'course-1', lesson_id: 'lesson-1-2', content: 'HTML 標籤用得正確，繼續學習語意化標籤會更好！', rating: 4 },
  ].filter(f => f.nunu_id && f.vava_id);

  for (const fb of feedback) {
    await supabase.from('feedback').upsert(fb);
  }
  console.log(`  Created ${feedback.length} feedback records\n`);

  // ============================================
  // 10. NOTIFICATIONS
  // ============================================
  console.log('Creating notifications...');

  const notifications = [
    // For vavas
    { id: 'notif-1', user_id: vavas[0]?.id, type: 'feedback', title: '收到新回饋', message: '陳教練給了你的 JavaScript 函式課程一個回饋', link: '/club/feedback', is_read: true },
    { id: 'notif-2', user_id: vavas[0]?.id, type: 'message', title: '新訊息', message: '陳教練回覆了你的訊息', link: '/club/messages', is_read: true },
    { id: 'notif-3', user_id: vavas[0]?.id, type: 'achievement', title: '完成成就！', message: '恭喜完成「連續學習 7 天」成就！', link: '/club/achievements', is_read: false },
    { id: 'notif-4', user_id: vavas[1]?.id, type: 'course', title: '課程更新', message: 'TypeScript 進階課程新增了 2 個單元', link: '/club/courses/course-7', is_read: true },
    { id: 'notif-5', user_id: vavas[1]?.id, type: 'challenge', title: '挑戰即將結束', message: '30天程式挑戰還有 3 天就結束了，加油！', link: '/club/challenges/challenge-1', is_read: false },
    { id: 'notif-6', user_id: vavas[2]?.id, type: 'event', title: '活動提醒', message: 'React 入門工作坊明天就要開始了！', link: '/club/events/event-1', is_read: true },
    { id: 'notif-7', user_id: vavas[3]?.id, type: 'like', title: '有人喜歡你的貼文', message: '你的「成功轉職前端工程師」貼文獲得了 50 個讚！', link: '/club/community/post-8', is_read: true },
    { id: 'notif-8', user_id: vavas[3]?.id, type: 'comment', title: '新留言', message: '陳教練在你的貼文留言了', link: '/club/community/post-8', is_read: false },
    { id: 'notif-9', user_id: vavas[4]?.id, type: 'welcome', title: '歡迎加入！', message: '歡迎來到 Nuva！開始你的學習之旅吧！', link: '/club/courses', is_read: true },

    // For nunus
    { id: 'notif-10', user_id: nunus[0]?.id, type: 'student', title: '學員完成課程', message: '小明完成了 JavaScript 入門課程', link: '/club/nunu/students', is_read: true },
    { id: 'notif-11', user_id: nunus[0]?.id, type: 'message', title: '新訊息', message: '小明發送了一則新訊息', link: '/club/nunu/messages', is_read: false },
    { id: 'notif-12', user_id: nunus[1]?.id, type: 'student', title: '學員提交挑戰', message: '小強提交了前端作品集挑戰', link: '/club/nunu/challenges', is_read: true },

    // For guardians
    { id: 'notif-13', user_id: guardians[0]?.id, type: 'report', title: '週報告', message: '本週新增 15 名學員，完課率 85%', link: '/club/guardian/reports', is_read: true },
    { id: 'notif-14', user_id: guardians[0]?.id, type: 'alert', title: '系統通知', message: '有 3 名學員超過 7 天未上線', link: '/club/guardian/users', is_read: false },
  ].filter(n => n.user_id);

  for (const notif of notifications) {
    await supabase.from('notifications').upsert(notif);
  }
  console.log(`  Created ${notifications.length} notifications\n`);

  // ============================================
  // 11. POST LIKES
  // ============================================
  console.log('Creating post likes...');

  const postLikes: any[] = [];

  for (const post of posts) {
    // Random users like each post
    const likers = [...profiles].sort(() => Math.random() - 0.5).slice(0, Math.min(post.likes_count, profiles.length));
    for (const liker of likers) {
      if (liker.id !== post.user_id) {
        postLikes.push({
          user_id: liker.id,
          post_id: post.id,
        });
      }
    }
  }

  for (const like of postLikes) {
    await supabase.from('post_likes').upsert(like, { onConflict: 'user_id,post_id' });
  }
  console.log(`  Created ${postLikes.length} post likes\n`);

  console.log('✅ All user data seeded successfully!');
}

seedUserData().catch(console.error);
