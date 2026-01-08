# PODVISOR (Founder Lessons Database) - Complete Application Replication Specification

## 📋 EXECUTIVE SUMMARY

**Application Name:** Podvisor / Founder Lessons Database  
**Type:** AI-powered podcast analysis platform for founders  
**Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Supabase + Capacitor  
**Target Platforms:** Web (PWA), iOS (Capacitor), Android (Capacitor)

**Core Purpose:** Extract tactical founder lessons from podcast episodes using AI, with personalized insights based on the user's startup profile. Users can analyze YouTube/Spotify podcast episodes, get AI-extracted lessons ranked by impact and actionability, and receive personalized recommendations based on their startup's stage and industry.

---

## 🏗️ SECTION 1: ARCHITECTURE & PROJECT STRUCTURE

### 1.1 Complete File Tree

```
/
├── .env                              # Environment variables (gitignored)
├── .env.example                      # Environment template
├── .gitignore
├── bun.lockb                         # Bun lockfile
├── capacitor.config.ts               # Capacitor native app config
├── components.json                   # shadcn/ui configuration
├── eslint.config.js                  # ESLint config
├── index.html                        # Entry HTML
├── package.json                      # Dependencies
├── package-lock.json
├── postcss.config.js                 # PostCSS config
├── README.md
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript base config
├── tsconfig.app.json                 # TypeScript app config
├── tsconfig.node.json                # TypeScript node config
├── vite.config.ts                    # Vite bundler config
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── App.css                       # Legacy/unused styles
│   ├── App.tsx                       # Root application component
│   ├── index.css                     # Global styles + CSS variables
│   ├── main.tsx                      # Entry point
│   ├── vite-env.d.ts                 # Vite type declarations
│   ├── assets/
│   │   └── hero-bg.jpg               # Hero section background image
│   ├── components/
│   │   ├── AnalysisForm.tsx          # Episode analysis form
│   │   ├── BookmarkButton.tsx        # Bookmark toggle with folder menu
│   │   ├── BookmarkedEpisodeCard.tsx # Card for bookmarked episodes
│   │   ├── BookmarkFolderDialog.tsx  # Create/edit folder dialog
│   │   ├── EpisodeDetail.tsx         # Full episode view with lessons
│   │   ├── EpisodesTable.tsx         # Episodes list/grid
│   │   ├── ExportModal.tsx           # Export to CSV/JSON/Markdown
│   │   ├── HeroSection.tsx           # Hero for authenticated users
│   │   ├── ProfileSettings.tsx       # Profiles + bookmarks manager
│   │   ├── PublicLanding.tsx         # Landing page for visitors
│   │   ├── StartupProfileDialog.tsx  # Create/edit profile modal
│   │   ├── StartupProfileForm.tsx    # Profile form for analysis
│   │   ├── theme-provider.tsx        # Theme context wrapper
│   │   ├── ThemeToggle.tsx           # Light/dark/system toggle
│   │   ├── subscription/
│   │   │   ├── index.ts              # Exports
│   │   │   ├── PricingPlans.tsx      # Tier comparison cards
│   │   │   ├── SubscriptionModal.tsx # Full subscription modal
│   │   │   ├── UpgradePrompt.tsx     # Upgrade CTA component
│   │   │   └── UsageDisplay.tsx      # Usage meters
│   │   └── ui/                       # shadcn/ui components (54 files)
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── aspect-ratio.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── breadcrumb.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── chart.tsx
│   │       ├── checkbox.tsx
│   │       ├── collapsible.tsx
│   │       ├── command.tsx
│   │       ├── context-menu.tsx
│   │       ├── dialog.tsx
│   │       ├── drawer.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── hover-card.tsx
│   │       ├── input-otp.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── menubar.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── pagination.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── radio-group.tsx
│   │       ├── resizable.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── sonner.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       ├── toggle-group.tsx
│   │       ├── toggle.tsx
│   │       ├── tooltip.tsx
│   │       └── use-toast.ts
│   ├── contexts/
│   │   └── SubscriptionContext.tsx   # Subscription state provider
│   ├── hooks/
│   │   ├── use-mobile.tsx            # Mobile breakpoint hook
│   │   ├── use-toast.ts              # Toast state management
│   │   ├── useAuth.tsx               # Authentication hook
│   │   ├── useMediaQuery.ts          # Generic media query hook
│   │   └── useUserRole.tsx           # Admin role check hook
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts             # Supabase client instance
│   │       └── types.ts              # Database types (auto-generated)
│   ├── lib/
│   │   ├── capacitor.ts              # Native plugin initialization
│   │   └── utils.ts                  # cn() classname utility
│   ├── pages/
│   │   ├── Account.tsx               # Account settings page
│   │   ├── Auth.tsx                  # Login/signup page
│   │   ├── Index.tsx                 # Main dashboard
│   │   └── NotFound.tsx              # 404 page
│   ├── services/
│   │   └── subscriptionService.ts    # Subscription API layer
│   └── types/
│       └── subscription.ts           # Subscription type definitions
└── supabase/
    ├── config.toml                   # Supabase project config
    ├── functions/
    │   ├── analyze-episode/
    │   │   └── index.ts              # AI episode analysis
    │   ├── create-checkout-session/
    │   │   └── index.ts              # Stripe checkout
    │   ├── create-portal-session/
    │   │   └── index.ts              # Stripe customer portal
    │   └── stripe-webhook/
    │       └── index.ts              # Stripe webhook handler
    └── migrations/
        ├── 20241231000001_add_subscriptions.sql
        ├── 20251008034503_*.sql      # Core tables
        ├── 20251008145842_*.sql      # Bookmarks
        ├── 20251008151730_*.sql      # User profiles
        ├── 20251008155231_*.sql      # Cascade deletes
        ├── 20251008164102_*.sql      # Episode delete policy
        ├── 20251009171542_*.sql      # Bookmark RLS fix
        ├── 20251009174202_*.sql      # NOT NULL constraints
        ├── 20251228190735_*.sql      # User roles
        └── 20251231003639_*.sql      # Profile role column
```

