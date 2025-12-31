export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'vava' | 'nunu' | 'guardian';
export type PlanType = 'basic' | 'club';
export type SubscriptionStatus = 'active' | 'trial' | 'canceled' | 'expired';
export type BillingCycle = 'monthly' | 'yearly';
export type NunuApplicationStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type PostType = 'question' | 'share' | 'challenge';
export type EventType = 'online' | 'offline';
export type ChallengeStatus = 'joined' | 'submitted' | 'completed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          image: string | null;
          role: UserRole;
          available_roles: UserRole[];
          level: number;
          plan_type: PlanType;
          subscription_status: SubscriptionStatus;
          billing_cycle: BillingCycle | null;
          cohort_month: string | null;
          nunu_application_status: NunuApplicationStatus | null;
          assigned_nunu_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          image?: string | null;
          role?: UserRole;
          available_roles?: UserRole[];
          level?: number;
          plan_type?: PlanType;
          subscription_status?: SubscriptionStatus;
          billing_cycle?: BillingCycle | null;
          cohort_month?: string | null;
          nunu_application_status?: NunuApplicationStatus | null;
          assigned_nunu_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          image?: string | null;
          role?: UserRole;
          available_roles?: UserRole[];
          level?: number;
          plan_type?: PlanType;
          subscription_status?: SubscriptionStatus;
          billing_cycle?: BillingCycle | null;
          cohort_month?: string | null;
          nunu_application_status?: NunuApplicationStatus | null;
          assigned_nunu_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          level: number;
          lessons_count: number;
          total_duration: number;
          thumbnail: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          title: string;
          description?: string | null;
          level: number;
          lessons_count?: number;
          total_duration?: number;
          thumbnail?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          level?: number;
          lessons_count?: number;
          total_duration?: number;
          thumbnail?: string | null;
          created_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          video_url: string;
          video_duration: number;
          order: number;
          created_at: string;
        };
        Insert: {
          id: string;
          course_id: string;
          title: string;
          description?: string | null;
          video_url: string;
          video_duration?: number;
          order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string | null;
          video_url?: string;
          video_duration?: number;
          order?: number;
          created_at?: string;
        };
      };
      user_course_progress: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          is_enrolled: boolean;
          enrolled_at: string | null;
          is_completed: boolean;
          completed_at: string | null;
          current_lesson_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          is_enrolled?: boolean;
          enrolled_at?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          current_lesson_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          is_enrolled?: boolean;
          enrolled_at?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          current_lesson_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          course_id: string;
          progress: number;
          watch_time: number;
          is_completed: boolean;
          completed_at: string | null;
          last_watched_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          course_id: string;
          progress?: number;
          watch_time?: number;
          is_completed?: boolean;
          completed_at?: string | null;
          last_watched_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          course_id?: string;
          progress?: number;
          watch_time?: number;
          is_completed?: boolean;
          completed_at?: string | null;
          last_watched_at?: string;
        };
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          prize: string | null;
          start_date: string;
          end_date: string;
          created_at: string;
        };
        Insert: {
          id: string;
          title: string;
          description?: string | null;
          prize?: string | null;
          start_date: string;
          end_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          prize?: string | null;
          start_date?: string;
          end_date?: string;
          created_at?: string;
        };
      };
      challenge_participations: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          status: ChallengeStatus;
          submission_url: string | null;
          submitted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_id: string;
          status?: ChallengeStatus;
          submission_url?: string | null;
          submitted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_id?: string;
          status?: ChallengeStatus;
          submission_url?: string | null;
          submitted_at?: string | null;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          type: EventType;
          start_date: string;
          end_date: string;
          location: string | null;
          max_participants: number | null;
          rsvp_count: number;
          created_at: string;
        };
        Insert: {
          id: string;
          title: string;
          description?: string | null;
          type: EventType;
          start_date: string;
          end_date: string;
          location?: string | null;
          max_participants?: number | null;
          rsvp_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          type?: EventType;
          start_date?: string;
          end_date?: string;
          location?: string | null;
          max_participants?: number | null;
          rsvp_count?: number;
          created_at?: string;
        };
      };
      event_rsvps: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string;
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          type: PostType;
          title: string;
          content: string;
          image: string | null;
          challenge_id: string | null;
          likes_count: number;
          comments_count: number;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          type: PostType;
          title: string;
          content: string;
          image?: string | null;
          challenge_id?: string | null;
          likes_count?: number;
          comments_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: PostType;
          title?: string;
          content?: string;
          image?: string | null;
          challenge_id?: string | null;
          likes_count?: number;
          comments_count?: number;
          created_at?: string;
        };
      };
      post_likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          likes_count: number;
          created_at: string;
        };
        Insert: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          likes_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          likes_count?: number;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          content?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          nunu_id: string;
          vava_id: string;
          course_id: string | null;
          lesson_id: string | null;
          content: string;
          rating: number | null;
          created_at: string;
        };
        Insert: {
          id: string;
          nunu_id: string;
          vava_id: string;
          course_id?: string | null;
          lesson_id?: string | null;
          content: string;
          rating?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nunu_id?: string;
          vava_id?: string;
          course_id?: string | null;
          lesson_id?: string | null;
          content?: string;
          rating?: number | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          link: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          link?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          link?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      coach_students: {
        Row: {
          id: string;
          coach_id: string;
          student_id: string;
          feedback_count: number;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          coach_id: string;
          student_id: string;
          feedback_count?: number;
          assigned_at?: string;
        };
        Update: {
          id?: string;
          coach_id?: string;
          student_id?: string;
          feedback_count?: number;
          assigned_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for use throughout the app
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Course = Database['public']['Tables']['courses']['Row'];
export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type UserCourseProgress = Database['public']['Tables']['user_course_progress']['Row'];
export type UserLessonProgress = Database['public']['Tables']['user_lesson_progress']['Row'];
export type Challenge = Database['public']['Tables']['challenges']['Row'];
export type ChallengeParticipation = Database['public']['Tables']['challenge_participations']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type EventRsvp = Database['public']['Tables']['event_rsvps']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type PostLike = Database['public']['Tables']['post_likes']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Feedback = Database['public']['Tables']['feedback']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type CoachStudent = Database['public']['Tables']['coach_students']['Row'];

// Extended types with relations
export interface PostWithAuthor extends Post {
  author: Profile;
}

export interface CommentWithAuthor extends Comment {
  author: Profile;
}

export interface LessonWithProgress extends Lesson {
  progress?: UserLessonProgress;
}

export interface CourseWithProgress extends Course {
  progress?: UserCourseProgress;
  lessons?: LessonWithProgress[];
}
