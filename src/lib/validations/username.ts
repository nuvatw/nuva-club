import { z } from 'zod';

// Reserved usernames that cannot be used
const RESERVED_USERNAMES = [
  'admin',
  'administrator',
  'nuva',
  'nunu',
  'vava',
  'support',
  'help',
  'info',
  'contact',
  'team',
  'official',
  'root',
  'system',
  'mod',
  'moderator',
  'staff',
  'api',
  'www',
  'mail',
  'email',
  'test',
  'demo',
  'null',
  'undefined',
  'login',
  'signup',
  'register',
  'settings',
  'profile',
  'dashboard',
  'club',
  'waitlist',
];

/**
 * Check if a username is valid
 */
export function isValidUsername(username: string): { valid: boolean; error?: string } {
  const lowercased = username.toLowerCase();

  // Length check
  if (username.length < 3) {
    return { valid: false, error: '用戶名至少需要 3 個字元' };
  }
  if (username.length > 20) {
    return { valid: false, error: '用戶名不能超過 20 個字元' };
  }

  // Format check: lowercase letters, numbers, underscores only
  if (!/^[a-z][a-z0-9_]*$/.test(lowercased)) {
    if (/^[0-9]/.test(lowercased)) {
      return { valid: false, error: '用戶名不能以數字開頭' };
    }
    return { valid: false, error: '用戶名只能包含小寫英文、數字和底線' };
  }

  // Reserved username check
  if (RESERVED_USERNAMES.includes(lowercased)) {
    return { valid: false, error: '此用戶名已被保留，請選擇其他名稱' };
  }

  return { valid: true };
}

/**
 * Check if a username is available (mock implementation)
 */
export function checkUsernameAvailability(username: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Mock: some usernames are "taken"
      const takenUsernames = ['john', 'jane', 'test123', 'user1'];
      resolve(!takenUsernames.includes(username.toLowerCase()));
    }, 500);
  });
}

/**
 * Zod schema for username validation
 */
export const usernameSchema = z
  .string()
  .min(3, '用戶名至少需要 3 個字元')
  .max(20, '用戶名不能超過 20 個字元')
  .regex(/^[a-z][a-z0-9_]*$/, '用戶名只能包含小寫英文、數字和底線，且不能以數字開頭')
  .refine(
    (val) => !RESERVED_USERNAMES.includes(val.toLowerCase()),
    '此用戶名已被保留，請選擇其他名稱'
  );

/**
 * Zod schema for password validation
 */
export const passwordSchema = z
  .string()
  .min(8, '密碼至少需要 8 個字元')
  .regex(/[A-Za-z]/, '密碼需要包含至少一個英文字母')
  .regex(/[0-9]/, '密碼需要包含至少一個數字');

/**
 * Zod schema for sign up form
 */
export const signUpFormSchema = z.object({
  username: usernameSchema,
  email: z.string().min(1, '請輸入 Email').email('請輸入有效的 Email 格式'),
  displayName: z.string().min(2, '顯示名稱至少需要 2 個字元').max(30, '顯示名稱不能超過 30 個字元'),
  password: passwordSchema,
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine((val) => val === true, '請同意服務條款'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '兩次輸入的密碼不一致',
  path: ['confirmPassword'],
});

export type SignUpFormData = z.infer<typeof signUpFormSchema>;