### 1.2 Package Dependencies (EXACT VERSIONS)

```json
{
  "name": "podvisor",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview",
    "cap:sync": "cap sync",
    "cap:ios": "cap open ios",
    "cap:build": "npm run build && cap sync"
  },
  "dependencies": {
    "@capacitor/app": "^6.0.0",
    "@capacitor/core": "^6.0.0",
    "@capacitor/haptics": "^6.0.0",
    "@capacitor/keyboard": "^6.0.0",
    "@capacitor/status-bar": "^6.0.0",
    "@capacitor/splash-screen": "^6.0.0",
    "@revenuecat/purchases-capacitor": "^8.0.0",
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-accordion": "^1.2.11",
    "@radix-ui/react-alert-dialog": "^1.1.14",
    "@radix-ui/react-aspect-ratio": "^1.1.7",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.2",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-context-menu": "^2.2.15",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-hover-card": "^1.1.14",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-menubar": "^1.1.15",
    "@radix-ui/react-navigation-menu": "^1.2.13",
    "@radix-ui/react-popover": "^1.1.14",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-radio-group": "^1.3.7",
    "@radix-ui/react-scroll-area": "^1.2.9",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slider": "^1.3.5",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.5",
    "@radix-ui/react-tabs": "^1.1.12",
    "@radix-ui/react-toast": "^1.2.14",
    "@radix-ui/react-toggle": "^1.1.9",
    "@radix-ui/react-toggle-group": "^1.1.10",
    "@radix-ui/react-tooltip": "^1.2.7",
    "@supabase/supabase-js": "^2.74.0",
    "@tanstack/react-query": "^5.83.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.462.0",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.61.1",
    "react-resizable-panels": "^2.1.9",
    "react-router-dom": "^6.30.1",
    "recharts": "^2.15.4",
    "sonner": "^1.7.4",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.9",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@capacitor/cli": "^6.0.0",
    "@eslint/js": "^9.32.0",
    "@tailwindcss/typography": "^0.5.16",
    "@types/node": "^22.16.5",
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react-swc": "^3.11.0",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.32.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^15.15.0",
    "lovable-tagger": "^1.1.10",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.38.0",
    "vite": "^5.4.19"
  }
}
```

