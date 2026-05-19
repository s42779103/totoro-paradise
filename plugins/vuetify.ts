import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import colors from 'vuetify/lib/util/colors';

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    theme: {
      // 初始为 light，客户端会根据系统偏好切换
      defaultTheme: 'light',
      themes: {
        light: {
          dark: false,
          colors: {
            primary: colors.blue.darken1,
            secondary: colors.teal.darken1,
            accent: colors.orange.darken1,
            error: colors.red.darken1,
            success: colors.green.darken1,
            warning: colors.amber.darken1,
            info: colors.cyan.darken1,
          },
          variables: {
            'border-radius': '8px',
            'button-height': '40px',
            'card-border-radius': '12px',
            'card-padding': '16px',
          },
        },
        dark: {
          dark: true,
          colors: {
            primary: colors.blue.darken3,
            secondary: colors.teal.darken3,
            accent: colors.orange.darken4,
            error: colors.red.accent2,
            success: colors.green.accent3,
            warning: colors.amber.accent3,
            info: colors.cyan.accent2,
            background: '#121212',
            surface: '#1e1e1e',
          },
          variables: {
            'border-radius': '8px',
            'button-height': '40px',
            'card-border-radius': '12px',
            'card-padding': '16px',
          },
        },
      },
    },
    defaults: {
      VBtn: {
        elevation: 0,
        rounded: 'lg',
        class: 'text-none',
      },
      VCard: {
        elevation: 2,
        rounded: 'lg',
        // 去掉卡片内外间距
        class: 'pa-0 ma-0',
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
      },
      VProgressLinear: {
        rounded: 'lg',
        height: 8,
      },
    },
    icons: {
      defaultSet: 'mdi',
    },
  });

  nuxtApp.vueApp.use(vuetify);

  // 客户端：根据系统 prefers-color-scheme 动态切换 Vuetify 主题并设置根元素类
  if (process.client && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = (isDark: boolean) => {
      // 尝试通过 Vuetify API 切换当前主题名（兼容不同实现）
      try {
        // Vuetify 3: theme.global.name 是 ref
        // @ts-ignore
        const themeGlobal = (vuetify as any).theme?.global;
        if (themeGlobal && themeGlobal.name) {
          // @ts-ignore
          themeGlobal.name.value = isDark ? 'dark' : 'light';
        }
      } catch (e) {
        // 忽略切换失败（仍会设置根类适配样式）
      }

      const el = document.documentElement;
      el.classList.toggle('v-theme--dark', isDark);
      el.classList.toggle('v-theme--light', !isDark);
      el.classList.toggle('theme--dark', isDark);
      el.classList.toggle('theme--light', !isDark);
      el.classList.toggle('dark', isDark);
      el.setAttribute('data-theme', isDark ? 'dark' : 'light');
      el.style.colorScheme = isDark ? 'dark' : 'light';
      const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
      if (meta) meta.setAttribute('content', isDark ? '#121212' : '#ffffff');
    };

    // 初始应用
    apply(mql.matches);

    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler);
    } else {
      // 兼容老浏览器
      // @ts-ignore
      mql.addListener(handler);
    }
  }
});
