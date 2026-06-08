import { createTheme, type MantineColorsTuple } from '@mantine/core';

/**
 * Mantine v7 dark theme for the prep gym.
 *
 * Goals: high readability (bright text on a deep navy base, 15px body, generous line
 * height) and a confident, colorful feel (periwinkle brand, violet gradient accents).
 * The `dark` tuple is overridden so Mantine's dark surfaces match the app's navy palette,
 * which is also mirrored as CSS variables in src/styles/tokens.css for the custom-CSS views.
 */

// Periwinkle → indigo brand ramp. primaryShade.dark = 5 → #6e8efb is the working primary.
const brand: MantineColorsTuple = [
  '#eef1ff',
  '#dbe1ff',
  '#b6c4ff',
  '#8ea3fc',
  '#7b93fb',
  '#6e8efb',
  '#5a78f0',
  '#4c66dd',
  '#3f55bf',
  '#33489c',
];

// Dark surfaces/text. Index map (Mantine dark scheme):
//   0 = brightest text, 2 = dimmed text, 4 = border, 6 = card surface, 7 = body bg.
const dark: MantineColorsTuple = [
  '#eaeef6',
  '#c8d0df',
  '#9aa6bd',
  '#6f7c93',
  '#283041',
  '#1f2735',
  '#161c28',
  '#0c0f17',
  '#0a0d14',
  '#070a10',
];

export const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: { light: 6, dark: 5 },
  colors: { brand, dark },

  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontFamilyMonospace: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
  fontSizes: { xs: '12px', sm: '14px', md: '15.5px', lg: '17.5px', xl: '21px' },
  lineHeights: { xs: '1.45', sm: '1.5', md: '1.6', lg: '1.65', xl: '1.65' },

  headings: {
    fontFamily: 'inherit',
    fontWeight: '680',
    sizes: {
      h1: { fontSize: '26px', lineHeight: '1.2' },
      h2: { fontSize: '21px', lineHeight: '1.25' },
      h3: { fontSize: '17px', lineHeight: '1.3' },
      h4: { fontSize: '15px', lineHeight: '1.35' },
    },
  },

  defaultRadius: 'md',
  radius: { sm: '6px', md: '8px', lg: '12px' },
  defaultGradient: { from: 'brand', to: 'grape', deg: 135 },
  cursorType: 'pointer',
  focusRing: 'auto',
});
