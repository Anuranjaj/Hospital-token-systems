export interface Hospital {
  id: number
  name: string
  about: string
  address: string
  contact_details: string
}

export interface Department {
  id: number
  name: string
  description: string
}

export interface Doctor {
  id: number
  name: string
  specialization: Department | null
  experience: string
  consultation_time: string
  available_days: string
  photo_url: string
}

export interface PublicToken {
  id: number
  doctor: Doctor
  token_number: number
  date: string
  status: 'Waiting' | 'Current' | 'Consulted' | 'Not Reached'
}

export interface Token extends PublicToken {
  patient_name: string
  phone_number: string
}
