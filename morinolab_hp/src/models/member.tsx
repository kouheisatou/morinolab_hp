export class Member {
  private static _counter = 0;
  id: number;
  name: string;
  desc: string;
  nameEnglish: string;
  descEnglish: string;
  thumbnail?: string;
  tagIds: number[];
  memberTypeId: number; // MemberType dataset foreign key
  gradYear?: number;

  constructor(
    id: number,
    name: string,
    desc: string,
    nameEnglish: string,
    descEnglish: string,
    memberTypeId: number,
    thumbnail?: string,
    tagIds: number[] = [],
    gradYear?: number,
  ) {
    this.id = id;
    this.name = name;
    this.desc = desc;
    this.nameEnglish = nameEnglish;
    this.descEnglish = descEnglish;
    this.memberTypeId = memberTypeId;
    this.thumbnail = thumbnail;
    this.tagIds = tagIds;
    this.gradYear = gradYear;
  }
}