### 1.3 Environment Variables

```bash
# .env.example

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Stripe Configuration (for web payments)
VITE_STRIPE_SEED_PRICE_ID=price_xxxx
VITE_STRIPE_SERIES_Z_PRICE_ID=price_xxxx

# RevenueCat Configuration (for iOS/Android in-app purchases)
VITE_REVENUECAT_IOS_API_KEY=appl_xxxx
VITE_REVENUECAT_ANDROID_API_KEY=goog_xxxx

# App URL (for Stripe redirects)
VITE_APP_URL=https://your-app-url.com

# Supabase Edge Function Environment Variables (set in Supabase dashboard):
# STRIPE_SECRET_KEY=sk_xxxx
# STRIPE_WEBHOOK_SECRET=whsec_xxxx
# STRIPE_SEED_PRICE_ID=price_xxxx
# STRIPE_SERIES_Z_PRICE_ID=price_xxxx
# REVENUECAT_API_KEY=xxxx
# APP_URL=https://your-app-url.com
# LOVABLE_API_KEY=xxxx (for AI analysis)
```

### 1.4 Build Configuration Files

#### vite.config.ts
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
```

#### tsconfig.json
```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "noImplicitAny": false,
    "noUnusedParameters": false,
    "skipLibCheck": true,
    "allowJs": true,
    "noUnusedLocals": false,
    "strictNullChecks": false
  }
}
```

#### capacitor.config.ts
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.podvisor.app',
  appName: 'Podvisor',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#000000',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    allowsLinkPreview: false,
  },
};

export default config;
```

---

## 🎨 SECTION 2: DESIGN SYSTEM & UI

### 2.1 Color Palette (HSL Values)

```css
/* Light Theme */
--background: 0 0% 100%;           /* #FFFFFF */
--foreground: 240 10% 3.9%;        /* #0A0A0B */
--card: 0 0% 100%;                 /* #FFFFFF */
--card-foreground: 240 10% 3.9%;   /* #0A0A0B */
--popover: 0 0% 100%;              /* #FFFFFF */
--popover-foreground: 240 10% 3.9%;
--primary: 142 76% 36%;            /* #16A34A - Green */
--primary-foreground: 0 0% 100%;   /* #FFFFFF */
--secondary: 240 4.8% 95.9%;       /* #F5F5F6 */
--secondary-foreground: 240 5.9% 10%;
--muted: 240 4.8% 95.9%;           /* #F5F5F6 */
--muted-foreground: 240 3.8% 46.1%;
--accent: 217 91% 60%;             /* #3B82F6 - Blue */
--accent-foreground: 0 0% 100%;
--destructive: 0 84.2% 60.2%;      /* #EF4444 - Red */
--destructive-foreground: 0 0% 98%;
--border: 240 5.9% 90%;
--input: 240 5.9% 90%;
--ring: 142 76% 36%;               /* Primary green */
--radius: 0.75rem;                 /* 12px */

/* Dark Theme */
--background: 240 10% 3.9%;        /* #0A0A0B */
--foreground: 0 0% 98%;            /* #FAFAFA */
--card: 240 10% 7%;
--card-foreground: 0 0% 98%;
--primary: 142 76% 36%;            /* Same green */
--secondary: 240 3.7% 15.9%;
--muted: 240 3.7% 15.9%;
--accent: 217 91% 60%;             /* Same blue */
--destructive: 0 62.8% 30.6%;
--border: 240 3.7% 15.9%;

/* Gradients */
--gradient-primary: linear-gradient(135deg, hsl(142 76% 36%), hsl(174 72% 56%));
--gradient-hero: linear-gradient(180deg, hsl(0 0% 100%), hsl(240 4.8% 95.9%));
--shadow-elegant: 0 10px 30px -10px hsl(142 76% 36% / 0.2);
--shadow-card: 0 2px 8px hsl(240 10% 3.9% / 0.05);
```

