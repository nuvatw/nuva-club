'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CountdownTimer } from '@/components/waitlist/countdown-timer';
import { WaitlistForm } from '@/components/waitlist/waitlist-form';
import { SuccessScreen } from '@/components/waitlist/success-screen';
import type { WaitlistFormData } from '@/lib/validations/email';

// Target date: March 1, 2025 00:00:00 Taiwan Time (UTC+8)
const TARGET_DATE = new Date('2025-03-01T00:00:00+08:00');

export default function WaitlistPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    data: WaitlistFormData;
    position: number;
  } | null>(null);

  const handleSuccess = (data: WaitlistFormData, position: number) => {
    setSubmittedData({ data, position });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/90 via-primary to-primary/80">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4 md:p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          返回首頁
        </Link>
      </header>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-16">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              nuva
            </h1>
            <p className="text-white/80 text-lg">
              AI 自我成長平台
            </p>
          </div>

          {/* Countdown Section */}
          <div className="text-center space-y-3">
            <p className="text-white/70 text-sm">
              距離正式上線還有
            </p>
            <CountdownTimer targetDate={TARGET_DATE} />
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
            {submitted && submittedData ? (
              <SuccessScreen
                name={submittedData.data.name}
                position={submittedData.position}
              />
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    加入 Waitlist
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    成為第一批體驗者，獨享上線優惠
                  </p>
                </div>
                <WaitlistForm onSuccess={handleSuccess} />
              </div>
            )}
          </div>

          {/* Features Preview */}
          {!submitted && (
            <div className="grid grid-cols-3 gap-4 text-center text-white/80 text-sm">
              <div className="space-y-2">
                <div className="w-10 h-10 mx-auto rounded-xl bg-white/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                    />
                  </svg>
                </div>
                <span>AI 課程</span>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 mx-auto rounded-xl bg-white/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
                    />
                  </svg>
                </div>
                <span>挑戰賽</span>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 mx-auto rounded-xl bg-white/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                    />
                  </svg>
                </div>
                <span>社群</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
