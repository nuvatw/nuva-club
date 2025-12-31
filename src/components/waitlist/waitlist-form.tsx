'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmailTypoWarning } from './email-typo-warning';
import { checkEmailTypo, waitlistFormSchema, type WaitlistFormData, type EmailTypoResult } from '@/lib/validations/email';

interface WaitlistFormProps {
  onSuccess: (data: WaitlistFormData, position: number) => void;
}

const WAITLIST_STORAGE_KEY = 'nuva-waitlist';
const WAITLIST_COUNT_KEY = 'nuva-waitlist-count';

export function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [typoResult, setTypoResult] = useState<EmailTypoResult | null>(null);
  const [typoIgnored, setTypoIgnored] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for email typos on blur
  const handleEmailBlur = () => {
    if (email && !typoIgnored) {
      const result = checkEmailTypo(email);
      if (result.hasTypo) {
        setTypoResult(result);
      }
    }
  };

  // Handle email change
  const handleEmailChange = (value: string) => {
    setEmail(value);
    setTypoResult(null);
    setTypoIgnored(false);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  // Handle name change
  const handleNameChange = (value: string) => {
    setName(value);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  // Accept typo correction
  const handleAcceptTypo = () => {
    if (typoResult?.correctedEmail) {
      setEmail(typoResult.correctedEmail);
      setTypoResult(null);
    }
  };

  // Reject typo correction
  const handleRejectTypo = () => {
    setTypoIgnored(true);
    setTypoResult(null);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = waitlistFormSchema.safeParse({ name, email });
    if (!result.success) {
      const fieldErrors: { name?: string; email?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as 'name' | 'email';
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Get current count and increment
      const currentCount = parseInt(localStorage.getItem(WAITLIST_COUNT_KEY) || '0', 10);
      const newPosition = currentCount + 1;

      // Store submission
      const submissions = JSON.parse(localStorage.getItem(WAITLIST_STORAGE_KEY) || '[]');
      submissions.push({
        name,
        email,
        position: newPosition,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(submissions));
      localStorage.setItem(WAITLIST_COUNT_KEY, String(newPosition));

      onSuccess({ name, email }, newPosition);
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Field */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          你的名字
        </label>
        <Input
          id="name"
          type="text"
          placeholder="請輸入你的名字"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          onBlur={handleEmailBlur}
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      {/* Typo Warning */}
      {typoResult?.hasTypo && typoResult.suggestedDomain && (
        <EmailTypoWarning
          originalDomain={typoResult.originalDomain}
          suggestedDomain={typoResult.suggestedDomain}
          onAccept={handleAcceptTypo}
          onReject={handleRejectTypo}
        />
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            提交中...
          </span>
        ) : (
          '加入 Waitlist'
        )}
      </Button>

      <p className="text-xs text-center text-gray-500">
        我們不會發送垃圾郵件，只會在產品上線時通知你。
      </p>
    </form>
  );
}