### 2.2 Typography

- **Font Family:** System font stack (default Tailwind)
- **Heading Sizes:**
  - h1: `text-5xl md:text-6xl lg:text-7xl font-bold`
  - h2: `text-2xl md:text-3xl lg:text-4xl font-bold`
  - h3: `text-xl font-semibold`
  - h4: `font-medium`
- **Body:** `text-base` (16px)
- **Small:** `text-sm` (14px), `text-xs` (12px)

### 2.3 Spacing Scale

Uses Tailwind's default spacing: `0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64`

### 2.4 Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1400px /* Container max-width */
```

### 2.5 Component Library: shadcn/ui

All 54 shadcn/ui components are installed with the "default" style and "slate" base color:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## 🗄️ SECTION 3: DATABASE SCHEMA

### 3.1 Enums

```sql
-- Subscription tiers
CREATE TYPE subscription_tier AS ENUM ('free', 'seed', 'series_z');

-- Startup stages
CREATE TYPE startup_stage AS ENUM (
  'pre_seed', 'seed', 'series_a', 'series_b_plus',
  'growth', 'public', 'bootstrapped'
);

-- User roles
CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');
```

### 3.2 Tables

#### podcasts
```sql
CREATE TABLE podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### companies
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  founding_year INTEGER,
  current_stage TEXT,
  funding_raised TEXT,
  valuation TEXT,
  employee_count INTEGER,
  industry TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### episodes
```sql
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  release_date DATE,
  url TEXT NOT NULL,
  platform TEXT DEFAULT 'YouTube',
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  founder_names TEXT,
  analysis_status TEXT DEFAULT 'pending',
  analyzed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### lessons
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  lesson_text TEXT NOT NULL,
  impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 10),
  actionability_score INTEGER CHECK (actionability_score >= 1 AND actionability_score <= 10),
  category TEXT,
  founder_attribution TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### chavel_callouts
```sql
CREATE TABLE chavel_callouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  callout_text TEXT NOT NULL,
  relevance_score INTEGER CHECK (relevance_score >= 1 AND relevance_score <= 10),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### user_startup_profiles
```sql
CREATE TABLE user_startup_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_website TEXT,
  stage startup_stage NOT NULL,
  funding_raised TEXT,
  valuation TEXT,
  employee_count INTEGER,
  industry TEXT,
  description TEXT NOT NULL,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### personalized_insights
```sql
CREATE TABLE personalized_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  startup_profile_id UUID REFERENCES user_startup_profiles(id) ON DELETE CASCADE,
  personalized_text TEXT NOT NULL,
  relevance_score INTEGER CHECK (relevance_score >= 1 AND relevance_score <= 10),
  action_items JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### bookmark_folders
```sql
CREATE TABLE bookmark_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### bookmarked_episodes
```sql
CREATE TABLE bookmarked_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES bookmark_folders(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, episode_id),
  UNIQUE(episode_id, folder_id, user_id)
);
```

#### bookmarked_lessons
```sql
CREATE TABLE bookmarked_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES bookmark_folders(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
```

#### user_subscriptions
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  revenuecat_app_user_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
```

#### user_monthly_usage
```sql
CREATE TABLE user_monthly_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,  -- Format: YYYY-MM
  analyses_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, month_year)
);
```

#### user_roles
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);
```

### 3.3 Database Functions

```sql
-- Increment analysis count for usage tracking
CREATE OR REPLACE FUNCTION increment_analysis_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_usage user_monthly_usage;
  v_month_year TEXT;
