'use client';

import { Button } from '@/components/ui/button';

interface EmailTypoWarningProps {
  originalDomain: string;
  suggestedDomain: string;
  onAccept: () => void;
  onReject: () => void;
}

export function EmailTypoWarning({
  originalDomain,
  suggestedDomain,
  onAccept,
  onReject,
}: EmailTypoWarningProps) {
  return (
    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4 text-amber-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm text-amber-800">
            你是不是想輸入 <strong>{suggestedDomain}</strong>？
          </p>
          <p className="text-xs text-amber-600 mt-1">
            目前輸入的是 {originalDomain}
          </p>
        </div>
      </div>
      <div className="flex gap-2 pl-9">
        <Button
          type="button"
          size="sm"
          onClick={onAccept}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          是，幫我修正
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onReject}
          className="border-amber-300 text-amber-700 hover:bg-amber-100"
        >
          不是，保持原樣
        </Button>
      </div>
    </div>
  );
}
