export class Lecture {
  id: number;
  img: string;
  titleJa: string;
  titleEn: string;
  descJa: string;
  descEn: string;
  url?: string;

  constructor(
    id: number,
    img: string,
    titleJa: string,
    titleEn: string,
    descJa: string,
    descEn: string,
    url?: string,
  ) {
    this.id = id;
    this.img = img;
    this.titleJa = titleJa;
    this.titleEn = titleEn;
    this.descJa = descJa;
    this.descEn = descEn;
    this.url = url;
  }
}
