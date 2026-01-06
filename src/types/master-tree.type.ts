export type Direction = "ancestors" | "descendants";

export type relation = {
  id: number;
  advisors: number[];
  advisees: number[];
};

export type Researcher = {
  id: number;
  name: string[];
  advisors: number[];
  affiliation: string;
  title: string;
  category: string;
  keywords: string[];
  award_date: string;
};
