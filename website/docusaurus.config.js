/** @type {import('@docusaurus/types').Config} */
module.exports = {
  title: 'ts-endpoint',
  tagline: 'A simple solution for full stack typescript projects.',
  url: 'https://ts-endpoint.federicosordillo.com/',
  baseUrl: '/',
  organizationName: 'fes300',
  projectName: 'ts-endpoint',
  favicon: 'img/favicon.ico',
  customFields: {
    users: [],
    repoUrl: 'https://github.com/fes300/ts-endpoint',
  },
  onBrokenLinks: 'log',
  onBrokenMarkdownLinks: 'log',
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          path: '../docs',
          sidebarPath: '../website/sidebars.json',
        },
        blog: {
          path: 'blog',
        },
        theme: {
          customCss: './src/css/customTheme.css',
        },
      },
    ],
  ],
  plugins: [],
  themeConfig: {
    navbar: {
      title: 'ts-endpoint',
      logo: {
        src: 'img/favicon.ico',
      },
      items: [
        {
          to: 'docs/ts-endpoint/intro',
          label: 'ts-endpoint',
          position: 'left',
        },
        {
          to: 'docs/ts-endpoint-express/intro',
          label: 'ts-endpoint-express',
          position: 'left',
        },
        {
          to: 'docs/ts-endpoint-browser/intro',
          label: 'ts-endpoint-browser',
          position: 'left',
        },
      ],
    },
    image: 'img/undraw_online.svg',
    footer: {
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'Twitter',
              to: 'https://twitter.com/Fes3002',
            },
          ],
        },
      ],
      copyright: 'Copyright © 2023 Federico Sordillo',
      logo: {
        src: 'img/favicon.ico',
      },
    },
  },
};
