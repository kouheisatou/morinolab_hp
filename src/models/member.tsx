export class Member {
  private static _counter = 0;
  id: number;
  name: string;
  desc: string;
  nameEnglish: string;
  descEnglish: string;
  thumbnail?: string;
  tagIds: number[];
  admissionYear: number;
  repeats: number;
  graduated: boolean;
  master: boolean; // 在籍または卒業が修士課程
  bachelor: boolean; // 在籍または卒業が学部課程
  gradYear?: number;
  url?: string;

  constructor(
    id: number,
    name: string,
    desc: string,
    nameEnglish: string,
    descEnglish: string,
    admissionYear: number,
    thumbnail?: string,
    tagIds: number[] = [],
    repeats: number = 0,
    graduated: boolean = false,
    master: boolean = false,
    bachelor: boolean = false,
    gradYear?: number,
    url?: string,
  ) {
    this.id = id;
    this.name = name;
    this.desc = desc;
    this.nameEnglish = nameEnglish;
    this.descEnglish = descEnglish;
    this.thumbnail = thumbnail;
    this.tagIds = tagIds;
    this.admissionYear = admissionYear;
    this.repeats = repeats;
    this.graduated = graduated;
    this.master = master;
    this.bachelor = bachelor;
    this.gradYear = gradYear;
    this.url = url;
  }
}
