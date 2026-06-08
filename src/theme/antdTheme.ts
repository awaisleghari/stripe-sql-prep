import { theme, type ThemeConfig } from 'antd';

/**
 * Ant Design v5 dark theme for the prep gym.
 *
 * The seed/derived tokens here mirror the CSS variables in src/styles/tokens.css so
 * that Ant-rendered surfaces and the remaining custom-CSS views stay on one palette.
 * Keep the two files in sync when colors change.
 */
export const antdTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#6e8efb',
    colorInfo: '#6e8efb',
    colorSuccess: '#46c98b',
    colorWarning: '#e0b13d',
    colorError: '#f0726b',
    colorLink: '#86a8ff',
    colorLinkHover: '#a9c0ff',

    colorBgLayout: '#0c0f17',
    colorBgContainer: '#141925',
    colorBgElevated: '#1a2030',
    colorBorder: '#283041',
    colorBorderSecondary: '#1e2532',

    colorText: '#e8ebf2',
    colorTextSecondary: '#a7b0c0',
    colorTextTertiary: '#717a8a',
    colorTextQuaternary: '#4c5564',

    borderRadius: 8,
    borderRadiusLG: 12,
    fontSize: 14,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    wireframe: false,
  },
  components: {
    Layout: {
      headerBg: '#0c0f17',
      siderBg: '#0d111a',
      bodyBg: 'transparent',
      headerHeight: 60,
      headerPadding: '0 28px',
    },
    Menu: {
      itemBg: 'transparent',
      subMenuItemBg: 'transparent',
      itemColor: '#a7b0c0',
      itemHoverColor: '#e8ebf2',
      itemHoverBg: 'rgba(255,255,255,0.04)',
      itemSelectedBg: 'rgba(110,142,251,0.13)',
      itemSelectedColor: '#bcccff',
      groupTitleColor: '#5a6680',
      groupTitleFontSize: 10.5,
      itemBorderRadius: 8,
      itemMarginInline: 8,
      itemHeight: 38,
    },
    Tabs: {
      itemColor: '#a7b0c0',
      itemHoverColor: '#8aa3fc',
      itemSelectedColor: '#bcccff',
      inkBarColor: '#6e8efb',
      titleFontSize: 14,
    },
    Card: {
      colorBgContainer: '#161c28',
    },
    Collapse: {
      headerBg: '#1b2230',
      contentBg: '#141a26',
      borderRadiusLG: 8,
    },
    Segmented: {
      itemSelectedBg: 'rgba(110,142,251,0.18)',
      itemSelectedColor: '#bcccff',
    },
    Alert: {
      withDescriptionPadding: '12px 16px',
    },
  },
};
