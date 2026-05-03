'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Nieprawidłowy email lub hasło.')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px)',backgroundSize:'60px 60px'}}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-wordmark text-3xl text-white tracking-tight">
            PROJEKTANT<span className="text-orange">24</span>
          </div>
          <div className="text-xs text-mid uppercase tracking-widest mt-1">CRM</div>
        </div>
        <form onSubmit={handleLogin} className="bg-dark border-t-2 border-orange p-8 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-mid mb-2">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-black border border-light/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-orange"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-mid mb-2">Hasło</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-black border border-light/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-orange"
            />
          </div>
          {error && <p className="text-orange text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="bg-orange text-white font-display font-bold text-sm uppercase tracking-widest py-3 hover:bg-orange-d disabled:opacity-50 transition-colors"
          >
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>
      </div>
    </div>
  )
}
