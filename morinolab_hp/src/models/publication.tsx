// import { Member } from "./member";

export class Publication {
  id: number;
  fiscalYear: number; // 年度（例：2024）
  type: string; // 種別（自由記述：例 "ジャーナル論文"）
  authorMemberIds: number[]; // 著者 Member ID 配列（カンマ区切りリストを数値配列化）
  tagIds: number[]; // タグID配列（新）
  titleJa?: string; // 題目（日本語）
  titleEn?: string; // 題目（英語）
  publicationNameJa?: string; // 掲載誌・会議名など（日本語）
  publicationNameEn?: string; // 掲載誌・会議名など（英語）
  volume?: string; // 巻（例：Vol.J108-B）
  number?: string; // 号（例：No.03）
  pages?: string; // ページ（例：pp.100–110）
  dateJa?: string; // 発行年月（日本語：例 "2025年3月"）
  dateEn?: string; // 発行年月（英語：例 "March 2025"）
  locationJa?: string; // 開催地（日本語）
  locationEn?: string; // 開催地（英語）
  notesJa?: string; // 備考や受賞（日本語）
  notesEn?: string; // 備考や受賞（英語）
  thumbnail?: string; // サムネイル画像パス
  url?: string; // 詳細ページ

  constructor(
    id: number,
    fiscalYear: number,
    type: string,
    authorMemberIds: number[],
    tagIds: number[],
    titleJa?: string,
    titleEn?: string,
    publicationNameJa?: string,
    publicationNameEn?: string,
    volume?: string,
    number?: string,
    pages?: string,
    dateJa?: string,
    dateEn?: string,
    locationJa?: string,
    locationEn?: string,
    notesJa?: string,
    notesEn?: string,
    thumbnail?: string,
    url?: string,
  ) {
    this.id = id;
    this.fiscalYear = fiscalYear;
    this.type = type;
    this.authorMemberIds = authorMemberIds;
    this.tagIds = tagIds;
    this.titleJa = titleJa;
    this.titleEn = titleEn;
    this.publicationNameJa = publicationNameJa;
    this.publicationNameEn = publicationNameEn;
    this.volume = volume;
    this.number = number;
    this.pages = pages;
    this.dateJa = dateJa;
    this.dateEn = dateEn;
    this.locationJa = locationJa;
    this.locationEn = locationEn;
    this.notesJa = notesJa;
    this.notesEn = notesEn;
    this.thumbnail = thumbnail;
    this.url = url;
  }
}
