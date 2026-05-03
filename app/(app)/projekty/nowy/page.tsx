import Topbar from '@/components/layout/Topbar'
import ProjectForm from '@/components/projects/ProjectForm'

export default function NowyProjektPage() {
  return (
    <>
      <Topbar title="Nowy projekt" />
      <div className="p-7"><ProjectForm /></div>
    </>
  )
}
