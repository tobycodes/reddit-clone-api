export type NumberLike = string | number | bigint;

export interface HasherInstance {
  encode(input: NumberLike[]): string;
  decode(input: string): NumberLike[];
}
