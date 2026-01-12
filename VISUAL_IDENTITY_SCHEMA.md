# Visual Identity Schema
**Skaidrus Seimas Design System**

---

## 1. Core Foundations

### Color Palette

**Primary Colors:**
- **Primary:** `hsl(217.2, 91.2%, 59.8%)` → `#3B82F6` (Bright Blue/Cyan)
- **Primary Foreground:** `hsl(222.2, 47.4%, 11.2%)` → `#0F172A` (Dark Blue-Black)

**Background Colors:**
- **Background:** `hsl(222.2, 84%, 4.9%)` → `#0A0E1A` (Very Dark Blue-Black)
- **Foreground:** `hsl(210, 40%, 98%)` → `#F8FAFC` (Near White)
- **Surface Dark:** `#1B2A38` / `#233648` (Dark Blue-Gray - used extensively for cards)
- **Surface Border:** `rgba(255, 255, 255, 0.1)` / `rgba(146, 173, 201, 0.3)` (Subtle white/cyan border)

**Secondary Colors:**
- **Secondary:** `hsl(217.2, 32.6%, 17.5%)` → `#1E293B` (Dark Slate)
- **Secondary Foreground:** `hsl(210, 40%, 98%)` → `#F8FAFC` (Near White)

**Accent Colors:**
- **Accent:** `hsl(217.2, 32.6%, 17.5%)` → `#1E293B` (Dark Slate)
- **Accent Cyan/Blue:** `#92ADC9` (Used for muted text and icons - "Brand Soul" color)
- **Muted:** `hsl(217.2, 32.6%, 17.5%)` → `#1E293B` (Dark Slate)
- **Muted Foreground:** `hsl(215, 20.2%, 65.1%)` → `#94A3B8` (Light Gray)

**Destructive:**
- **Destructive:** `hsl(0, 62.8%, 30.6%)` → `#991B1B` (Dark Red)
- **Destructive Foreground:** `hsl(210, 40%, 98%)` → `#F8FAFC` (Near White)

**Glassmorphism Colors:**
- **Glass Background:** `rgba(255, 255, 255, 0.05)` → `bg-white/5`
- **Glass Background Hover:** `rgba(255, 255, 255, 0.1)` → `bg-white/10`
- **Glass Border:** `rgba(255, 255, 255, 0.1)` → `border-white/10`
- **Glass Border Hover:** `rgba(255, 255, 255, 0.2)` → `border-white/20`

**Custom Surface Colors (Inferred from usage):**
- **Dark Surface:** `#1B2A38` (Dark Blue-Gray for cards/panels)
- **Medium Surface:** `#233648` (Slightly lighter for interactive elements)
- **Hover Surface:** `#2D455D` (Hover state for interactive elements)
- **Border Color:** `rgba(255, 255, 255, 0.1)` or `rgba(146, 173, 201, 0.3)` (Subtle borders)

**Brand Soul Color:** `#92ADC9` (Light Cyan-Blue) - Used extensively for secondary text, icons, and accents. This is the signature color that gives the UI its distinctive "glassy cyan" feel.

**Party Colors (Dynamic):**
- Blue: `bg-blue-500/20`, `text-blue-400`, `border-blue-500/30`
- Red: `bg-red-500/20`, `text-red-400`, `border-red-500/30`
- Amber: `bg-amber-500/20`, `text-amber-400`, `border-amber-500/30`
- Orange: `bg-orange-500/20`, `text-orange-400`, `border-orange-500/30`
- Purple: `bg-purple-500/20`, `text-purple-400`, `border-purple-500/30`
- Green: `bg-green-500/20`, `text-green-400`, `border-green-500/30`
- Pink: `bg-pink-500/20`, `text-pink-400`, `border-pink-500/30`
- Default (Slate): `bg-slate-500/20`, `text-slate-400`, `border-slate-500/30`

---

### Typography

**Font Families:**
- **System Stack:** Uses system default (Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif implied)

**Font Size Hierarchy:**
- **H1/Page Title:** `text-2xl` (24px) - `font-bold` (700)
- **H2/Card Title:** `text-xl` (20px) - `font-semibold` (600) / `font-bold` (700)
- **H3/Section Title:** `text-lg` (18px) - `font-semibold` (600)
- **Body Default:** `text-base` (16px) - `font-normal` (400)
- **Body Small:** `text-sm` (14px) - `font-normal` (400)
- **Caption/Labels:** `text-xs` (12px) - `font-medium` (500) / `font-bold` (700)

