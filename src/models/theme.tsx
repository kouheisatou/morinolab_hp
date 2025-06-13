export class Theme {
  id: number;
  img: string;
  titleJa: string;
  titleEn: string;
  descJa: string;
  descEn: string;

  constructor(
    id: number,
    img: string,
    titleJa: string,
    titleEn: string,
    descJa: string,
    descEn: string,
  ) {
    this.id = id;
    this.img = img;
    this.titleJa = titleJa;
    this.titleEn = titleEn;
    this.descJa = descJa;
    this.descEn = descEn;
  }
}
