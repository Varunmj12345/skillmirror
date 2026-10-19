# SkillMirror Design System • Tokens & UI Standards

**Version:** 2.0 (Unified Sentinel Engine)  
**Architecture:** Tailwind CSS 3.4 + CSS Custom Properties (Theme-Adaptive)  
**Primary Typography:** `Roboto Mono` (Tactical UI / Monospace) • `Space Grotesk` (Display) • `Inter` (Sans)

---

## 1. Typography Tokens

All font sizes, line heights, and letter spacings are consolidated under semantic utility tokens in `tailwind.config.js` and `src/styles/globals.css`.

| Token Class | Size | Line Height | Letter Spacing | Semantic Usage |
| :--- | :--- | :--- | :--- | :--- |
| `text-micro` | `8px` (`0.5rem`) | `10px` | `0.08em` | Micro telemetry indicators, tiny chips |
| `text-nano` | `9px` (`0.5625rem`) | `12px` | `0.08em` | Status indicators, sub-pills |
| `text-caption` | `10px` (`0.625rem`) | `14px` | `0.06em` | Field labels, section headers, badges |
| `text-sub` | `11px` (`0.6875rem`) | `16px` | `0.04em` | Auxiliary subtitles, secondary timestamps |
| `text-xs` | `12px` (`0.75rem`) | `16px` | Normal | Core dense UI, button labels, table cells |
| `text-sm` | `14px` (`0.875rem`) | `20px` | Normal | Primary reading body, card subtitles |
| `text-base` | `16px` (`1rem`) | `24px` | Normal | Editorial narrative, modal body text |
| `text-lg` | `18px` (`1.125rem`) | `28px` | `-0.01em` | Section callouts, modal titles |
| `text-xl` | `20px` (`1.25rem`) | `28px` | `-0.02em` | Card titles, widget headings |
| `text-2xl` | `24px` (`1.5rem`) | `32px` | `-0.02em` | Standard module page titles |
| `text-3xl` | `30px` (`1.875rem`) | `36px` | `-0.03em` | Primary engine headlines |
| `text-4xl` | `36px` (`2.25rem`) | `40px` | `-0.03em` | Metric numbers, hero headlines |

### Typography Component Classes
- `.sm-page-title`: `text-2xl sm:text-3xl font-mono font-bold tracking-tight text-zinc-100`
- `.sm-section-heading`: `text-lg sm:text-xl font-mono font-bold tracking-tight text-zinc-100`
- `.sm-card-title`: `text-xs sm:text-sm font-mono font-semibold tracking-wide uppercase text-zinc-100`
- `.sm-body-text`: `text-xs sm:text-sm font-mono leading-relaxed text-zinc-400`
- `.sm-caption`: `text-caption font-mono font-medium uppercase tracking-[0.14em] text-zinc-400`
- `.sm-label`: `text-caption font-mono font-semibold uppercase tracking-[0.14em] text-zinc-400`
- `.sm-metric`: `text-3xl sm:text-4xl font-mono font-black tracking-tight tabular-nums text-zinc-100`

---

## 2. Color & Surface Tokens

Colors adapt dynamically between light and dark modes via CSS variables. Never hardcode `#ffffff` or `#000000` for content surfaces.

| Semantic Token | Light Mode (`html.light`) | Dark Mode (`html.dark`) | Tailwind Role |
| :--- | :--- | :--- | :--- |
| Canvas Background | `#f4f4f5` (`zinc-950`) | `#09090b` (`zinc-950`) | `bg-zinc-950` |
| Card Container | `#ffffff` (`zinc-900`) | `#18181b` (`zinc-900`) | `bg-zinc-900` |
| Nested Panel / Well | `#f8fafc` (`zinc-850`) | `#1c1c20` (`zinc-850`) | `bg-zinc-850` |
| Primary Text | `#09090b` (`zinc-100`) | `#f4f4f5` (`zinc-100`) | `text-zinc-100` |
| Secondary Text | `#27272a` (`zinc-300`) | `#d4d4d8` (`zinc-300`) | `text-zinc-300` |
| Muted / Body Text | `#52525b` (`zinc-400`) | `#a1a1aa` (`zinc-400`) | `text-zinc-400` |
| Dim / Micro Text | `#71717a` (`zinc-500`) | `#71717a` (`zinc-500`) | `text-zinc-500` |
| Default Border | `#e4e4e7` (`zinc-800`) | `#27272a` (`zinc-800`) | `border-zinc-800` |
| Active Border | `#d4d4d8` (`zinc-700`) | `#3f3f46` (`zinc-700`) | `border-zinc-700` |
| Brand Accent | `#b45309` (`amber-600`) | `#f59e0b` (`amber-500`) | `text-amber-500` / `bg-amber-500` |
| Status Success | `#059669` | `#10b981` | `text-emerald-400` / `bg-emerald-500` |
| Status Warning | `#d97706` | `#f59e0b` | `text-amber-400` / `bg-amber-500` |
| Status Danger | `#dc2626` | `#ef4444` | `text-rose-400` / `bg-rose-500` |

---

## 3. Shape, Elevation & Focus

### Border Radii
- `rounded-none`: `0px` — Strict technical strips, indicators.
- `rounded-sm`: `4px` — Default for buttons, inputs, selects, badges, and chips.
- `rounded-md`: `8px` — Inner card wells, popovers, small dialogs.
- `rounded-lg`: `12px` — Main container cards, page chrome cards, modal containers.
- `rounded-full`: `9999px` — Status dots, user avatars.

