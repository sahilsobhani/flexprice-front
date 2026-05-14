import { describe, it, expect, afterEach, vi } from 'vitest';

// Parsers live in branding.ts; reset modules so import.meta.env re-evaluates fresh
async function importBranding() {
	vi.resetModules();
	return import('./branding');
}

async function importConfig() {
	vi.resetModules();
	return import('./config');
}

describe('parseBrandConfig', () => {
	afterEach(() => vi.unstubAllEnvs());

	it('returns Flexprice defaults when env var is absent', async () => {
		const { parseBrandConfig } = await importBranding();
		const result = parseBrandConfig();
		expect(result.name).toBe('Flexprice');
		expect(result.logo).toBe('/comicon.png');
		expect(result.primaryColor).toBe('#7C3AED');
		expect(result.favicon).toBe('/favicon.ico');
	});

	it('applies overrides from valid JSON', async () => {
		vi.stubEnv('VITE_BRAND_CONFIG', JSON.stringify({ name: 'Tirdad', primaryColor: '#0d1b2a' }));
		const { parseBrandConfig } = await importBranding();
		const result = parseBrandConfig();
		expect(result.name).toBe('Tirdad');
		expect(result.primaryColor).toBe('#0d1b2a');
		expect(result.logo).toBe('/comicon.png');
	});

	it('silently falls back to defaults on malformed JSON', async () => {
		vi.stubEnv('VITE_BRAND_CONFIG', '{bad json}');
		const { parseBrandConfig } = await importBranding();
		const result = parseBrandConfig();
		expect(result.name).toBe('Flexprice');
	});
});

describe('parseAuthPageConfig — legacy tests updated for discriminated union', () => {
	afterEach(() => vi.unstubAllEnvs());

	it('returns defaults when env var is absent', async () => {
		const { parseAuthPageConfig } = await importBranding();
		const result = parseAuthPageConfig();
		expect(result.template).toBe('template_1');
		expect(result.config.supportEmail).toBe('support@flexprice.io');
		expect(result.config.tagline).toBeNull();
		expect(result.config.loginBgImage).toBeNull();
	});

	it('sets slackCommunityUrl to null when explicitly nulled', async () => {
		vi.stubEnv('VITE_AUTH_CONFIG', JSON.stringify({ slackCommunityUrl: null }));
		const { parseAuthPageConfig } = await importBranding();
		const result = parseAuthPageConfig();
		if (result.template === 'template_1') {
			expect(result.config.slackCommunityUrl).toBeNull();
		}
	});

	it('applies partial overrides while keeping other defaults', async () => {
		vi.stubEnv('VITE_AUTH_CONFIG', JSON.stringify({ supportEmail: 'support@tirdad.com', tagline: 'Custom tagline' }));
		const { parseAuthPageConfig } = await importBranding();
		const result = parseAuthPageConfig();
		expect(result.config.supportEmail).toBe('support@tirdad.com');
		expect(result.config.tagline).toBe('Custom tagline');
	});

	it('silently falls back to defaults on malformed JSON', async () => {
		vi.stubEnv('VITE_AUTH_CONFIG', '{bad json}');
		const { parseAuthPageConfig } = await importBranding();
		const result = parseAuthPageConfig();
		expect(result.template).toBe('template_1');
		expect(result.config.supportEmail).toBe('support@flexprice.io');
	});
});

describe('parseAuthPageConfig — template dispatch', () => {
	afterEach(() => vi.unstubAllEnvs());

	it('defaults to template_1 when template field is absent', async () => {
		const { parseAuthPageConfig } = await importBranding();
		const result = parseAuthPageConfig();
		expect(result.template).toBe('template_1');
		expect(result.config.supportEmail).toBe('support@flexprice.io');
		expect(result.config.tagline).toBeNull();
	});

	it('returns template_1 shape for template_1 config', async () => {
		vi.stubEnv('VITE_AUTH_CONFIG', JSON.stringify({ template: 'template_1', tagline: 'Build fast' }));
		const { parseAuthPageConfig } = await importBranding();
		const result = parseAuthPageConfig();
		expect(result.template).toBe('template_1');
		if (result.template === 'template_1') {
			expect(result.config.tagline).toBe('Build fast');
			expect(result.config.showTestimonials).toBe(true);
		}
	});

	it('returns template_2 shape for template_2 config', async () => {
		vi.stubEnv('VITE_AUTH_CONFIG', JSON.stringify({ template: 'template_2', landingBgColor: '#1a1a2e' }));
		const { parseAuthPageConfig } = await importBranding();
		const result = parseAuthPageConfig();
		expect(result.template).toBe('template_2');
		if (result.template === 'template_2') {
			expect(result.config.landingBgColor).toBe('#1a1a2e');
			expect(result.config.showLogoOnLanding).toBe(false);
		}
	});

	it('falls back to template_1 on malformed JSON', async () => {
		vi.stubEnv('VITE_AUTH_CONFIG', '{bad}');
		const { parseAuthPageConfig } = await importBranding();
		const result = parseAuthPageConfig();
		expect(result.template).toBe('template_1');
	});
});

