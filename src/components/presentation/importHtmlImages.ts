import type { ParseHtmlResult } from './htmlParser';

const DATA_URL_PATTERN = /^data:([^;,]+)?(;base64)?,([\s\S]+)$/i;

const extensionFromMime = (mime: string) => {
  if (mime.includes('jpeg')) return 'jpg';
  if (mime.includes('png')) return 'png';
  if (mime.includes('gif')) return 'gif';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('svg')) return 'svg';
  return 'bin';
};

export const fileNameOfSrc = (src: string) =>
  src.split(/[?#]/)[0]?.split('/')?.pop()?.toLowerCase() ?? '';

export const isRemoteImageSrc = (src: string) => /^https?:\/\//i.test(src);

export const isDataImageSrc = (src: string) => /^data:/i.test(src);

export const isHtmlFile = (file: File) => /\.html?$/i.test(file.name) || file.type.includes('html');

export const isImageFile = (file: File) =>
  file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name);

/** HTML img 상대경로에 없는 첨부 이미지. 하나라도 있으면 업로드를 막는다. */
export const unusedImageAssetNames = (
  imageSources: { src: string }[],
  assets: File[],
): string[] => {
  const referenced = new Set(
    imageSources
      .map((source) => source.src)
      .filter((src) => src && !isRemoteImageSrc(src) && !isDataImageSrc(src))
      .map(fileNameOfSrc)
      .filter(Boolean),
  );
  return assets
    .filter(isImageFile)
    .map((file) => file.name)
    .filter((name) => !referenced.has(name.toLowerCase()));
};

const parseDataUrl = (src: string): File | null => {
  const match = DATA_URL_PATTERN.exec(src);
  if (!match) return null;
  const mime = match[1] || 'application/octet-stream';
  const isBase64 = Boolean(match[2]);
  const payload = match[3] ?? '';
  const bytes = isBase64
    ? Uint8Array.from(atob(payload), (char) => char.charCodeAt(0))
    : new TextEncoder().encode(decodeURIComponent(payload));
  return new File([bytes], `inline.${extensionFromMime(mime)}`, { type: mime });
};

/** HTML img src(data URL·상대경로)를 업로드해 slide.imageUrl 로 치환한다. http(s)는 그대로 둔다. */
export const resolveImportedImages = async (
  result: ParseHtmlResult,
  assets: File[],
  upload: (file: File) => Promise<string>,
): Promise<ParseHtmlResult> => {
  const slides = result.document.slides.map((slide) => ({ ...slide }));
  const filesByName = new Map(assets.map((file) => [file.name.toLowerCase(), file]));

  await Promise.all(
    result.imageSources.map(async ({ slideIndex, src }) => {
      const slide = slides[slideIndex];
      if (!slide || !src) return;
      if (/^https?:\/\//i.test(src)) {
        slide.imageUrl = src;
        return;
      }
      const dataFile = parseDataUrl(src);
      const namedFile = filesByName.get(fileNameOfSrc(src));
      const file = dataFile ?? namedFile;
      if (!file) return;
      slide.imageUrl = await upload(file);
    }),
  );

  return {
    ...result,
    document: {
      ...result.document,
      slides,
    },
  };
};
