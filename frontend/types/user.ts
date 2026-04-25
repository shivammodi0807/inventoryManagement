export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  created_at: string;
}
