import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from "@tanstack/react-table";
import { Point } from "../hooks/usePoints";

interface TableProps {
    points: Point[]; loading: boolean;
    page: number; setPage: (p: number) => void;
    total: number; pageSize: number;
    search: string; setSearch: (s: string) => void;
    ordering: string; setOrdering: (o: string) => void;
    onRowClick: (p: Point) => void;
}

const columnHelper = createColumnHelper<Point>();
const pagesCount = (total: number, pageSize: number) => Math.max(1, Math.ceil(total/pageSize));

export function TableComponent({ 
    points, loading, page, setPage, total, pageSize, 
    search, setSearch, ordering, setOrdering, onRowClick,
 }: TableProps) {
    const columns = [
        columnHelper.accessor("id", {
            header: "№", 
            cell: info => info.row.index + 1 + (page - 1) * pageSize, 
            size: 60,
            enableSorting: false,
        }),
        columnHelper.accessor("name", {header: "Название"}),
        columnHelper.accessor("area", {header:"Площадь" }),
        columnHelper.accessor("status", {header: "Активна", cell: info => info.getValue() ? "Да" : "Нет",}),
        columnHelper.accessor("date_create", {header: "Дата"}),
    ];
    const sorting = ordering
        ? [{ id: ordering.replace("-", ""), desc: ordering.startsWith("-")}]
        : [];

    const table = useReactTable({
        data: points,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualFiltering: true,
        manualSorting: true,
        pageCount: pagesCount(total, pageSize),
        state: {sorting},
        onSortingChange: updater => {
            const next = typeof updater === "function" ? updater(sorting) : updater;
            const sort = next[0];
            
            if(!sort) {
                setOrdering("");
                return;
            }
            setOrdering(sort.desc ? `-${sort.id}` : sort.id);
        },
    });
    return(
        <div>
            <input value={search} 
                onChange={e =>{
                    setSearch(e.target.value); 
                    setPage(1);
                }} placeholder="Поиск по названию" 
                className="form-control mb-2"
                />
            <div className="table-wrap">
                {loading && <div className="table-overlay">Загрузка</div>}
                {!loading && points.length === 0 && (
                      <div className="text-center text-muted">Ничего ненайдено</div>
                )}
            <table className="table table-striped table-hover">
                <thead>
                    {table.getHeaderGroups().map(hg => (
                        <tr key={hg.id}>{hg.headers.map(h => ( // hg - heaeder group
                            <th 
                            key={h.id} 
                            onClick={h.column.getToggleSortingHandler()}>
                                {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                                {h.column.getCanSort() && (
                                    <span className="sort-icons" aria-hidden="true">
                                        <span className={h.column.getIsSorted() === "asc" ? "chevron is-on" : "chevron"}>▲</span>
                                        <span className={h.column.getIsSorted() === "desc" ? "chevron is-on" : "chevron"}>▼</span>
                                    </span>
                                )}
                            </th>
                        ))}</tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id} onClick={() => onRowClick(row.original)}
                        style={{cursor: "pointer"}}>
                            {row.getVisibleCells().map(cell => <td key={cell.id}> {flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3 px-1">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Назад</button>
                <span>Страница {page} из {pagesCount(total, pageSize)}</span>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage(Math.min(pagesCount(total, pageSize), page + 1))} disabled={page*pageSize >= total}>Вперёд</button>
            </div>
        </div>
    );
}