BEGIN
  v_month_year := TO_CHAR(NOW(), 'YYYY-MM');
  INSERT INTO user_monthly_usage (user_id, month_year, analyses_count)
  VALUES (p_user_id, v_month_year, 1)
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET
    analyses_count = user_monthly_usage.analyses_count + 1,
    updated_at = NOW()
  RETURNING * INTO v_usage;
  RETURN v_usage.analyses_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check tier limits and return usage stats
CREATE OR REPLACE FUNCTION check_tier_limits(p_user_id UUID)
RETURNS JSON AS $$
  -- Returns JSON with tier, profiles (max/used), bookmarks (max/used), analyses (max/used)
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION has_role(_user_id uuid, _role app_role)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = _role
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

### 3.4 Row Level Security (RLS) Policies

All tables have RLS enabled with the following pattern:
- **Public tables (podcasts, companies, episodes, lessons, chavel_callouts):** Public read access, public insert
- **User-owned tables:** Only the owner can view/modify their own records
- **Admin tables:** Admins can view/modify all records

---

## 📱 SECTION 4: FEATURES & FUNCTIONALITY

### 4.1 Authentication Flow

1. **Sign Up:** Email + password registration via Supabase Auth
2. **Sign In:** Email + password login
3. **Password Reset:** Email-based reset flow
4. **Session Management:** Auto-refresh tokens, persistent sessions
5. **Sign Out:** Clear session and redirect

### 4.2 Episode Analysis Flow

1. User enters podcast episode URL (YouTube or Spotify)
2. Optionally provides podcast series name
3. Optionally provides startup profile for personalization
4. System checks subscription limits (analyses per month)
5. Calls `analyze-episode` Edge Function which:
   - Validates URL and extracts video metadata
   - Calls AI API (Gemini 2.5 Flash via Lovable gateway)
   - Uses structured tool calling to extract:
     - Episode metadata (title, release date, founders)
     - Company data (name, stage, funding, valuation, industry)
     - 10 tactical lessons (with impact/actionability scores 1-10)
     - 5 startup-relevant callouts
   - Stores all data in Supabase
   - Generates personalized insights for each lesson
6. Returns episode ID for viewing

### 4.3 Subscription Tiers

| Feature | Free | Seed ($4.99/mo) | Series Z ($14.99/mo) |
|---------|------|-----------------|---------------------|
| Startup Profiles | 1 | 3 | 10 |
| Bookmarks | 5 total | 30 (10/profile) | 100 (10/profile) |
| Analyses/Month | 4 | 10 | 25 |
| Personalized Insights | Basic | Full | Advanced |
| Export | ❌ | CSV/JSON | CSV/JSON/Markdown |

### 4.4 Bookmark System

- **Folders:** Color-coded folders to organize bookmarks
- **Quick Bookmark:** Single click adds to "Default" folder
- **Folder Menu:** Right-click or hold to select folder
- **Notes:** Add personal notes to bookmarks
- **Move:** Drag bookmarks between folders

### 4.5 Export Functionality

Three export formats supported:
1. **CSV:** Spreadsheet-compatible with lessons and personalized insights
2. **JSON:** Full structured data export
3. **Markdown:** Readable document format with formatting

---

## ⚙️ SECTION 5: EDGE FUNCTIONS

### 5.1 analyze-episode

**Purpose:** AI-powered podcast analysis
**Trigger:** POST request with episodeUrl, optional podcastName and startupProfile
**Process:**
1. Validate user subscription limits
2. Extract YouTube metadata if applicable
3. Call AI with structured tool calling
4. Store episode, company, lessons, callouts in database
5. Generate personalized insights for user's profile
6. Increment usage counter

**AI Model:** `google/gemini-2.5-flash` via Lovable AI Gateway

### 5.2 create-checkout-session

**Purpose:** Create Stripe checkout session for subscription upgrade
**Trigger:** POST with priceId and userId
**Process:**
1. Get or create Stripe customer
2. Store customer ID in user_subscriptions
3. Create checkout session with success/cancel URLs
4. Return checkout URL

