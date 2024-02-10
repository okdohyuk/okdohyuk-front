export default class StringUtils {
  static toUrlSlug = (slug: string) => {
    const regex = new RegExp(/[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9 ]/, 'g');
    return slug.replace(regex, '').replaceAll(' ', '-');
  };
}
