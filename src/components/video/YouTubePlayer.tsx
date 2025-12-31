'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import YouTube, { YouTubeProps, YouTubeEvent } from 'react-youtube';
import { useLessonProgress } from '@/hooks/useProgress';

interface YouTubePlayerProps {
  videoId: string;
  lessonId: string;
  courseId: string;
  userId?: string;
  onComplete?: () => void;
  className?: string;
}

export function YouTubePlayer({
  videoId,
  lessonId,
  courseId,
  userId,
  onComplete,
  className = '',
}: YouTubePlayerProps) {
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTime = useRef<number>(0);

  const { progress, updateProgress, markComplete } = useLessonProgress(
    userId,
    lessonId,
    courseId
  );

  // Save progress every 10 seconds while playing
  const saveProgress = useCallback(async () => {
    if (!player || !userId || !duration) return;

    const currentPos = player.getCurrentTime();
    const progressPercent = Math.round((currentPos / duration) * 100);
    const watchTime = Math.round(currentPos);

    // Only save if significant progress (avoid saving same position)
    if (Math.abs(watchTime - lastSaveTime.current) >= 10) {
      lastSaveTime.current = watchTime;
      await updateProgress(progressPercent, watchTime);

      // Check if completed (90% threshold)
      if (progressPercent >= 90 && !progress?.is_completed) {
        await markComplete();
        onComplete?.();
      }
    }
  }, [player, userId, duration, updateProgress, markComplete, progress, onComplete]);

  // Track progress while playing
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        if (player) {
          setCurrentTime(player.getCurrentTime());
          saveProgress();
        }
      }, 10000); // Save every 10 seconds
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, player, saveProgress]);

  // Resume from last position
  useEffect(() => {
    if (player && progress?.watch_time && !isPlaying) {
      // Only seek if not already at the position
      const playerTime = player.getCurrentTime();
      if (Math.abs(playerTime - progress.watch_time) > 5) {
        player.seekTo(progress.watch_time, true);
      }
    }
  }, [player, progress]);

  const onReady: YouTubeProps['onReady'] = (event: YouTubeEvent) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration());

    // Resume from saved position
    if (progress?.watch_time) {
      event.target.seekTo(progress.watch_time, true);
    }
  };

  const onPlay: YouTubeProps['onPlay'] = () => {
    setIsPlaying(true);
  };

  const onPause: YouTubeProps['onPause'] = () => {
    setIsPlaying(false);
    saveProgress(); // Save when pausing
  };

  const onEnd: YouTubeProps['onEnd'] = async () => {
    setIsPlaying(false);
    if (userId && !progress?.is_completed) {
      await markComplete();
      onComplete?.();
    }
  };

  const opts: YouTubeProps['opts'] = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
      fs: 1,
    },
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`relative ${className}`}>
      <div className="aspect-video rounded-lg overflow-hidden bg-black">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onReady}
          onPlay={onPlay}
          onPause={onPause}
          onEnd={onEnd}
          className="w-full h-full"
          iframeClassName="w-full h-full"
        />
      </div>

      {/* Progress bar */}
      {userId && (
        <div className="mt-2">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress?.progress || progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            {progress?.is_completed ? (
              <span className="text-green-600 font-medium">已完成</span>
            ) : (
              <span>{Math.round(progress?.progress || progressPercent)}% 完成</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Simple player without progress tracking (for preview)
export function YouTubePlayerSimple({
  videoId,
  className = '',
}: {
  videoId: string;
  className?: string;
}) {
  const opts: YouTubeProps['opts'] = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
      fs: 1,
    },
  };

  return (
    <div className={`aspect-video rounded-lg overflow-hidden bg-black ${className}`}>
      <YouTube
        videoId={videoId}
        opts={opts}
        className="w-full h-full"
        iframeClassName="w-full h-full"
      />
    </div>
  );
}
