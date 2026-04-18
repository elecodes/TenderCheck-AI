import { defineConfig } from 'vitepress';

export default defineConfig({
  base: '/TenderCheck-AI/',
  title: 'TenderCheck AI',
  description: 'Documentación del proyecto TenderCheck AI',
  ignoreDeadLinks: true,
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
    ],
    sidebar: {
      '/': [
        {
          text: 'Arquitectura',
          collapsed: true,
          items: [
            { text: 'Índice', link: '/architecture/index' },
            { text: 'System Architecture', link: '/architecture/system_architecture' },
            { text: 'MCP Feasibility', link: '/architecture/mcp_feasibility_study' },
          ],
        },
        {
          text: 'Estándares',
          collapsed: true,
          items: [
            { text: 'Índice', link: '/standards/index' },
            {
              text: 'Foundations & Quality',
              collapsed: true,
              items: [
                { text: 'Code Quality', link: '/standards/code_quality_policy' },
                { text: 'Coding Best Practices', link: '/standards/coding_best_practices' },
                { text: 'Lifecycle', link: '/standards/lifecycle_paradigms' },
                { text: 'Solid Principles', link: '/standards/solid_principles' },
                { text: 'Testing', link: '/standards/testing_policy' },
              ]
            },
            {
              text: 'Security & Operations',
              collapsed: true,
              items: [
                { text: 'Security', link: '/standards/security_policy' },
                { text: 'Secure Coding', link: '/standards/secure_coding_practices' },
                { text: 'DevOps', link: '/standards/devops_policy' },
              ]
            },
            {
              text: 'Observability & Health',
              collapsed: true,
              items: [
                { text: 'Health & Errors', link: '/standards/health_and_errors_policy' },
                { text: 'Sentry', link: '/standards/sentry_policy' },
                { text: 'Metrics', link: '/standards/metrics_policy' },
              ]
            },
            {
              text: 'UX & User Interface',
              collapsed: true,
              items: [
                { text: 'UX & Accessibility', link: '/standards/ux_accessibility_policy' },
                { text: 'Microcopy', link: '/standards/microcopy_policy' },
                { text: 'Usable Forms', link: '/standards/usable_forms_best_practices' },
              ]
            },
          ],
        },
        {
          text: 'ADRs',
          collapsed: true,
          items: [
            { text: 'Índice', link: '/adr/index' },
            {
              text: 'ADRs 001 - 010',
              collapsed: true,
              items: [
                { text: '001 Validation', link: '/adr/001-validation-strategy' },
                { text: '002 Frontend Stack', link: '/adr/002-frontend-stack' },
                { text: '003 AI Integration', link: '/adr/003-ai-integration' },
                { text: '004 Observability', link: '/adr/004-observability' },
                { text: '005 Google Auth', link: '/adr/005-google-auth-limitation' },
                { text: '006 Proposal', link: '/adr/006-proposal-validation' },
                { text: '007 Rules Engine', link: '/adr/007-rules-engine' },
                { text: '008 Local Auth', link: '/adr/008-local-auth-and-ollama' },
                { text: '009 UI Theme', link: '/adr/009-ui-theme-routing' },
                { text: '010 Security', link: '/adr/010-security-hardening' },
              ]
            },
            {
              text: 'ADRs 011 - 020',
              collapsed: true,
              items: [
                { text: '011 SQL Persistence', link: '/adr/011-local-sql-persistence' },
                { text: '012 Vector Search', link: '/adr/012-vector-search-performance' },
                { text: '013 Frontend Loc', link: '/adr/013-frontend-localization-security' },
                { text: '014 Cloud Auth', link: '/adr/014-cloud-authentication' },
                { text: '015 Cloud Deploy', link: '/adr/015-cloud-deployment' },
                { text: '016 Turso', link: '/adr/016-cloud-pivot-render-turso' },
                { text: '017 AI Logic', link: '/adr/017-ai-logic-refinements' },
                { text: '018 Auth Pivot', link: '/adr/018-auth-strategy-pivot' },
                { text: '019 UI Security', link: '/adr/019-frontend-ui-and-security' },
                { text: '020 Caching', link: '/adr/020-caching-strategy' },
              ]
            },
            {
              text: 'ADRs 021 - 030',
              collapsed: true,
              items: [
                { text: '021 Quality', link: '/adr/021-quality-metrics-standard' },
                { text: '022 Mobile First', link: '/adr/022-mobile-first-ui' },
                { text: '023 Resilience', link: '/adr/023-resilience-testing-strategy' },
                { text: '024 Auth UX', link: '/adr/024-auth-ux-enhancements' },
                { text: '025 Manual Redirect', link: '/adr/025-manual-native-redirect' },
                { text: '026 Dynamic', link: '/adr/026-dynamic-industry-validation' },
                { text: '027 Langsmith', link: '/adr/027-langsmith-tracing-integration' },
                { text: '028 Embedding', link: '/adr/028-embedding-model-migration' },
                { text: '029 HTTPS', link: '/adr/029-enforce-https-turso' },
                { text: '030 Coverage', link: '/adr/030-high-coverage-standard' },
              ]
            },
            {
              text: 'ADRs 031 - 035',
              collapsed: true,
              items: [
                { text: '031 Auth Header', link: '/adr/031-auth-header-fallback' },
                { text: '032 UI Design', link: '/adr/032-ui-design-system' },
                { text: '033 Auth Error', link: '/adr/033-auth-error-handling' },
                { text: '034 Global Theme', link: '/adr/034-global-theme-strategy' },
                { text: '035 Domain', link: '/adr/035-reaching-100-domain-coverage' },
              ]
            },
          ],
        },
        {
          text: 'TFM',
          collapsed: true,
          items: [
            { text: 'Índice', link: '/tfm/index' },
            { text: 'Análisis', link: '/tfm/00_analisis_detallado' },
            { text: 'Introducción', link: '/tfm/01_introduccion_objetivos' },
            { text: 'Marco Teórico', link: '/tfm/02_marco_teorico' },
            { text: 'Arquitectura', link: '/tfm/03_arquitectura' },
            { text: 'Implementación', link: '/tfm/04_implementacion' },
          ],
        },
      ],
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/elecodes/TenderCheck-AI',
      },
    ],
  },
});