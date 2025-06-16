export class Theme {
  id: number;
  thumbnail: string;
  titleJa: string;
  titleEn: string;
  descJa: string;
  descEn: string;
  url?: string;

  constructor(
    id: number,
    thumbnail: string,
    titleJa: string,
    titleEn: string,
    descJa: string,
    descEn: string,
    url?: string,
  ) {
    this.id = id;
    this.thumbnail = thumbnail;
    this.titleJa = titleJa;
    this.titleEn = titleEn;
    this.descJa = descJa;
    this.descEn = descEn;
    this.url = url;
  }
}
