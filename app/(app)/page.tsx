import Topbar from '@/components/layout/Topbar'

export default async function DashboardPage() {
  return (
    <>
      <Topbar title="Dashboard" />
      <div className="p-7">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-2">Ładowanie danych...</p>
      </div>
    </>
  )
}