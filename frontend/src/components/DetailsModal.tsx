import { Point } from "../hooks/usePoints";

interface DetailsModalProps {
    point: Point | null;
    onClose: () => void;
}

export function DetailsModal({ point, onClose }: DetailsModalProps) {
    if (!point) {
        return (
            <div className="point-details point-details-empty">
                Выберите точку на карте или в таблице
            </div>
        );
    }

    return (
        <div className="point-details">
            <div className="point-details-head">
                <h2>{point.name}</h2>
                <button type="button" className="btn-close" aria-label="Закрыть" onClick={onClose} />
            </div>
            <dl className="row mb-0">
                <dt className="col-5">ID</dt>
                <dd className="col-7">{point.id}</dd>
                <dt className="col-5">Площадь</dt>
                <dd className="col-7">{Number(point.area).toFixed(3)}</dd>
                <dt className="col-5">Статус</dt>
                <dd className="col-7">{point.status ? "Активна" : "Архив"}</dd>
                <dt className="col-5">Дата создания</dt>
                <dd className="col-7">{point.date_create}</dd>
                <dt className="col-5">Тип</dt>
                <dd className="col-7">Type{point.type}</dd>
                <dt className="col-5">Долгота</dt>
                <dd className="col-7">{point.lon ?? "—"}</dd>
                <dt className="col-5">Широта</dt>
                <dd className="col-7">{point.lat ?? "—"}</dd>
            </dl>
        </div>
    );
}
