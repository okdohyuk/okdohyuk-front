export default class Jwt {
  public static getPayload(token: string): { [key: string]: any } {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  }
}
