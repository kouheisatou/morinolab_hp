export class Award {
  id: number;
  thumbnail: string;
  nameJa: string;
  nameEn: string;
  memberIds: number[];
  date: Date;

  constructor(
    id: number,
    thumbnail: string,
    nameJa: string,
    nameEn: string,
    memberIds: number[],
    date: Date,
  ) {
    this.id = id;
    this.thumbnail = thumbnail;
    this.nameJa = nameJa;
    this.nameEn = nameEn;
    this.memberIds = memberIds;
    this.date = date;
  }
}
