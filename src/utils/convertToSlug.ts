import slugify from "slugify";

export const convertToSlug = (string: string) =>
  slugify(string, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
