export class Company {
  id: number;
  thumbnail: string;
  nameJa: string;
  nameEn: string;
  year: number;

  constructor(
    id: number,
    thumbnail: string,
    nameJa: string,
    nameEn: string,
    year: number,
  ) {
    this.id = id;
    this.thumbnail = thumbnail;
    this.nameJa = nameJa;
    this.nameEn = nameEn;
    this.year = year;
  }
}
