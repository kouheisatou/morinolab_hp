export class Company {
  id: number
  logo: string
  nameJa: string
  nameEn: string
  year: number

  constructor(id: number, logo: string, nameJa: string, nameEn: string, year: number) {
    this.id = id
    this.logo = logo
    this.nameJa = nameJa
    this.nameEn = nameEn
    this.year = year
  }
} 