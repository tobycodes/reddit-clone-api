import HashIds from "hashids";
import { Hasher } from "@lib/Hasher";

const hashIds = new HashIds(process.env.SECRET, 8);

export default new Hasher(hashIds);
