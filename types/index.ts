export interface Answer {
  id: string;
  title: string;
  sections: { [key: string]: string };
}

export interface Question {
  id: string;
  text: string;
  answer: Answer | null;
  createdAt: number;
}

export interface Project {
  id: string;
  title: string;
  questions: Question[];
  createdAt: number;
  updatedAt: number;
}