### 5.3 create-portal-session

**Purpose:** Create Stripe customer portal session
**Trigger:** POST with userId
**Process:**
1. Look up Stripe customer ID
2. Create portal session
3. Return portal URL

### 5.4 stripe-webhook

**Purpose:** Handle Stripe webhook events
**Events Handled:**
- `checkout.session.completed`: Update subscription tier
- `customer.subscription.updated`: Update period dates, cancel status
- `customer.subscription.deleted`: Downgrade to free
- `invoice.payment_failed`: Log for potential notification

---

## 🖼️ SECTION 6: UI COMPONENTS SPECIFICATION

### 6.1 PublicLanding Component

**Purpose:** Marketing landing page for non-authenticated users

**Structure:**
- Fixed navigation bar with logo, Sign In button, Get Started CTA
- Hero section with gradient background, hero image overlay
- Animated headline with gradient text
- Feature cards (3): AI-Powered Analysis, Actionable Insights, Tailored to You
- Social proof section with metrics (500+ episodes, 2000+ lessons, 100+ founders)
- Final CTA section
- Footer with copyright

### 6.2 HeroSection Component

**Purpose:** Header for authenticated dashboard

**Structure:**
- Same visual style as PublicLanding hero
- Title: "Founder Lessons Database"
- Subtitle about extracting insights
- 3 feature cards

### 6.3 AnalysisForm Component

**Purpose:** Episode URL input and analysis trigger

**Features:**
- Usage counter display (X/Y analyses used)
- Tab toggle: "By Podcast Series" vs "Direct URL"
- URL input with podcast name autocomplete
- Popular podcasts datalist
- Multi-step flow: Episode → Profile → Analyze
- Upgrade prompt when limit reached

### 6.4 EpisodesTable Component

**Purpose:** List all analyzed episodes

**Features:**
- Header with episode count and Export All button
- Industry filter badges (click to filter)
- Data table with columns: Episode, Company, Founders, Stage, Industry, Actions
- Row actions: View, Bookmark, Watch/Listen, Export, Copy Link, Delete
- Click row to view details
- Delete confirmation with cascade warning

### 6.5 EpisodeDetail Component

**Purpose:** Full episode view with lessons

**Structure:**
- Back button
- Episode title, founders, release date
- External link button (Watch/Listen)
- Company Snapshot panel (name, founded, stage, industry, status)
- Metrics panel (funding, valuation, employees)
- Lessons section with numbered cards
- Personalized Insights section (gradient background)
- Callouts section (accent background)

### 6.6 ProfileSettings Component

**Purpose:** Manage startup profiles and bookmarks (side panel)

**Structure:**
- 3 tabs: Profiles, Bookmarks, Plan
- **Profiles Tab:**
  - Usage counter
  - New Profile button
  - Profile cards with edit/delete
- **Bookmarks Tab:**
  - Folder list with color dots
  - New Folder button
  - Selected folder's episodes
  - Move/Notes/Remove actions
- **Plan Tab:**
  - UsageDisplay component

### 6.7 Subscription Components

**UpgradePrompt:** Compact or full upgrade CTA with feature list
**PricingPlans:** 3-column tier comparison with CTAs
**UsageDisplay:** Progress bars for profiles, bookmarks, analyses
**SubscriptionModal:** Full-screen modal with usage + plans tabs

---

## 🔄 SECTION 7: STATE MANAGEMENT

### 7.1 React Query (Server State)

Used for all Supabase data fetching with automatic caching and revalidation.

### 7.2 Context Providers

**SubscriptionContext:**
- Current subscription info (tier, limits, usage)
- Loading/error states
- Methods: canCreateProfile(), canCreateBookmark(), canAnalyzeVideo()
- Methods: upgradeTo(tier), manageSubscription(), restorePurchases()
- RevenueCat integration for native platforms

