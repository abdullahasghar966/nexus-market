---
name: Nexus Market
colors:
  surface: '#fbf8ff'
  surface-dim: '#dad9e3'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2fc'
  surface-container: '#eeedf7'
  surface-container-high: '#e8e7f1'
  surface-container-highest: '#e3e1eb'
  on-surface: '#1a1b22'
  on-surface-variant: '#444653'
  inverse-surface: '#2f3037'
  inverse-on-surface: '#f1f0fa'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#611e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#872d00'
  on-tertiary-container: '#ffa583'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#802a00'
  background: '#fbf8ff'
  on-background: '#1a1b22'
  surface-variant: '#e3e1eb'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is engineered for a high-scale, multi-vendor ecosystem. It prioritizes **Modern Corporate** aesthetics, blending the reliability of traditional finance with the efficiency of modern SaaS. The goal is to foster immediate trust between international buyers and diverse vendors.

The visual language is characterized by:
- **Precision:** Perfect alignment and consistent spacing to reflect logistical excellence.
- **Clarity:** Uncluttered interfaces that handle high data density without overwhelming the user.
- **Reliability:** A sober, structured approach using depth and color-coding to guide complex workflows.

## Colors

The palette is anchored in **Trustworthy Deep Blue** to establish authority. **Vibrant Teal** is reserved for vendor-side actions and growth-related metrics, signaling progress and health. **Warm Orange** serves as the high-visibility driver for conversions and urgent system alerts.

- **Primary (#1E40AF):** Brand identity, primary navigation, and lead buttons.
- **Secondary (#0D9488):** Vendor dashboards, "Add Product" actions, and success-state highlights.
- **Accent (#F59E0B):** "Add to Cart," "Buy Now," and low-stock warnings.
- **Neutrals:** A scale of professional grays (Slate/Zinc) used for borders, subtle backgrounds, and secondary text to maintain a clean, breathable UI.

## Typography

The design system utilizes **Inter** exclusively to ensure maximum readability across data-dense tables and product listings. 

- **Hierarchy:** Use semi-bold (600) for section headers and bold (700) for price points and primary calls to action.
- **Data Tables:** Use `label-md` for row content and `label-sm` (uppercase) for table headers to create a clear distinction.
- **Numbers:** Tabular lining should be enabled for price displays and quantity counts to ensure vertical alignment in lists.

## Layout & Spacing

The design system employs a **12-column fluid grid** for the main marketplace and a **fixed-sidebar layout** for vendor/admin dashboards.

- **Grid:** 24px gutters provide ample whitespace between product cards.
- **Responsive Behavior:** 
    - **Desktop (>1024px):** Fixed sidebar (280px) + fluid content.
    - **Tablet (768px - 1023px):** Collapsed sidebar (icon-only) + fluid content.
    - **Mobile (<767px):** Single column stack with 16px horizontal margins.
- **Vertical Rhythm:** Components follow an 8px base unit. Metric cards and product blocks should use 32px or 48px vertical spacing to prevent visual clutter.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layering** and **Ambient Shadows**.

- **Level 0 (Surface):** Use `#F8FAFC` for the main background to reduce eye strain.
- **Level 1 (Cards):** Pure white backgrounds with a subtle 1px border (`#E2E8F0`) and a soft, diffused shadow (Offset: 0, 4px; Blur: 6px; Opacity: 0.05).
- **Level 2 (Interactive/Floating):** Use for dropdowns and active metric cards. Increase shadow spread and opacity (Offset: 0, 10px; Blur: 15px; Opacity: 0.1).
- **Overlays:** Use a 40% opacity blur for modals to maintain the context of the marketplace underneath.

## Shapes

The design system uses a **Rounded (Level 2)** shape language to balance professional structure with modern friendliness.

- **Standard Elements:** Buttons, inputs, and small cards use 0.5rem (8px).
- **Large Elements:** Featured product banners and modal containers use 1rem (16px).
- **Interactive States:** On hover, clickable cards may subtly increase their shadow depth rather than changing shape, maintaining a stable grid.

## Components

### Buttons
- **Primary:** Solid Deep Blue (#1E40AF). High-trust, used for "Checkout" and "Save Settings."
- **Secondary:** Outline with 1.5px border in Neutral Gray. Used for "View Details" or "Cancel."
- **Accent (CTA):** Solid Warm Orange (#F59E0B) with white text. Reserved for "Add to Cart."

### Status & Feedback
- **Status Pills:** Small caps, bold text.
    - *Pending:* Gray background / Dark gray text.
    - *Processing:* Light Blue background / Primary Blue text.
    - *Shipped:* Light Teal background / Secondary Teal text.
    - *Delivered:* Light Green background / Success Green text.
- **Stock Indicator:** 
    - Green Dot (>10 units): "In Stock"
    - Orange Dot (<10 units): "Low Stock - [Count] left"
    - Red Dot (0 units): "Out of Stock"
- **Live Indicator:** A 12px pulsing Green dot next to a "Live" label, used for real-time sales or active auctions.

### Cards & Data
- **Metric Cards:** White surface, Level 1 elevation. Feature a large numerical value with a small trend indicator (Green Up Arrow for growth, Red Down Arrow for decline).
- **Data Tables:** Clean horizontal borders only. Use Zebra striping (`#F8FAFC`) on every second row for readability.
- **Role Badges:** 
    - Customer: Indigo tag.
    - Vendor: Emerald tag.
    - Admin: Slate tag.

### Navigation
- **Top Bar:** Sticky, white background, level 1 shadow. Contains global search, notification bell, and user profile.
- **Sidebar:** Darker neutral background (`#1E293B`) with light text for Admin/Vendor views to distinguish the management interface from the shopping experience.