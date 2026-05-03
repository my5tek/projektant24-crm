export function middleware() {
  return Response.next()
}

export const config = {
  matcher: '/never-match-this',
}