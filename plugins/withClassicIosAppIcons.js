/**
 * Expo SDK 57+ ships a single "universal" 1024 AppIcon.
 * That compiles, but Transporter often shows Apple's grey placeholder "A"
 * instead of the marketing icon. Classic multi-size AppIcon.appiconset
 * (same shape as Expo SDK 56 / TaksitDefter IPAs) restores a visible icon.
 */
const {
  IOSConfig,
  withDangerousMod,
} = require('@expo/config-plugins');
const { generateImageAsync } = require('@expo/image-utils');
const fs = require('fs');
const path = require('path');

const IMAGESET_PATH = 'Images.xcassets/AppIcon.appiconset';
const CACHE = 'classic-ios-appicon';

/** @type {{ idiom: string, size: number, scales: number[] }[]} */
const ICON_SLOTS = [
  { idiom: 'iphone', size: 20, scales: [2, 3] },
  { idiom: 'iphone', size: 29, scales: [2, 3] },
  { idiom: 'iphone', size: 40, scales: [2, 3] },
  { idiom: 'iphone', size: 60, scales: [2, 3] },
  { idiom: 'ipad', size: 20, scales: [1, 2] },
  { idiom: 'ipad', size: 29, scales: [1, 2] },
  { idiom: 'ipad', size: 40, scales: [1, 2] },
  { idiom: 'ipad', size: 76, scales: [1, 2] },
  { idiom: 'ipad', size: 83.5, scales: [2] },
  { idiom: 'ios-marketing', size: 1024, scales: [1] },
];

function resolveIconPath(config) {
  const iosIcon = config.ios?.icon;
  if (typeof iosIcon === 'string') return iosIcon;
  if (iosIcon && typeof iosIcon === 'object') {
    return iosIcon.light || iosIcon.dark || iosIcon.tinted || config.icon;
  }
  return config.icon || null;
}

function sizeLabel(size) {
  return Number.isInteger(size) ? String(size) : String(size);
}

function fileName(size, scale) {
  return `AppIcon-${sizeLabel(size)}x${sizeLabel(size)}@${scale}x.png`;
}

async function writeClassicIconsAsync(config, projectRoot) {
  const iconSrc = resolveIconPath(config);
  if (!iconSrc) {
    console.warn('[withClassicIosAppIcons] No icon configured; skipping.');
    return;
  }

  const projectName = IOSConfig.XcodeUtils.getProjectName(projectRoot);
  const iosRoot = path.join(projectRoot, 'ios', projectName);
  const imageset = path.join(iosRoot, IMAGESET_PATH);
  await fs.promises.mkdir(imageset, { recursive: true });

  // Drop universal single-size files from Expo's default generator.
  for (const name of await fs.promises.readdir(imageset)) {
    if (name === 'Contents.json') continue;
    await fs.promises.unlink(path.join(imageset, name)).catch(() => {});
  }

  const images = [];

  for (const slot of ICON_SLOTS) {
    for (const scale of slot.scales) {
      const px = Math.round(slot.size * scale);
      const filename = fileName(slot.size, scale);
      const { source } = await generateImageAsync(
        { projectRoot, cacheType: `${CACHE}-${px}` },
        {
          src: iconSrc,
          name: filename,
          width: px,
          height: px,
          resizeMode: 'cover',
          // App Store marketing icon must be opaque.
          removeTransparency: true,
          backgroundColor: '#000000',
        }
      );
      await fs.promises.writeFile(path.join(imageset, filename), source);
      images.push({
        filename,
        idiom: slot.idiom,
        scale: `${scale}x`,
        size: `${sizeLabel(slot.size)}x${sizeLabel(slot.size)}`,
      });
    }
  }

  const contents = {
    images,
    info: { version: 1, author: 'benkimim-classic-icons' },
  };
  await fs.promises.writeFile(
    path.join(imageset, 'Contents.json'),
    `${JSON.stringify(contents, null, 2)}\n`
  );
}

function withClassicIosAppIcons(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      await writeClassicIconsAsync(cfg, cfg.modRequest.projectRoot);
      return cfg;
    },
  ]);
}

module.exports = withClassicIosAppIcons;
