import { describe, expect, it } from 'vitest';
import { parsePresentationHtml } from '../htmlParser';
import { resolveImportedImages, unusedImageAssetNames } from '../importHtmlImages';

const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const deckHtml = `<!doctype html><html><body>
  <section class="slide" data-label="41 Media Full-bleed Image">
    <h1>원격</h1>
    <img src="https://cdn.example.com/remote.png" />
  </section>
  <section class="slide" data-label="42 Media Image with Caption">
    <h1>인라인</h1>
    <img src="data:image/png;base64,${PNG_BASE64}" />
  </section>
  <section class="slide" data-label="43 Media Screenshot Annotated">
    <h1>로컬 파일</h1>
    <img src="./assets/hero.png" />
  </section>
</body></html>`;

describe('resolveImportedImages', () => {
  it('keeps http urls and uploads data urls plus matching local files', async () => {
    const parsed = parsePresentationHtml(deckHtml);
    const uploaded: string[] = [];
    const localImage = new File([Uint8Array.from([1, 2, 3, 4])], 'hero.png', { type: 'image/png' });

    const resolved = await resolveImportedImages(parsed, [localImage], async (file) => {
      uploaded.push(file.name);
      return `https://mock.local/files/${file.name}`;
    });

    expect(resolved.document.slides[0].imageUrl).toBe('https://cdn.example.com/remote.png');
    expect(resolved.document.slides[1].imageUrl).toBe('https://mock.local/files/inline.png');
    expect(resolved.document.slides[2].imageUrl).toBe('https://mock.local/files/hero.png');
    expect(uploaded).toEqual(['inline.png', 'hero.png']);
  });

  it('rejects image files that the HTML does not reference', () => {
    const parsed = parsePresentationHtml(deckHtml);
    const unused = unusedImageAssetNames(parsed.imageSources, [
      new File([Uint8Array.from([1])], 'hero.png', { type: 'image/png' }),
      new File([Uint8Array.from([2])], 'orphan.jpg', { type: 'image/jpeg' }),
    ]);
    expect(unused).toEqual(['orphan.jpg']);
  });
});
