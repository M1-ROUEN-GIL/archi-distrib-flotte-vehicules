import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3005';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,
  retries: 1,
  timeout: 30_000,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // ── Setup admin ────────────────────────────────────────────────────────────
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },

    // ── Setup rôles ────────────────────────────────────────────────────────────
    {
      name: 'setup-manager',
      testMatch: '**/auth.setup.manager.ts',
    },
    {
      name: 'setup-technicien',
      testMatch: '**/auth.setup.technicien.ts',
    },

    // ── Tests admin — Chromium ─────────────────────────────────────────────────
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: '**/roles.spec.ts',
    },

    // ── Tests admin — Firefox ──────────────────────────────────────────────────
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      // Couvre uniquement les tests de lecture pour éviter les doublons CRUD en DB
      testMatch: ['**/dashboard.spec.ts', '**/location.spec.ts'],
    },

    // ── Tests de rôles ─────────────────────────────────────────────────────────
    {
      name: 'roles',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/roles.spec.ts',
      dependencies: ['setup-manager', 'setup-technicien'],
    },
  ],
});
