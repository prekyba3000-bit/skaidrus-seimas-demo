# Dockerfile Playwright Configuration Verification

## ✅ Runner Stage System Dependencies

All required Playwright Chromium dependencies are installed in the runner stage:

- ✅ `libnss3` - Mozilla NSS library (cryptography)
- ✅ `libatk-bridge2.0-0` - ATK accessibility bridge
- ✅ `libdrm2` - Direct Rendering Manager
- ✅ `libxkbcommon0` - Keyboard handling
- ✅ `libxcomposite1` - X11 Composite extension
- ✅ `libxdamage1` - X11 Damage extension
- ✅ `libxfixes3` - X11 Fixes extension
- ✅ `libxrandr2` - X11 RandR extension
- ✅ `libgbm1` - Generic Buffer Management (GPU)
- ✅ `libasound2` - Advanced Linux Sound Architecture
- ✅ `libpango-1.0-0` - Text layout engine
- ✅ `libcairo2` - 2D graphics library
- ✅ `libxss1` - X11 Screen Saver extension

## ✅ Browser Binaries Preservation

The `COPY --from=builder /app/node_modules ./node_modules` instruction preserves:

1. **Playwright npm package**: Located in `node_modules/playwright/`
2. **Browser binaries**: Located in `node_modules/.cache/playwright/` (installed during `pnpm install` via postinstall script)
3. **All runtime dependencies**: Required because `esbuild --packages=external` keeps dependencies external

## ✅ Build Process Flow

1. **Builder Stage**:
   - Runs `pnpm install --frozen-lockfile` which executes `postinstall: npx playwright install --with-deps chromium`
   - This installs Chromium browser binaries to `node_modules/.cache/playwright/`
   - Builds application with `pnpm run build`
   - Prunes dev dependencies with `pnpm prune --prod` (keeps `playwright` since it's in dependencies)

2. **Runner Stage**:
   - Installs system libraries via `apt-get`
   - Copies `node_modules` (including `.cache/playwright/` folder)
   - Copies built `dist/` directory
   - Executes `node dist/index.js` directly

## ✅ Verification Checklist

- [x] All Playwright system dependencies installed in runner
- [x] Browser binaries preserved via node_modules copy
- [x] No pnpm required in runner (minimal image)
- [x] CMD executes `node dist/index.js` directly
- [x] System libraries cleaned up after install (`rm -rf /var/lib/apt/lists/*`)

## 🚀 Expected Railway Deployment Behavior

1. Build will succeed with all dependencies
2. `node dist/index.js` will start successfully
3. `/test-browser` endpoint will be available
4. Playwright will launch Chromium successfully with all system libraries available
