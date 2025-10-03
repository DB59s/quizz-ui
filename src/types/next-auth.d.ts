// types/next-auth.d.ts
import type { DefaultSession, DefaultUser } from 'next-auth'
import type { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    user: {
      id: string
      sub: string
      phoneNumber: string
      companyName: string
      email: string
      roles: string[]
      approveStatus: string
      fullName: string
      defaultLanguage: string
      currency: string
      status: string
      isVerified: boolean
      isCompany: boolean
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    sub: string
    phoneNumber: string
    companyName: string
    email: string
    roles: string[]
    approveStatus: string
    fullName: string
    accessToken: string
    defaultLanguage: string
    currency: string
    status: string
    isVerified: boolean
    isCompany: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    sub: string
    phoneNumber: string
    companyName: string
    roles: string[]
    approveStatus: string
    accessToken: string
    defaultLanguage: string
    currency: string
    status: string
    isVerified: boolean
    isCompany: boolean
  }
}
