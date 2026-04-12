'use client'

export default function ChecklistDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Checklist Details</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a href="/checklists" className="btn btn-secondary">
            Back to List
          </a>
        </div>
      </div>
      
      <div className="card">
        <h2 className="card-title">Checklist #{params.id}</h2>
        <p className="text-muted">Loading checklist details...</p>
      </div>
      
      <div className="card">
        <h3 className="card-title">Checklist Steps</h3>
        <p className="text-muted">No steps found.</p>
      </div>
    </div>
  )
}
