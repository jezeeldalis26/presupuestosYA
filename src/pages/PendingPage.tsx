import { Hourglass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState, PageHeader, PendingBadge } from '../components/ui'

export function PendingPage({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <PageHeader title={title} action={<PendingBadge />} />
      <EmptyState
        icon={<Hourglass className="size-7" />}
        title="Esta sección aún no está disponible"
        text={text}
        action={
          <Link to="/tabulador" className="btn-ghost">
            Mientras tanto, completa tu tabulador
          </Link>
        }
      />
    </div>
  )
}
