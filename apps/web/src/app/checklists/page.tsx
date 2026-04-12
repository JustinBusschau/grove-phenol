'use client'

export default function ChecklistsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Infusion Checklists</h1>
        <a href="/checklists/new" className="btn btn-primary">
          New Checklist
        </a>
      </div>
      
      <div className="card">
        <h2 className="card-title">Active Checklists</h2>
        <p className="text-muted">No active checklists found.</p>
      </div>
      
      <div className="card">
        <h2 className="card-title">Completed Checklists</h2>
        <p className="text-muted">No completed checklists found.</p>
      </div>
    </div>
  )
}
