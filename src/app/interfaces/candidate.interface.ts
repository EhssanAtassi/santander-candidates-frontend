export interface Candidate {
  id: string;
  name: string;
  surname: string;
  seniority: 'junior' | 'senior';
  years: number;
  availability: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExcelData {
  seniority: 'junior' | 'senior';
  years: number;
  availability: boolean;
}
