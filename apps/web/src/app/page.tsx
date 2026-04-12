export default function HomePage() {
  return (
    <div className="text-center">
      <h1>Welcome to Phenol</h1>
      <p className="text-muted mb-4">
        Medication management and infusion process checklists
      </p>
      <div className="card">
        <h2 className="card-title">Getting Started</h2>
        <p>
          Please <a href="/login">log in</a> to access the system or contact your administrator
          for account setup.
        </p>
      </div>
    </div>
  )
}
