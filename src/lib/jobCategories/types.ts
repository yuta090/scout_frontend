export interface JobCategory {
  id: string;
  name: string;
  subcategories?: {
    id: string;
    name: string;
    jobs?: {
      id: string;
      name: string;
      value: string;
    }[];
  }[];
}