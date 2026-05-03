import { NextRequest } from 'next/server'

export function validateClaudeKey(req: NextRequest): boolean {
  return req.headers.get('x-claude-key') === process.env.CLAUDE_API_KEY
}