**Font Weights:**
- **Light:** 300 (rarely used)
- **Normal:** 400 (body text)
- **Medium:** 500 (labels, buttons)
- **Semibold:** 600 (titles, emphasis)
- **Bold:** 700 (headings, important text)
- **Black:** 900 (rarely used, e.g., `font-black` for special emphasis)

**Line Heights:**
- **Tight:** `leading-none` (1.0) - Used for card titles
- **Snug:** `leading-tight` (1.25)
- **Normal:** `leading-normal` (1.5) - Default for body text
- **Relaxed:** `leading-relaxed` (1.625)

**Letter Spacing:**
- **Default:** Normal
- **Wide:** `tracking-widest` - Used for uppercase badges (e.g., bill status)

**Text Colors:**
- **Primary Text:** `text-white` (#FFFFFF)
- **Secondary Text:** `text-[#92adc9]` (Cyan-Blue - Brand Soul)
- **Muted Text:** `text-muted-foreground` / `text-gray-400`
- **Error Text:** `text-red-400`

---

### Spacing & Radius

**Base Spacing Unit:** 4px (Tailwind default)

**Spacing Scale:**
- **xs:** 0.5rem (8px) - `p-2`, `gap-2`
- **sm:** 0.75rem (12px) - `p-3`, `gap-3`
- **md/default:** 1rem (16px) - `p-4`, `gap-4`
- **lg:** 1.5rem (24px) - `p-6`, `gap-6`
- **xl:** 2rem (32px) - `p-8`, `gap-8`
- **2xl:** 3rem (48px) - `p-12`, `gap-12`

**Padding Patterns:**
- **Buttons:** `px-4 py-2` (16px horizontal, 8px vertical) - default size
- **Cards:** `p-6` (24px) - standard card padding
- **Card Header:** `p-6` (24px)
- **Card Content:** `p-6 pt-0` (24px sides, 0 top)
- **Inputs:** `px-3 py-2` (12px horizontal, 8px vertical)
- **Large Inputs:** `px-4 py-3` (16px horizontal, 12px vertical)

**Gap Patterns:**
- **Card Internal:** `gap-4` (16px)
- **Grid Gaps:** `gap-4` (16px) - standard grid spacing
- **Flex Gaps:** `gap-2` (8px) - tight, `gap-4` (16px) - standard, `gap-6` (24px) - loose

**Border Radius:**
- **Small (Buttons, Badges):** `rounded-md` (6px)
- **Medium (Cards, Panels):** `rounded-lg` (8px)
- **Large (Cards, Containers):** `rounded-xl` (12px)
- **Full (Avatars, Pills):** `rounded-full` (9999px)

**Specific Use Cases:**
- **Buttons:** `rounded-md` (6px)
- **Cards:** `rounded-lg` (8px) or `rounded-xl` (12px)
- **Inputs:** `rounded-md` (6px) or `rounded-xl` (12px) for search
- **Avatars:** `rounded-full` (circular) or `rounded-xl` (12px) for square
- **Badges:** `rounded-md` (6px) or `rounded-lg` (8px)

---

### Shadows & Depth

**Design Philosophy:** Glassmorphism with subtle depth

**Shadow Classes:**
- **Shadow None:** `shadow-none`
- **Shadow Small:** `shadow-sm` - Subtle elevation
- **Shadow Default:** `shadow` - Standard elevation
- **Shadow Medium:** `shadow-md` - Moderate elevation (dropdowns, popovers)
- **Shadow Large:** `shadow-lg` - Significant elevation (hover states, cards)
- **Shadow XL:** `shadow-xl` - High elevation (modals, tooltips)
- **Shadow 2XL:** `shadow-2xl` - Maximum elevation (special elements like avatars)

**Custom Shadow Variations:**
- **Glass Shadow:** `shadow-xl shadow-black/20` - Used for glassmorphism panels
- **Colored Shadow:** `shadow-primary/20` - Blue tinted shadow for hover states
- **Custom Shadow:** `shadow-[0_-4px_10px_rgba(19,127,236,0.3)]` - Bottom glow effect

**Backdrop Blur:**
- **Subtle:** `backdrop-blur-sm` - Light blur effect
- **Medium:** `backdrop-blur-md` - Standard glassmorphism blur
- **Strong:** `backdrop-blur-lg` - Heavy blur (rarely used)

**Depth Layers:**
1. **Background:** Dark blue-black (`#0A0E1A`)
2. **Surface Layer:** Dark panels (`#1B2A38`, `#233648`) - `bg-surface-dark`
3. **Glass Layer:** Translucent overlays (`bg-white/5` + `backdrop-blur-md`)
4. **Elevated:** Cards with `shadow-lg` or `shadow-xl`
5. **Floating:** Modals, dropdowns with `shadow-xl` or `shadow-2xl`

---

## 2. Component DNA

### Button Styling

**Base Styles:**
- **Padding:** `px-4 py-2` (16px horizontal, 8px vertical)
- **Height:** `h-10` (40px) - default
- **Font:** `text-sm font-medium`
- **Border Radius:** `rounded-md` (6px)
- **Transition:** `transition-colors` (color changes only)

**Size Variants:**
- **Small:** `h-9 px-3` (36px height, 12px horizontal padding)
- **Default:** `h-10 px-4 py-2` (40px height, 16px horizontal, 8px vertical)
- **Large:** `h-11 px-8` (44px height, 32px horizontal padding)
- **Icon:** `h-10 w-10` (40px square)

**Variant Styles:**

1. **Default/Primary:**
   - Background: `bg-primary` (Bright Blue `#3B82F6`)
   - Text: `text-primary-foreground` (Dark `#0F172A`)
   - Hover: `hover:bg-primary/90` (90% opacity)

2. **Outline:**
   - Border: `border border-input` (1px solid, subtle color)
   - Background: `bg-background` (Transparent/background color)
   - Hover: `hover:bg-accent hover:text-accent-foreground`
   - Custom usage: `border-surface-border text-white hover:bg-white/10`

3. **Secondary:**
   - Background: `bg-secondary` (Dark Slate `#1E293B`)
   - Text: `text-secondary-foreground` (Light `#F8FAFC`)
   - Hover: `hover:bg-secondary/80` (80% opacity)

4. **Ghost:**
   - Background: Transparent
   - Hover: `hover:bg-accent hover:text-accent-foreground`

5. **Destructive:**
   - Background: `bg-destructive` (Dark Red `#991B1B`)
   - Text: `text-destructive-foreground` (Light `#F8FAFC`)
   - Hover: `hover:bg-destructive/90`

6. **Link:**
   - Text: `text-primary`
   - Decoration: `underline-offset-4`
   - Hover: `hover:underline`

**Focus States:**
- Outline: `focus-visible:outline-none`
- Ring: `focus-visible:ring-2 focus-visible:ring-ring` (2px ring, primary color)
- Offset: `focus-visible:ring-offset-2` (2px offset from element)

**Disabled States:**
- Opacity: `disabled:opacity-50`
- Cursor: `disabled:pointer-events-none`

**Special Custom Styles:**
- **Glass Button:** `bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20`
- **Surface Button:** `bg-[#233648] hover:bg-[#2d455d]` (Custom dark blue surface)

---

### Card Architecture

**Base Card Structure:**
- **Container:** `rounded-lg border bg-card text-card-foreground shadow-sm`
- **Background:** `bg-surface-dark` (Dark Blue-Gray `#1B2A38`)
- **Border:** `border-surface-border` (Subtle `rgba(255, 255, 255, 0.1)`)
- **Border Radius:** `rounded-lg` (8px) or `rounded-xl` (12px)
- **Shadow:** `shadow-sm` (base) or `shadow-lg` (hover)

**Card Sections:**
- **Card Header:** `p-6` (24px padding all sides)
- **Card Title:** `text-2xl font-semibold leading-none tracking-tight`
- **Card Description:** `text-sm text-muted-foreground`
- **Card Content:** `p-6 pt-0` (24px sides/bottom, 0 top)
- **Card Footer:** `p-6 pt-0` (24px sides/bottom, 0 top) with `flex items-center`

**Glassmorphism Cards:**
- **Background:** `bg-surface-dark/50 backdrop-blur-sm` (50% opacity + blur)
- **Border:** `border border-surface-border`
- **Usage:** Empty states, overlays, tooltips

**Hover States:**
- **Standard:** `hover:shadow-lg hover:border-primary/50 transition-all`
- **Border Change:** Border color shifts to primary color at 50% opacity
- **Shadow Enhancement:** Shadow increases from `sm` to `lg`

**Padding Patterns:**
- **Standard:** `p-6` (24px)
- **Compact:** `p-4` (16px)
- **Spacious:** `p-8` (32px)

**Border Patterns:**
- **Full Border:** `border border-surface-border` (all sides)
- **Dividers:** `border-t border-surface-border` (top border for sections)
- **Dashed:** `border-2 border-dashed border-surface-border` (empty states)

---

### Input/Form Style

**Base Input Styles:**
- **Height:** `h-10` (40px)
- **Padding:** `px-3 py-2` (12px horizontal, 8px vertical)
- **Font:** `text-sm`
- **Border:** `border border-input` (1px solid)
- **Border Radius:** `rounded-md` (6px)
- **Background:** `bg-background` (Dark `#0A0E1A`)

**Input Variants:**
- **Standard:** `bg-background border-input`
- **Surface:** `bg-surface-dark border-surface-border`
- **Search (Large):** `bg-surface-dark border-surface-border rounded-xl h-14 px-4`

**Placeholder Style:**
- **Color:** `placeholder:text-muted-foreground` (Light gray)
- **Custom:** `placeholder:text-[#92adc9]` (Brand cyan)

**Focus States:**
- **Outline:** `focus-visible:outline-none`
- **Ring:** `focus-visible:ring-2 focus-visible:ring-ring` (2px primary color ring)
- **Offset:** `focus-visible:ring-offset-2`
- **Border:** `focus-visible:border-primary` (Custom - border changes to primary color)

**Hover States:**
- **Border:** Border may subtly brighten
- **Transition:** `transition-all` for smooth changes

**Disabled States:**
- **Opacity:** `disabled:opacity-50`
- **Cursor:** `disabled:cursor-not-allowed`
- **Pointer:** `disabled:pointer-events-none`

**Error States:**
- **Border:** `border-destructive` (Red border)
- **Ring:** `ring-destructive` (Red ring on focus)
- **Text:** `text-destructive` (Red text for error messages)

**Select/Dropdown Styles:**
- **Background:** `bg-popover` (Dark)
- **Border:** `border` (Subtle)
- **Shadow:** `shadow-md` (Elevated)
- **Animation:** `data-[state=open]:animate-in data-[state=closed]:animate-out`
- **Radius:** `rounded-md` (6px)

**File Input Styles:**
- **Border:** `file:border-0` (No border on file button)
- **Background:** `file:bg-transparent`
- **Font:** `file:text-sm file:font-medium`

---

## 3. The "Vibe" Keywords

Based on the codebase analysis, here are the 5 adjectives that describe the current UI:

1. **Glassmorphic** - Heavy use of backdrop blur, translucent backgrounds (`bg-white/5`, `backdrop-blur-md`), and frosted glass effects create a modern, layered aesthetic.

2. **Dark Sophisticated** - Deep dark blue-black backgrounds (`#0A0E1A`), refined dark surface layers (`#1B2A38`, `#233648`), and elegant contrast with light text create a professional, high-end feel.

3. **Cyan-Accented** - The signature `#92ADC9` cyan-blue color ("Brand Soul") appears throughout for secondary text, icons, and accents, giving the UI a distinctive cool, tech-forward personality.

4. **Minimalist Structured** - Clean layouts, consistent spacing (base 4px), uniform border radius patterns, and restrained use of shadows create a organized, uncluttered interface.

5. **Smooth Transitions** - Extensive use of `transition-colors`, `transition-all`, and `duration-300` animations, plus hover state transformations (shadow elevation, border color shifts) create a fluid, responsive user experience.

**Design Philosophy Summary:** A dark, glassmorphic interface with cyan accents that feels modern, professional, and polished. The UI prioritizes readability through high contrast and uses subtle animations to provide feedback. The design system is consistent and systematic, with clear component hierarchies and spacing rules.

---

**Context Notes for Stitch AI:**
- This is a parliamentary transparency platform (Lithuanian "Seimas")
- Dark theme is mandatory (political data visualization context)
- Glassmorphism is a core design feature, not optional
- The `#92ADC9` cyan is the signature "Brand Soul" color - use it for secondary elements
- Party colors are dynamic and context-dependent (blue for TS-LKD, red for LSDP, etc.)
- Components should feel "premium" and "government-appropriate" - not playful or whimsical
- All interactive elements should have smooth transitions (300ms standard)
- Cards and panels use rounded corners (`rounded-lg` = 8px, `rounded-xl` = 12px) consistently
- Shadows are subtle but present (glassmorphism requires depth perception)
- Typography is clean and readable with clear hierarchy (H1 = 24px bold, body = 14-16px normal)

---

**Last Updated:** 2026-01-11  
**Status:** ✅ Production Design System
