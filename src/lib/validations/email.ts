import { z } from 'zod';

// Common Gmail typos
const GMAIL_TYPOS = [
  'gamil.com',
  'gmial.com',
  'gmal.com',
  'gmai.com',
  'gmil.com',
  'gnail.com',
  'gmaill.com',
  'gmail.co',
  'gmail.cm',
  'gmail.om',
  'gmail.con',
  'gmail.cpm',
  'gmail.vom',
  'gmail.xom',
  'gmaik.com',
  'gmaol.com',
  'gmsil.com',
  'gmqil.com',
  'hmail.com',
  'fmail.com',
  'gimail.com',
  'gemail.com',
  'g.mail.com',
  'gmaio.com',
  'gmaul.com',
  'gmali.com',
  'gmaile.com',
  'gmailc.om',
  'gmai.lcom',
  'gamil.con',
  'gmailcom',
];

// Other common domain typos with their corrections
const DOMAIN_TYPOS: Record<string, string> = {
  'hotmail.co': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'hotamil.com': 'hotmail.com',
  'yahoo.co': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  'outlook.co': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outlok.com': 'outlook.com',
  'icloud.co': 'icloud.com',
  'iclod.com': 'icloud.com',
  'icould.com': 'icloud.com',
};

export interface EmailTypoResult {
  hasTypo: boolean;
  originalDomain: string;
  suggestedDomain: string | null;
  correctedEmail: string | null;
}

/**
 * Check if an email domain has a common typo
 */
export function checkEmailTypo(email: string): EmailTypoResult {
  const atIndex = email.lastIndexOf('@');
  if (atIndex === -1) {
    return {
      hasTypo: false,
      originalDomain: '',
      suggestedDomain: null,
      correctedEmail: null,
    };
  }

  const localPart = email.substring(0, atIndex);
  const domain = email.substring(atIndex + 1).toLowerCase();

  // Check Gmail typos
  if (GMAIL_TYPOS.includes(domain)) {
    return {
      hasTypo: true,
      originalDomain: domain,
      suggestedDomain: 'gmail.com',
      correctedEmail: `${localPart}@gmail.com`,
    };
  }

  // Check other domain typos
  if (domain in DOMAIN_TYPOS) {
    const corrected = DOMAIN_TYPOS[domain];
    return {
      hasTypo: true,
      originalDomain: domain,
      suggestedDomain: corrected,
      correctedEmail: `${localPart}@${corrected}`,
    };
  }

  return {
    hasTypo: false,
    originalDomain: domain,
    suggestedDomain: null,
    correctedEmail: null,
  };
}

/**
 * Zod schema for email validation
 */
export const emailSchema = z
  .string()
  .min(1, '請輸入 Email')
  .email('請輸入有效的 Email 格式');

/**
 * Zod schema for name validation
 */
export const nameSchema = z
  .string()
  .min(1, '請輸入姓名')
  .min(2, '姓名至少需要 2 個字元')
  .max(50, '姓名不能超過 50 個字元');

/**
 * Zod schema for waitlist form
 */
export const waitlistFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
});

export type WaitlistFormData = z.infer<typeof waitlistFormSchema>;
