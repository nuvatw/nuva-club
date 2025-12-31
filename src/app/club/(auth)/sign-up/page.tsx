'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { checkEmailTypo, type EmailTypoResult } from '@/lib/validations/email';
import { EmailTypoWarning } from '@/components/waitlist/email-typo-warning';
import {
  signUpFormSchema,
  checkUsernameAvailability,
  isValidUsername,
  type SignUpFormData,
} from '@/lib/validations/username';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    displayName: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpFormData, string>>>({});
  const [typoResult, setTypoResult] = useState<EmailTypoResult | null>(null);
  const [typoIgnored, setTypoIgnored] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced username check
  useEffect(() => {
    if (!formData.username || formData.username.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    const validation = isValidUsername(formData.username);
    if (!validation.valid) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      const isAvailable = await checkUsernameAvailability(formData.username);
      setUsernameStatus(isAvailable ? 'available' : 'taken');
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username]);

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof SignUpFormData]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleEmailBlur = () => {
    if (formData.email && !typoIgnored) {
      const result = checkEmailTypo(formData.email);
      if (result.hasTypo) {
        setTypoResult(result);
      }
    }
  };

  const handleAcceptTypo = () => {
    if (typoResult?.correctedEmail) {
      setFormData((prev) => ({ ...prev, email: typoResult.correctedEmail! }));
      setTypoResult(null);
    }
  };

  const handleRejectTypo = () => {
    setTypoIgnored(true);
    setTypoResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = signUpFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignUpFormData, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof SignUpFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Check username availability
    if (usernameStatus === 'taken') {
      setErrors({ username: '此用戶名已被使用' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Store user data in localStorage for demo
      const userData = {
        id: `user_${Date.now()}`,
        username: formData.username.toLowerCase(),
        email: formData.email,
        displayName: formData.displayName,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('nuva-demo-user', userData.id);
      localStorage.setItem('nuva-demo-user-data', JSON.stringify(userData));

      // Redirect to dashboard
      router.push('/club/dashboard');
    } catch (error) {
      console.error('Sign up failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-primary">nuva</h1>
          </Link>
          <p className="text-muted-foreground">建立你的帳號</p>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>註冊</CardTitle>
            <CardDescription>加入 Nuva Club，開始你的成長之旅</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium">
                  用戶名 <span className="text-muted-foreground">(@username)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    @
                  </span>
                  <Input
                    id="username"
                    type="text"
                    placeholder="your_username"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className={`pl-8 ${errors.username ? 'border-destructive' : ''}`}
                  />
                  {usernameStatus === 'checking' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="animate-spin h-4 w-4 text-muted-foreground" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </span>
                  )}
                  {usernameStatus === 'available' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </span>
                  )}
                  {usernameStatus === 'taken' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </span>
                  )}
                </div>
                {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
                {usernameStatus === 'taken' && !errors.username && (
                  <p className="text-sm text-destructive">此用戶名已被使用</p>
                )}
                <p className="text-xs text-muted-foreground">
                  你的個人主頁將會是 meetnuva.com/club/{formData.username || 'username'}
                </p>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <label htmlFor="displayName" className="block text-sm font-medium">
                  顯示名稱
                </label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="你想被稱呼的名字"
                  value={formData.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  className={errors.displayName ? 'border-destructive' : ''}
                />
                {errors.displayName && <p className="text-sm text-destructive">{errors.displayName}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => {
                    handleChange('email', e.target.value);
                    setTypoResult(null);
                    setTypoIgnored(false);
                  }}
                  onBlur={handleEmailBlur}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              {/* Email Typo Warning */}
              {typoResult?.hasTypo && typoResult.suggestedDomain && (
                <EmailTypoWarning
                  originalDomain={typoResult.originalDomain}
                  suggestedDomain={typoResult.suggestedDomain}
                  onAccept={handleAcceptTypo}
                  onReject={handleRejectTypo}
                />
              )}

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium">
                  密碼
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="至少 8 個字元"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium">
                  確認密碼
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="再次輸入密碼"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-muted-foreground">
                  我同意 <a href="#" className="text-primary hover:underline">服務條款</a> 和 <a href="#" className="text-primary hover:underline">隱私政策</a>
                </label>
              </div>
              {errors.agreeToTerms && <p className="text-sm text-destructive">{errors.agreeToTerms}</p>}

              {/* Submit */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    註冊中...
                  </span>
                ) : (
                  '建立帳號'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login Link */}
        <p className="text-center text-sm text-muted-foreground">
          已經有帳號了？{' '}
          <Link href="/club/login" className="text-primary font-medium hover:underline">
            登入
          </Link>
        </p>
      </div>
    </div>
  );
}
