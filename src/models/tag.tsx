export class Tag {
  private static _counter = 0
  id: number
  name: string
  name_english: string

  constructor(id: number, name: string, name_english: string) {
    this.id = id
    this.name = name
    this.name_english = name_english
  }
}
