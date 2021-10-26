import { HasherInstance } from "@custom-types/hasher";

export class Hasher {
  private hasher: HasherInstance;
  constructor(hasherInstance: HasherInstance) {
    this.hasher = hasherInstance;
  }

  public encode(...args: Array<string | number>) {
    return this.hasher.encode(args);
  }

  public decode(string: string) {
    const result = this.hasher.decode(string);

    return result.length <= 1 ? result[0] : result;
  }
}