### Shadows & Glow
- `shadow-sm`: Standard card separation in light and dark mode.
- `shadow-tactical-card`: Balanced elevation for interactive cards.
- `shadow-glow-amber`: `0 0 16px -2px rgba(245, 158, 11, 0.4)` — Active telemetry alert.
- `shadow-glow-emerald`: `0 0 16px -2px rgba(16, 185, 129, 0.4)` — Active system online.

### Focus Ring Accessibility
All interactive controls must implement visible focus rings:
```css
focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:outline-none
```

---

## 4. UI Component Library Matrix

Import all primitives from `src/components/ui`:
```tsx
import { Button, Badge, Card, CardHeader, CardTitle, CardContent, CardFooter, Input, Select, Modal, Table, Alert, Tooltip } from '@/components/ui';
```

### A. Button (`Button.tsx`)
```tsx
<Button variant="primary" size="md">Run Analysis</Button>
<Button variant="secondary" size="sm">Export Report</Button>
<Button variant="outline" size="xs">Cancel</Button>
<Button variant="ghost" size="icon"><ChevronRight /></Button>
<Button loading={true}>Processing</Button>
```
- **Variants:** `primary` (amber gradient), `secondary` (zinc card), `outline` (border-zinc-700), `ghost` (minimal), `destructive` (red), `white`, `link`.
- **Sizes:** `xs` (h-7), `sm` (h-8), `md` / `default` (h-9), `lg` (h-11), `xl` (h-13), `icon` (h-9 w-9), `icon-sm` (h-7 w-7).

### B. Badge (`Badge.tsx`)
```tsx
<Badge variant="amber" dot>Live Engine</Badge>
<Badge variant="success" size="sm">Ready (94%)</Badge>
<Badge variant="warning">Attention</Badge>
<Badge variant="destructive">Critical Gap</Badge>
```
- **Variants:** `default`, `amber` / `primary`, `success`, `warning`, `destructive`, `info` / `cyan`, `outline`.
- **Sizes:** `xs` (9px), `sm` (10px), `md` (12px).
- **Dot:** `dot={true}` adds an animated pulse indicator.

### C. Card (`Card.tsx`)
```tsx
<Card variant="default">
  <CardHeader title="Intelligence Feed" subtitle="Real-time telemetry" addon={<Badge variant="amber" dot>Live</Badge>} />
  <CardContent>Body metrics and data charts</CardContent>
  <CardFooter>Last updated 2 minutes ago</CardFooter>
</Card>
```
- **Variants:** `default`, `panel` (nested well), `ghost`, `interactive`.

### D. Input (`Input.tsx`)
```tsx
<Input 
  label="Target Role" 
  placeholder="e.g. Senior Backend Engineer" 
  helperText="Used for automated roadmap alignment" 
  icon={<Search className="w-3.5 h-3.5" />} 
  error={formError}
/>
```
- **Features:** Label with optional asterisk, helperText, error state with indicator dot, prefix `icon`, suffix `endAddon`, `sm`/`md`/`lg` sizing.

### E. Select (`Select.tsx`)
```tsx
<Select
  label="Seniority Level"
  options={[
    { value: 'junior', label: 'Junior (0-2 YOE)' },
    { value: 'mid', label: 'Mid-Level (3-5 YOE)' },
    { value: 'senior', label: 'Senior (6+ YOE)' },
  ]}
  value={selectedLevel}
  onChange={(e) => setSelectedLevel(e.target.value)}
/>
```

### F. Modal (`Modal.tsx`)
```tsx
<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)} 
  title="Optimize Resume"
  subtitle="AI Engine will restructure your experience section"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={handleOptimize}>Confirm</Button>
    </>
  }
>
  <div>Modal body content...</div>
</Modal>
```
- **Features:** Escape key listener, body scroll lock, backdrop blur, enter/exit animation.

### G. Alert (`Alert.tsx`)
```tsx
<Alert variant="warning">
  <AlertTitle>Action Required</AlertTitle>
  <AlertDescription>Your GitHub token is expiring in 48 hours.</AlertDescription>
</Alert>
```
- **Variants:** `info`, `warning`, `amber`, `success`, `destructive`.

### H. Table (`Table.tsx`)
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Skill</TableHead>
      <TableHead>Demand</TableHead>
      <TableHead>Match</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-semibold text-zinc-100">TypeScript</TableCell>
      <TableCell><Badge variant="amber">High</Badge></TableCell>
      <TableCell className="text-emerald-400">92%</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## 5. Migration Guide & Anti-Patterns

### ❌ Anti-Patterns to Avoid:
1. **Never write arbitrary micro font sizes in brackets:**
   - ❌ `text-[10px]` ➔ ✅ Use `text-caption`
   - ❌ `text-[9px]` ➔ ✅ Use `text-nano`
   - ❌ `text-[8px]` ➔ ✅ Use `text-micro`
   - ❌ `text-[11px]` ➔ ✅ Use `text-sub`
2. **Never hardcode white text on hover:**
   - ❌ `hover:text-white` ➔ ✅ Use `hover:text-zinc-100` (auto-adapts: dark white in dark mode, deep black in light mode).
3. **Never hardcode legacy cyber blue or slate:**
   - ❌ `bg-blue-600` / `bg-slate-50` ➔ ✅ Use `bg-amber-500` / `bg-zinc-900` / `bg-zinc-850`.
4. **Never create ad-hoc `<input>` tags:**
   - ❌ `<input className="border border-gray-300..." />` ➔ ✅ Use `<Input label="..." />`.
