'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserRole, PlanType, BillingCycle, SubscriptionStatus } from '@/types';
import { MOCK_USERS, MockUser } from './users';

interface SubscriptionInfo {
  planType: PlanType;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  startDate: string;
  nextBillingDate: string;
  cancelDate?: string;
}

interface UserContextType {
  user: MockUser | null;
  currentRole: UserRole;
  availableRoles: UserRole[];
  isLoggedIn: boolean;
  nunuApplicationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  subscription: SubscriptionInfo | null;
  login: (userId: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  applyForNunu: () => void;
  approveNunuApplication: () => void; // For demo purposes
  changePlan: (planType: PlanType) => void;
  changeBillingCycle: (cycle: BillingCycle) => void;
  cancelSubscription: () => void;
  reactivateSubscription: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'nuva-demo-user';
const ROLE_STORAGE_KEY = 'nuva-demo-role';
const SUBSCRIPTION_STORAGE_KEY = 'nuva-demo-subscription';

function getDefaultSubscription(user: MockUser): SubscriptionInfo {
  const startDate = new Date(user.createdAt);
  const nextBillingDate = new Date(startDate);
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  return {
    planType: user.planType,
    billingCycle: 'monthly',
    status: user.subscriptionStatus,
    startDate: startDate.toISOString(),
    nextBillingDate: nextBillingDate.toISOString(),
  };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('vava');
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem(STORAGE_KEY);
    const storedRole = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null;
    const storedSubscription = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);

    if (storedUserId) {
      const foundUser = MOCK_USERS.find(u => u.id === storedUserId);
      if (foundUser) {
        setUser(foundUser);
        // Use stored role if valid for this user, otherwise use user's default role
        if (storedRole && foundUser.availableRoles.includes(storedRole)) {
          setCurrentRole(storedRole);
        } else {
          setCurrentRole(foundUser.role);
        }
        // Load subscription or create default
        if (storedSubscription) {
          setSubscription(JSON.parse(storedSubscription));
        } else {
          setSubscription(getDefaultSubscription(foundUser));
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userId: string) => {
    const foundUser = MOCK_USERS.find(u => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
      setCurrentRole(foundUser.role);
      const defaultSub = getDefaultSubscription(foundUser);
      setSubscription(defaultSub);
      localStorage.setItem(STORAGE_KEY, userId);
      localStorage.setItem(ROLE_STORAGE_KEY, foundUser.role);
      localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(defaultSub));
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentRole('vava');
    setSubscription(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);
    localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
  };

  const switchRole = (role: UserRole) => {
    if (user && user.availableRoles.includes(role)) {
      setCurrentRole(role);
      localStorage.setItem(ROLE_STORAGE_KEY, role);
    }
  };

  const applyForNunu = () => {
    if (user && user.nunuApplicationStatus === 'none') {
      const updatedUser = { ...user, nunuApplicationStatus: 'pending' as const };
      setUser(updatedUser);
      // Update in mock data (in-memory only for demo)
      const userIndex = MOCK_USERS.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        MOCK_USERS[userIndex] = updatedUser;
      }
    }
  };

  const approveNunuApplication = () => {
    if (user && user.nunuApplicationStatus === 'pending') {
      const updatedUser = {
        ...user,
        nunuApplicationStatus: 'approved' as const,
        availableRoles: [...user.availableRoles, 'nunu'] as UserRole[],
      };
      setUser(updatedUser);
      // Update in mock data (in-memory only for demo)
      const userIndex = MOCK_USERS.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        MOCK_USERS[userIndex] = updatedUser;
      }
    }
  };

  const changePlan = (planType: PlanType) => {
    if (!subscription) return;
    const updated: SubscriptionInfo = {
      ...subscription,
      planType,
      status: 'active',
    };
    setSubscription(updated);
    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(updated));

    // Also update user planType
    if (user) {
      const updatedUser = { ...user, planType, subscriptionStatus: 'active' as const };
      setUser(updatedUser);
      const userIndex = MOCK_USERS.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        MOCK_USERS[userIndex] = updatedUser;
      }
    }
  };

  const changeBillingCycle = (cycle: BillingCycle) => {
    if (!subscription) return;
    const nextBillingDate = new Date();
    if (cycle === 'monthly') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }
    const updated: SubscriptionInfo = {
      ...subscription,
      billingCycle: cycle,
      nextBillingDate: nextBillingDate.toISOString(),
    };
    setSubscription(updated);
    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(updated));
  };

  const cancelSubscription = () => {
    if (!subscription) return;
    const updated: SubscriptionInfo = {
      ...subscription,
      status: 'canceled',
      cancelDate: new Date().toISOString(),
    };
    setSubscription(updated);
    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(updated));

    if (user) {
      const updatedUser = { ...user, subscriptionStatus: 'canceled' as const };
      setUser(updatedUser);
    }
  };

  const reactivateSubscription = () => {
    if (!subscription) return;
    const nextBillingDate = new Date();
    if (subscription.billingCycle === 'monthly') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }
    const updated: SubscriptionInfo = {
      ...subscription,
      status: 'active',
      cancelDate: undefined,
      nextBillingDate: nextBillingDate.toISOString(),
    };
    setSubscription(updated);
    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(updated));

    if (user) {
      const updatedUser = { ...user, subscriptionStatus: 'active' as const };
      setUser(updatedUser);
    }
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <UserContext.Provider
      value={{
        user,
        currentRole,
        availableRoles: user?.availableRoles || ['vava'],
        isLoggedIn: !!user,
        nunuApplicationStatus: user?.nunuApplicationStatus || 'none',
        subscription,
        login,
        logout,
        switchRole,
        applyForNunu,
        approveNunuApplication,
        changePlan,
        changeBillingCycle,
        cancelSubscription,
        reactivateSubscription,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Helper hook for role-based rendering
export function useRole() {
  const { currentRole, availableRoles, switchRole } = useUser();

  return {
    role: currentRole,
    isVava: currentRole === 'vava',
    isNunu: currentRole === 'nunu',
    isGuardian: currentRole === 'guardian',
    canSwitchTo: (role: UserRole) => availableRoles.includes(role),
    availableRoles,
    switchRole,
  };
}
