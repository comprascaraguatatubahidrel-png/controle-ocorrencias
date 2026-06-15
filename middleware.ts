import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const { nextUrl } = req
  
  // Usamos getToken para evitar importar o Prisma/bcrypt no Edge Runtime
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || '' })
  const isLoggedIn = !!token

  const isAuthPage = nextUrl.pathname.startsWith('/login')
  const isApiAuth = nextUrl.pathname.startsWith('/api/auth')
  const isPublic = isAuthPage || isApiAuth

  if (!isLoggedIn && !isPublic) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
