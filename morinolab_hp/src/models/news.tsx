export class NewsItem {
  id: number;
  date: string; // YYYY-MM-DD
  textJa: string;
  textEn: string;
  thumbnail?: string;
  url?: string;

  constructor(
    id: number,
    date: string,
    textJa: string,
    textEn: string,
    thumbnail?: string,
    url?: string,
  ) {
    this.id = id;
    this.date = date;
    this.textJa = textJa;
    this.textEn = textEn;
    this.thumbnail = thumbnail;
    this.url = url;
  }
}
