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
  topic?: string; // Optional topic/group name for organizing questions
}

export interface Project {
  id: string;
  title: string;
  questions: Question[];
  createdAt: number;
  updatedAt: number;
}

export interface DiagramNode {
  id: string;
  type?: string;
  data: {
    label: string;
    [key: string]: any;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  [key: string]: any;
}

export interface DiagramGraph {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}
