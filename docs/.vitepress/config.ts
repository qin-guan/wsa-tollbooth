import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '@sagejs/starter-kit',
  description: 'Build fast, build safe, build cool',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Get started', link: '/get-started/starter-kit' },
      { text: 'Concepts', link: '/concepts' },
    ],

    sidebar: [
      {
        text: 'Get started',
        items: [
          { text: 'About me', link: '/get-started/starter-kit' },
          { text: 'Prerequisites', link: '/get-started/prerequisites' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/sagejs/starter-kit' },
    ],
  },
})