describe('parseRegionsConfig', () => {
	afterEach(() => vi.unstubAllEnvs());

	it('returns disabled with empty regions when nothing is configured', async () => {
		const { parseRegionsConfig } = await importBranding();
		const result = parseRegionsConfig();
		expect(result.enabled).toBe(false);
		expect(result.regions).toHaveLength(0);
	});

	it('uses VITE_AUTH_CONFIG regions when configured', async () => {
		vi.stubEnv(
			'VITE_AUTH_CONFIG',
			JSON.stringify({
				regions: {
					enabled: true,
					regions: [{ key: 'sa', label: 'Saudi Arabia', url: 'https://sa.brand.com', countryCode: 'SA' }],
				},
			}),
		);
		const { parseRegionsConfig } = await importBranding();
		const result = parseRegionsConfig();
		expect(result.enabled).toBe(true);
		expect(result.regions).toHaveLength(1);
		expect(result.regions[0].countryCode).toBe('SA');
	});

	it('falls back to legacy env vars when regions array is absent', async () => {
		vi.stubEnv('VITE_DASHBOARD_URL_INDIA', 'https://in.flexprice.io');
		vi.stubEnv('VITE_DASHBOARD_URL_US', 'https://us.flexprice.io');
		vi.stubEnv('VITE_DATA_REGION_SELECTION_ENABLED', 'true');
		const { parseRegionsConfig } = await importBranding();
		const result = parseRegionsConfig();
		expect(result.enabled).toBe(true);
		expect(result.regions).toHaveLength(2);
		expect(result.regions.find((r) => r.key === 'india')?.countryCode).toBe('IN');
		expect(result.regions.find((r) => r.key === 'us')?.countryCode).toBe('US');
	});

	it('legacy fallback is disabled when VITE_DATA_REGION_SELECTION_ENABLED is not true', async () => {
		vi.stubEnv('VITE_DASHBOARD_URL_INDIA', 'https://in.flexprice.io');
		const { parseRegionsConfig } = await importBranding();
		const result = parseRegionsConfig();
		expect(result.enabled).toBe(false);
	});
});

describe('parseAllowedLocales', () => {
	afterEach(() => vi.unstubAllEnvs());

	it('returns SUPPORTED_LOCALES when allowedLocales is absent', async () => {
		const { parseAllowedLocales, SUPPORTED_LOCALES } = await importBranding();
		expect(parseAllowedLocales()).toEqual(SUPPORTED_LOCALES);
	});

	it('returns filtered subset when allowedLocales is configured', async () => {
		vi.stubEnv('VITE_AUTH_CONFIG', JSON.stringify({ allowedLocales: ['en'] }));
		const { parseAllowedLocales } = await importBranding();
		expect(parseAllowedLocales()).toEqual(['en']);
	});

	it('filters out invalid locale values', async () => {
		vi.stubEnv('VITE_AUTH_CONFIG', JSON.stringify({ allowedLocales: ['en', 'zz'] }));
		const { parseAllowedLocales } = await importBranding();
		expect(parseAllowedLocales()).toEqual(['en']);
	});
});

describe('parseI18nConfig', () => {
	afterEach(() => vi.unstubAllEnvs());

	it('defaults to en ltr', async () => {
		const { parseI18nConfig } = await importBranding();
		const result = parseI18nConfig();
		expect(result.locale).toBe('en');
		expect(result.direction).toBe('ltr');
	});

	it('derives rtl from Arabic locale', async () => {
		vi.stubEnv('VITE_DEFAULT_LOCALE', 'ar');
		const { parseI18nConfig } = await importBranding();
		const result = parseI18nConfig();
		expect(result.locale).toBe('ar');
		expect(result.direction).toBe('rtl');
	});

	it('derives rtl for all RTL locales', async () => {
		for (const locale of ['ar', 'he', 'fa', 'ur']) {
			vi.stubEnv('VITE_DEFAULT_LOCALE', locale);
			const { parseI18nConfig } = await importBranding();
			const result = parseI18nConfig();
			expect(result.direction).toBe('rtl');
			vi.unstubAllEnvs();
		}
	});
});

describe('config object', () => {
	it('includes brand, authPage, i18n, regions, and allowedLocales keys', async () => {
		const { config } = await importConfig();
		expect(config.brand).toBeDefined();
		expect(config.authPage).toBeDefined();
		expect(config.authPage.template).toBe('template_1');
		expect(config.i18n).toBeDefined();
		expect(config.regions).toBeDefined();
		expect(Array.isArray(config.allowedLocales)).toBe(true);
	});
});
