export default class ClassName {
  static cls(...classnames: string[]) {
    return classnames.join(' ');
  }
}

export const { cls } = ClassName;
