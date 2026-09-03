import { MapComponent } from "./components/MapComponent";
import { TableComponent } from "./components/TableComponent";
import { DetailsModal } from "./components/DetailsModal";
import { usePoints, Point  } from "./hooks/usePoints";
import { useState } from "react";

export function App() {
    const { points, loading, error, 
            page, setPage, total, pageSize,
            search, setSearch, ordering, setOrdering, 
    } = usePoints()
    const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
    return (
        <div className="app">
            <header className="app-header">
                <h1>GeoPoints</h1>
            </header>
            <div className="app-body">
                {error && <div className="alert alert-danger mt-2">{error}</div>}
            <div className="row g-3">
                <div className="col-md-7">
                    <MapComponent selectedPoint={selectedPoint} onPointClick={setSelectedPoint} />
                    <DetailsModal point={selectedPoint} onClose={() => setSelectedPoint(null)} />
                </div>
                <div className="col-md-5">
                    <TableComponent points={points} loading={loading} page={page} setPage={setPage} total={total}
                        pageSize={pageSize} search={search} setSearch={setSearch} ordering={ordering}
                        setOrdering={setOrdering} onRowClick={setSelectedPoint}/>
                </div>
            </div>
            </div>
        </div>
    );
}