**ThemeProvider:**
- Wraps next-themes for light/dark/system theme

### 7.3 Local State Patterns

- useState for component-level UI state
- Custom event for cross-component communication (episodeAnalyzed)

---

## 🔐 SECTION 8: AUTHENTICATION & SECURITY

### 8.1 Supabase Auth

- Email/password authentication
- Password reset via email
- Session persistence in localStorage
- Auto token refresh

### 8.2 Row Level Security

All user data is protected by RLS policies ensuring users can only access their own data.

### 8.3 Edge Function Security

- CORS headers for cross-origin requests
- Bearer token validation for user identification
- Service role key for database operations
- Stripe signature verification for webhooks

---

## 📦 SECTION 9: NATIVE APP (CAPACITOR)

### 9.1 Plugins Used

- `@capacitor/app`: App lifecycle, deep links
- `@capacitor/status-bar`: Status bar styling
- `@capacitor/splash-screen`: Launch screen
- `@capacitor/keyboard`: Keyboard handling
- `@capacitor/haptics`: Haptic feedback
- `@revenuecat/purchases-capacitor`: In-app purchases

### 9.2 Native Initialization

```typescript
// lib/capacitor.ts
- initializeNativePlugins(): Status bar, keyboard, app listeners, splash hide
- handleBackButton(): Android back button handling
- triggerHapticFeedback(): Light/medium/heavy haptics
```

### 9.3 RevenueCat Integration

- Initialize with platform-specific API key
- Identify user after authentication
- Check entitlements for subscription status
- Purchase packages for in-app subscriptions
- Restore purchases for account recovery

---

## 🚀 SECTION 10: DEPLOYMENT

### 10.1 Web Deployment

1. Run `npm run build` to create production build in `/dist`
2. Deploy to Vercel, Netlify, or any static hosting
3. Configure environment variables

### 10.2 Native Deployment

1. Run `npm run cap:build` to build and sync
2. Run `npx cap open ios` or `npx cap open android`
3. Archive and submit via Xcode/Android Studio

### 10.3 Supabase Setup

1. Create new Supabase project
2. Run all migrations in order
3. Deploy Edge Functions
4. Configure environment secrets
5. Set up Stripe webhook endpoint

---

## 📝 SECTION 11: REPLICATION PROMPT

Copy the following prompt into Vibe Code to recreate this application:

---

**PROMPT START:**

Create a React 18 + TypeScript + Vite application called "Podvisor" (Founder Lessons Database) with the following complete specifications:

## TECH STACK
- React 18.3.1 with TypeScript 5.8.3
- Vite 5.4.19 as build tool
- Tailwind CSS 3.4.17 with tailwindcss-animate
- shadcn/ui with "default" style and "slate" base color (install ALL 54 components)
- Supabase for authentication and database
- React Router DOM 6.30.1 for routing
- TanStack React Query 5.83.0 for server state
- Lucide React 0.462.0 for icons
- Capacitor 6.0.0 for native iOS/Android
- RevenueCat for in-app purchases
- Stripe for web subscriptions

