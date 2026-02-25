export type Direction = "ancestors" | "descendants";

export type Relation = {
  id: number;
  advisors: number[];
  advisees: number[];
};

export type Researcher = {
  id: number;
  names: string[];
  advisors: string[];
  affiliation: string | null;
  title: string | null;
  category: string | null;
  keywords: string[];
  award_date: string;
};
