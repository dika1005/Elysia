// Daftar email admin yang hardcoded
export const ADMIN_EMAILS = [
  'admin@gmail.com'
]

// Fungsi untuk cek apakah user adalah admin
export const isAdmin = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

// Fungsi untuk get role berdasarkan email
export const getUserRole = (email: string): 'admin' | 'user' => {
  return isAdmin(email) ? 'admin' : 'user'
}
