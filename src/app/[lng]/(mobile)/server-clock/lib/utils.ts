export function getHostname(urlStr: string): string {
  try {
    if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
      return new URL(`https://${urlStr}`).hostname;
    }
    return new URL(urlStr).hostname;
  } catch (e) {
    return urlStr.replace(/^https?:\/\//, '');
  }
}
