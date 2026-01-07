# Real-time Activity Feed - Implementation Plan

## Overview

This document outlines the architecture and implementation strategy for a real-time Activity Feed component featuring glassmorphism design, smooth animations, and responsive data handling.

---

## Component Architecture

### 1. **ActivityFeed** (Container Component)

**Responsibilities:**

- Fetch and manage feed data from API/WebSocket
- Handle real-time updates and polling logic
- Manage loading, error, and empty states
- Orchestrate animation sequences for incoming items
- Implement infinite scroll or pagination

**Props Interface:**

```typescript
interface ActivityFeedProps {
  userId?: string; // Filter by specific user
  limit?: number; // Items per page (default: 20)
  autoRefresh?: boolean; // Enable polling (default: true)
  refreshInterval?: number; // Polling interval in ms (default: 5000)
  className?: string;
}
```

**Key Features:**

- Real-time polling with configurable intervals
- Optimistic UI updates
- Staggered animation for batch items
- Virtual scrolling for performance (large datasets)

---

### 2. **FeedItem** (Presentation Component)

**Responsibilities:**

- Render individual activity entry
- Display user avatar, action description, timestamp
- Handle item-specific interactions (like, comment, expand)
- Apply glassmorphism styling
- Support different activity types with custom layouts

**Props Interface:**

```typescript
interface FeedItemProps {
  activity: Activity;
  isNew?: boolean; // Highlight newly arrived items
  onInteraction?: (type: string) => void;
  className?: string;
}
```

**Variants by Activity Type:**

- `vote` - Show bill name, vote choice (For/Against/Abstain)
- `comment` - Display comment preview with expand option
- `document` - Show document icon and title
- `session` - Display session attendance or participation
- `achievement` - Highlight milestone or badge earned

---

### 3. **StatusBadge** (Micro Component)

**Responsibilities:**

- Display activity status or category
- Apply semantic color coding
- Support icon integration
- Animated entrance

**Props Interface:**

```typescript
interface StatusBadgeProps {
  status: ActivityStatus;
  variant?: "default" | "outlined" | "minimal";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  className?: string;
}

type ActivityStatus =
  | "voted"
  | "commented"
  | "uploaded"
  | "attended"
  | "achieved";
```

**Color Mapping:**

- `voted` → Neon Cyan (`#00F0FF`)
- `commented` → Electric Purple (`#A855F7`)
- `uploaded` → Amber (`#F59E0B`)
- `attended` → Emerald (`#10B981`)
- `achieved` → Rose (`#F43F5E`)

---

## Styling Strategy

### Tailwind CSS Utilities

#### Core Glassmorphism Classes

```css
/* Base glass card */
.glass-card {
  @apply bg-white/5 backdrop-blur-md border border-white/10;
  @apply shadow-lg shadow-black/20;
}

/* Hover state enhancement */
.glass-card-hover {
  @apply hover:bg-white/10 hover:border-white/20;
  @apply transition-all duration-300;
}

/* Dark mode support */
.dark .glass-card {
  @apply bg-black/20 border-white/5;
}
```

#### Typography & Spacing

```css
.feed-timestamp {
  @apply text-xs text-gray-400 dark:text-gray-500;
}

.feed-title {
  @apply text-sm font-semibold text-gray-900 dark:text-white;
}

.feed-description {
  @apply text-sm text-gray-600 dark:text-gray-300;
}
```

#### Status Badge Variants

```css
.badge-voted {
  @apply bg-cyan-500/20 text-cyan-400 border border-cyan-500/30;
}

.badge-commented {
  @apply bg-purple-500/20 text-purple-400 border border-purple-500/30;
}

.badge-uploaded {
  @apply bg-amber-500/20 text-amber-400 border border-amber-500/30;
}

.badge-attended {
  @apply bg-emerald-500/20 text-emerald-400 border border-emerald-500/30;
}

.badge-achieved {
  @apply bg-rose-500/20 text-rose-400 border border-rose-500/30;
}
```

---

## Animation Strategy with Framer Motion

### Entry Animations

#### 1. **Staggered List Animation**

