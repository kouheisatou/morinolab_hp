// import { Member } from "./member";

export class Publication {
  id: number;
  authorMemberIds: number[]; // 著者 Member ID 配列（カンマ区切りリストを数値配列化）
  tagIds: number[]; // タグID配列（新）
  titleJa?: string; // 題目（日本語）
  titleEn?: string; // 題目（英語）
  publicationNameJa?: string; // 掲載誌・会議名など（日本語）
  publicationNameEn?: string; // 掲載誌・会議名など（英語）
  thumbnail?: string; // サムネイル画像パス

  constructor(
    id: number,
    authorMemberIds: number[],
    tagIds: number[],
    titleJa?: string,
    titleEn?: string,
    publicationNameJa?: string,
    publicationNameEn?: string,
    thumbnail?: string,
  ) {
    this.id = id;
    this.authorMemberIds = authorMemberIds;
    this.tagIds = tagIds;
    this.titleJa = titleJa;
    this.titleEn = titleEn;
    this.publicationNameJa = publicationNameJa;
    this.publicationNameEn = publicationNameEn;
    this.thumbnail = thumbnail;
  }
}
