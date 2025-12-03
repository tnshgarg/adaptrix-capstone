import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {

  },
  {
    callbacks: {
      authorized: ({ token, req }) => {

        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*']
}