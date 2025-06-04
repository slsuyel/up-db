export interface PaymentInfo {
  maintance_fee_id: number
  amount: string
  transaction_fee: string
  type: string
  period: string
  paid_at: string
}

export interface MaintenanceFee {
  full_name: string
  short_name_e: string
  division_name: string
  district_name: string
  upazila_name: string
  chairman_phone: string | null
  secretary_phone: string | null
  udc_phone: string | null
  user_phone: string | null
  maintance_fee: string
  maintance_fee_type: string
  maintance_fee_option: string
  payment_info: PaymentInfo | null
}

export interface FilterState {
  type: string
  period: string
  status: string
  upazila_name: string
}

export interface ApiResponse {
  data: MaintenanceFee[]
  isError: boolean
  error: string | null
  status_code: number
}
