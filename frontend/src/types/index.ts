export interface Employee {
  id: number;
  name: string;
  slot: number;
}

export interface Price {
  id: number;
  type: 'kecil' | 'sedang' | 'besar';
  price: number;
  updated_at: string;
}

export interface Transaction {
  id: number;
  employee_id: number;
  employee_name: string;
  motor_type: 'kecil' | 'sedang' | 'besar';
  price: number;
  date: string;
  created_at: string;
}

export interface DailyStats {
  total_transactions: number;
  total_revenue: number;
  kecil_count: number;
  sedang_count: number;
  besar_count: number;
}

export interface HourlyData {
  hour: number;
  label: string;
  count: number;
}

export interface EmployeeStat {
  employee_id: number;
  employee_name: string;
  total_washed: number;
  total_revenue: number;
}

export interface WeeklyData {
  date: string;
  total_transactions: number;
  total_revenue: number;
}

export interface AuthUser {
  email: string;
  role: 'owner';
}
