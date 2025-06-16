export class Lecture {
  id: number;
  thumbnail: string;
  titleJa: string;
  titleEn: string;
  descJa: string;
  descEn: string;

  constructor(
    id: number,
    thumbnail: string,
    titleJa: string,
    titleEn: string,
    descJa: string,
    descEn: string,
  ) {
    this.id = id;
    this.thumbnail = thumbnail;
    this.titleJa = titleJa;
    this.titleEn = titleEn;
    this.descJa = descJa;
    this.descEn = descEn;
  }
}
