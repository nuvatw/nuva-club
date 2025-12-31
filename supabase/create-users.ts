/**
 * Script to create demo users in Supabase Auth
 *
 * Run this with: npx tsx supabase/create-users.ts
 *
 * Prerequisites:
 * 1. Create a Supabase project
 * 2. Fill in .env.local with your Supabase credentials
 * 3. Make sure to use the SERVICE_ROLE_KEY (not anon key)
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Demo accounts to create
const demoUsers = [
  // Vava accounts (5)
  {
    email: 'vava1@demo.nuva.club',
    password: 'demo1234',
    name: '小明',
    role: 'vava',
    level: 3,
    planType: 'club',
    subscriptionStatus: 'active',
  },
  {
    email: 'vava2@demo.nuva.club',
    password: 'demo1234',
    name: '小華',
    role: 'vava',
    level: 5,
    planType: 'club',
    subscriptionStatus: 'active',
  },
  {
    email: 'vava3@demo.nuva.club',
    password: 'demo1234',
    name: '小美',
    role: 'vava',
    level: 2,
    planType: 'basic',
    subscriptionStatus: 'active',
  },
  {
    email: 'vava4@demo.nuva.club',
    password: 'demo1234',
    name: '小強',
    role: 'vava',
    level: 7,
    planType: 'club',
    subscriptionStatus: 'active',
  },
  {
    email: 'vava5@demo.nuva.club',
    password: 'demo1234',
    name: '小芳',
    role: 'vava',
    level: 1,
    planType: 'basic',
    subscriptionStatus: 'trial',
  },
  // Nunu accounts (3)
  {
    email: 'nunu1@demo.nuva.club',
    password: 'demo1234',
    name: '陳教練',
    role: 'nunu',
    level: 10,
    planType: 'club',
    subscriptionStatus: 'active',
    availableRoles: ['vava', 'nunu'],
  },
  {
    email: 'nunu2@demo.nuva.club',
    password: 'demo1234',
    name: '林教練',
    role: 'nunu',
    level: 9,
    planType: 'club',
    subscriptionStatus: 'active',
    availableRoles: ['vava', 'nunu'],
  },
  {
    email: 'nunu3@demo.nuva.club',
    password: 'demo1234',
    name: '王教練',
    role: 'nunu',
    level: 11,
    planType: 'club',
    subscriptionStatus: 'active',
    availableRoles: ['vava', 'nunu'],
  },
  // Guardian accounts (2)
  {
    email: 'guardian1@demo.nuva.club',
    password: 'demo1234',
    name: '張守護',
    role: 'guardian',
    level: 12,
    planType: 'club',
    subscriptionStatus: 'active',
    availableRoles: ['vava', 'nunu', 'guardian'],
  },
  {
    email: 'guardian2@demo.nuva.club',
    password: 'demo1234',
    name: '李守護',
    role: 'guardian',
    level: 12,
    planType: 'club',
    subscriptionStatus: 'active',
    availableRoles: ['vava', 'nunu', 'guardian'],
  },
];

async function createDemoUsers() {
  console.log('Creating demo users...\n');

  for (const user of demoUsers) {
    try {
      // Create user in auth.users
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: user.name,
          image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name)}`,
        },
      });

      let userId: string | null = null;

      if (error) {
        // User might already exist, try to get their ID
        if (error.message.includes('already been registered')) {
          console.log(`User ${user.email} already exists, fetching ID...`);
          const { data: users } = await supabase.auth.admin.listUsers();
          const existingUser = users?.users?.find(u => u.email === user.email);
          if (existingUser) {
            userId = existingUser.id;
          }
        } else {
          console.error(`Failed to create ${user.email}:`, error.message);
          continue;
        }
      } else {
        userId = data.user?.id || null;
        console.log(`Created user: ${user.email} (${user.name})`);
      }

      // Insert or update profile with additional data
      if (userId) {
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            name: user.name,
            email: user.email,
            image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name)}`,
            role: user.role,
            available_roles: user.availableRoles || [user.role],
            level: user.level,
            plan_type: user.planType,
            subscription_status: user.subscriptionStatus,
            cohort_month: '2025-01',
            billing_cycle: 'monthly',
          });

        if (upsertError) {
          console.error(`Failed to upsert profile for ${user.email}:`, upsertError.message);
        } else {
          console.log(`  - Created profile: role=${user.role}, level=${user.level}`);
        }
      }
    } catch (err) {
      console.error(`Error creating ${user.email}:`, err);
    }
  }

  console.log('\nDone! All demo users created.');
  console.log('\nLogin credentials:');
  console.log('Password for all accounts: demo1234');
  console.log('\nAccounts:');
  demoUsers.forEach(u => {
    console.log(`  ${u.email} - ${u.name} (${u.role})`);
  });
}

createDemoUsers();