```typescript
// Container animation config
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // 100ms delay between items
      delayChildren: 0.2,
    },
  },
};

// Item animation config
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
};
```

#### 2. **New Item Highlight Animation**

```typescript
const newItemVariants = {
  initial: {
    opacity: 0,
    x: -50,
    backgroundColor: "rgba(0, 240, 255, 0.2)", // Cyan glow
  },
  animate: {
    opacity: 1,
    x: 0,
    backgroundColor: "rgba(0, 240, 255, 0)",
    transition: {
      duration: 0.6,
      backgroundColor: { duration: 2, delay: 0.5 },
    },
  },
};
```

#### 3. **Status Badge Pulse**

```typescript
const badgePulse = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};
```

#### 4. **Scroll-triggered Animation**

```typescript
// Using Framer Motion's whileInView
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-100px' }}
  transition={{ duration: 0.5 }}
>
  <FeedItem {...props} />
</motion.div>
```

### Exit Animations (for dismissed items)

```typescript
const exitVariants = {
  exit: {
    opacity: 0,
    x: 100,
    transition: {
      duration: 0.3,
    },
  },
};
```

---

## JSON Mock Data Structure

### Activity Entity Schema

```json
{
  "activities": [
    {
      "id": "act_001",
      "type": "vote",
      "userId": "mp_012",
      "userName": "Audronė Pitrėnienė",
      "userAvatar": "/avatars/mp_012.jpg",
      "timestamp": "2026-01-07T08:45:23Z",
      "data": {
        "billId": "bill_789",
        "billTitle": "Dėl Lietuvos Respublikos aplinkos apsaugos įstatymo pakeitimo",
        "voteChoice": "for",
        "sessionId": "session_456"
      },
      "metadata": {
        "isHighlighted": false,
        "isNew": true,
        "category": "legislation"
      }
    },
    {
      "id": "act_002",
      "type": "comment",
      "userId": "mp_034",
      "userName": "Kęstutis Masiulis",
      "userAvatar": "/avatars/mp_034.jpg",
      "timestamp": "2026-01-07T08:32:11Z",
      "data": {
        "billId": "bill_654",
        "billTitle": "Dėl mokesčių reformos",
        "commentPreview": "Pritariu šiam įstatymui, tačiau siūlau...",
        "commentFull": "Pritariu šiam įstatymui, tačiau siūlau papildyti 15 straipsnį nuostata dėl...",
        "commentLength": 340
      },
      "metadata": {
        "isHighlighted": false,
        "isNew": false,
        "category": "discussion"
      }
    },
    {
      "id": "act_003",
      "type": "document",
      "userId": "mp_091",
      "userName": "Viktorija Čmilytė-Nielsen",
      "userAvatar": "/avatars/mp_091.jpg",
      "timestamp": "2026-01-07T08:15:47Z",
      "data": {
        "documentId": "doc_332",
        "documentTitle": "Komiteto ataskaita Nr. KA-234",
        "documentType": "report",
        "fileSize": "2.4 MB",
        "downloadUrl": "/documents/doc_332.pdf"
      },
      "metadata": {
        "isHighlighted": false,
        "isNew": false,
        "category": "documents"
      }
    },
    {
      "id": "act_004",
      "type": "session",
      "userId": "mp_056",
      "userName": "Gabrielius Landsbergis",
      "userAvatar": "/avatars/mp_056.jpg",
      "timestamp": "2026-01-07T07:58:00Z",
      "data": {
        "sessionId": "session_456",
        "sessionTitle": "Seimo posėdis Nr. 145",
        "participationType": "attended",
        "duration": 180
      },
      "metadata": {
        "isHighlighted": false,
        "isNew": false,
        "category": "sessions"
      }
    },
    {
      "id": "act_005",
      "type": "achievement",
      "userId": "mp_023",
      "userName": "Radvilė Morkūnaitė-Mikulėnienė",
      "userAvatar": "/avatars/mp_023.jpg",
      "timestamp": "2026-01-07T07:30:12Z",
      "data": {
        "achievementId": "ach_100votes",
        "title": "100 Balsavimų",
        "description": "Dalyvavo 100 balsavimų per mėnesį",
        "iconUrl": "/badges/100votes.svg",
        "rarity": "rare"
      },
      "metadata": {
        "isHighlighted": true,
        "isNew": false,
        "category": "achievements"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 12,
    "totalItems": 234,
    "itemsPerPage": 20,
    "hasNext": true,
    "hasPrevious": false
  },
  "filters": {
    "availableTypes": ["vote", "comment", "document", "session", "achievement"],
    "availableCategories": [
      "legislation",
      "discussion",
      "documents",
      "sessions",
      "achievements"
    ],
    "dateRange": {
      "start": "2026-01-01T00:00:00Z",
      "end": "2026-01-07T23:59:59Z"
    }
  }
}
```

