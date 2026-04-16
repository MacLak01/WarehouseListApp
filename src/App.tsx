const warehouses = [
  { name: 'North Hub', city: 'Manchester', status: 'Online', stock: '12,480 units' },
  { name: 'Central Depot', city: 'Birmingham', status: 'Low stock', stock: '3,210 units' },
  { name: 'South Terminal', city: 'London', status: 'Online', stock: '18,904 units' },
];

function App() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Warehouse Operations</p>
        <h1>Track inventory across every warehouse from one clean dashboard.</h1>
        <p className="lede">
          A React + TypeScript starter for managing locations, stock levels, and operational status.
        </p>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Live locations</h2>
          <span>Updated just now</span>
        </div>

        <div className="warehouse-grid">
          {warehouses.map((warehouse) => (
            <article className="warehouse-card" key={warehouse.name}>
              <p className="warehouse-name">{warehouse.name}</p>
              <p className="warehouse-city">{warehouse.city}</p>
              <div className="warehouse-meta">
                <strong>{warehouse.stock}</strong>
                <span>{warehouse.status}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