## DESIGN SYSTEM
Use this exact color palette in CSS variables:
- Primary: HSL 142 76% 36% (green #16A34A)
- Accent: HSL 217 91% 60% (blue #3B82F6)
- Destructive: HSL 0 84.2% 60.2% (red #EF4444)
- Background: white (light) / HSL 240 10% 3.9% (dark)
- Border radius: 0.75rem
- Support light/dark/system themes via next-themes

## ROUTES
- `/` - Main dashboard (Index.tsx) - shows PublicLanding if not authenticated
- `/auth` - Authentication page with Sign In/Sign Up tabs
- `/account` - Account settings and subscription management
- `/*` - 404 Not Found

## DATABASE (Supabase)
Create these tables with full RLS:
1. podcasts (id, name, description)
2. companies (id, name, founding_year, current_stage, funding_raised, valuation, employee_count, industry, status)
3. episodes (id, podcast_id, title, release_date, url, platform, company_id, founder_names, analysis_status, analyzed_by)
4. lessons (id, episode_id, lesson_text, impact_score 1-10, actionability_score 1-10, category, founder_attribution)
5. chavel_callouts (id, episode_id, callout_text, relevance_score 1-10)
6. user_startup_profiles (id, user_id, company_name, company_website, stage ENUM, funding_raised, valuation, employee_count, industry, description, role)
7. personalized_insights (id, lesson_id, startup_profile_id, personalized_text, relevance_score, action_items JSONB)
8. bookmark_folders (id, user_id, name, description, color)
9. bookmarked_episodes (id, user_id, episode_id, folder_id, notes)
10. user_subscriptions (id, user_id, tier ENUM free/seed/series_z, stripe_customer_id, stripe_subscription_id, current_period_start/end, cancel_at_period_end)
11. user_monthly_usage (id, user_id, month_year TEXT, analyses_count)
12. user_roles (id, user_id, role ENUM admin/moderator/user)

## SUBSCRIPTION TIERS
- Free: 1 profile, 5 bookmarks, 4 analyses/month
- Seed ($4.99/mo): 3 profiles, 30 bookmarks, 10 analyses/month
- Series Z ($14.99/mo): 10 profiles, 100 bookmarks, 25 analyses/month

## CORE FEATURES
1. Episode Analysis:
   - Input YouTube/Spotify URL
   - AI extracts 10 lessons + 5 startup callouts
   - Stores company data (funding, valuation, stage)
   - Generates personalized insights based on user's startup profile

2. Bookmarks:
   - Create colored folders
   - Save episodes to folders
   - Add personal notes
   - Move between folders

3. Profiles:
   - Create startup profiles (company name, stage, funding, description)
   - Select profile during analysis for personalization
   - Limit based on subscription tier

4. Export:
   - CSV, JSON, Markdown formats
   - Single episode or all episodes
   - Includes lessons and personalized insights

## EDGE FUNCTIONS (Supabase)
1. analyze-episode: AI analysis with Gemini 2.5 Flash
2. create-checkout-session: Stripe checkout
3. create-portal-session: Stripe customer portal
4. stripe-webhook: Handle subscription events

## UI COMPONENTS (Custom)
- PublicLanding: Marketing page with hero, features, social proof
- HeroSection: Authenticated dashboard header
- AnalysisForm: URL input with profile selection
- EpisodesTable: Sortable table with industry filters
- EpisodeDetail: Full view with lessons and insights
- ProfileSettings: Side panel with profiles/bookmarks/plan tabs
- BookmarkButton: Quick bookmark with folder popover
- ExportModal: Format selection dialog
- Subscription components: UsageDisplay, PricingPlans, UpgradePrompt

## NATIVE (Capacitor)
- App ID: com.podvisor.app
- Splash screen: Black background, 2s duration
- Status bar: Default style, black background
- Back button handling for Android
- RevenueCat for iOS/Android subscriptions

Build this as a production-ready application with full authentication, subscription management, and AI-powered podcast analysis capabilities.

**PROMPT END**

---

## ✅ SECTION 12: VERIFICATION CHECKLIST

After recreation, verify:

- [ ] All routes work correctly
- [ ] Authentication flow (signup, signin, signout, reset)
- [ ] Theme toggle (light/dark/system)
- [ ] Episode analysis submits and returns results
- [ ] Lessons display with scores and categories
- [ ] Personalized insights generate based on profile
- [ ] Bookmarks create, move, delete properly
- [ ] Folders create, edit, delete with color
- [ ] Profiles create, edit, delete with limits
- [ ] Subscription limits enforce correctly
- [ ] Export generates all three formats
- [ ] Usage counters update accurately
- [ ] Stripe checkout flow works
- [ ] Native builds compile for iOS/Android

---

*Generated: January 8, 2026*
*Application: Podvisor (Founder Lessons Database)*
*Version: 1.0.0*