### TypeScript Type Definitions

```typescript
type ActivityType = "vote" | "comment" | "document" | "session" | "achievement";

type VoteChoice = "for" | "against" | "abstain";

interface BaseActivity {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  userAvatar: string;
  timestamp: string;
  metadata: {
    isHighlighted: boolean;
    isNew: boolean;
    category: string;
  };
}

interface VoteActivity extends BaseActivity {
  type: "vote";
  data: {
    billId: string;
    billTitle: string;
    voteChoice: VoteChoice;
    sessionId: string;
  };
}

interface CommentActivity extends BaseActivity {
  type: "comment";
  data: {
    billId: string;
    billTitle: string;
    commentPreview: string;
    commentFull: string;
    commentLength: number;
  };
}

// ... other activity type interfaces

type Activity =
  | VoteActivity
  | CommentActivity
  | DocumentActivity
  | SessionActivity
  | AchievementActivity;
```

---

## Performance Considerations

### Optimization Strategies

1. **Virtualization**
   - Implement `react-window` or `react-virtual` for large datasets
   - Only render visible items in viewport
   - Target: Handle 1000+ items smoothly

2. **Memoization**
   - Use `React.memo()` for `FeedItem` components
   - Memoize expensive calculations with `useMemo()`
   - Cache API responses with React Query or SWR

3. **Animation Performance**
   - Use `transform` and `opacity` for GPU acceleration
   - Limit simultaneous animations (max 20 staggered items)
   - Apply `layout` animations sparingly (expensive)

4. **Data Fetching**
   - Implement cursor-based pagination
   - Use WebSocket for real-time updates (fallback to polling)
   - Debounce scroll events (150ms)

---

## Accessibility Requirements

- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Readers**: Proper ARIA labels and live regions for updates
- **Focus Management**: Visible focus indicators with high contrast
- **Reduced Motion**: Respect `prefers-reduced-motion` media query
- **Color Contrast**: Ensure WCAG AA compliance (4.5:1 minimum)

---

## Testing Strategy

### Unit Tests

- Component rendering with various props
- Animation variant calculations
- Status badge color mapping

### Integration Tests

- Data fetching and display
- Real-time updates handling
- Infinite scroll behavior

### Visual Regression Tests

- Glassmorphism styling consistency
- Animation smoothness
- Dark mode appearance

---

## Implementation Phases

### Phase 1: Core Components

- [ ] Create `ActivityFeed` container
- [ ] Implement `FeedItem` with variants
- [ ] Build `StatusBadge` component

### Phase 2: Styling & Animation

- [ ] Apply Tailwind glassmorphism styles
- [ ] Integrate Framer Motion animations
- [ ] Add dark mode support

### Phase 3: Data Integration

- [ ] Connect to API/tRPC endpoints
- [ ] Implement real-time polling
- [ ] Add pagination logic

### Phase 4: Polish & Optimization

- [ ] Add virtualization
- [ ] Performance profiling
- [ ] Accessibility audit

---

## Next Steps

1. Review and approve this implementation plan
2. Set up component file structure
3. Create TypeScript interfaces
4. Begin Phase 1 implementation
5. Iterate with design feedback

---

**Last Updated:** 2026-01-07  
**Author:** Senior Architect  
**Status:** Awaiting Approval
