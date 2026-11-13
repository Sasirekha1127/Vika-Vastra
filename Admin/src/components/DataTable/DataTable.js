import { memo, useMemo, useState, useEffect } from 'react';

const defaultSearchText = (row) => {
  const values = [];
  const collect = (value) => {
    if (value == null) return;
    if (Array.isArray(value)) value.forEach(collect);
    else if (typeof value === 'object') Object.values(value).forEach(collect);
    else values.push(String(value));
  };
  collect(row);
  return values.join(' ');
};

function DataTable({ columns, initialRows = [], renderRow, memoizeRows = false, searchText = defaultSearchText }) {
  const [rows, setRows] = useState(Array.isArray(initialRows) ? initialRows : []);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setRows(Array.isArray(initialRows) ? initialRows : []);
  }, [initialRows]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return rows;
    return rows.filter((r) =>
      String(searchText(r) || '').toLocaleLowerCase().includes(normalizedQuery)
    );
  }, [rows, query, searchText]);

  const deleteRow = (id) => {
    if (window.confirm('Are you sure?')) {
      setRows((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div>
      <div className="section-header">
        <input
          className="search-input"
          placeholder={columns.includes('GST') && columns.includes('Stock') ? 'Search product name or SKU...' : 'Search...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className={`km-table-wrap${columns[0] === 'Select' && columns[1] === 'Order ID' ? ' km-orders-table-wrap' : ''}`}>
        <table className={`data-table${columns[0] === 'Select' && columns[1] === 'Order ID' ? ' km-orders-table' : ''}`}>
          <thead>
            <tr>
              {columns.map((col, index) => <th key={typeof col === 'string' ? col : `column-${index}`}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="km-empty">
                  No items found.
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => renderRow(row, i, deleteRow))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(DataTable, (previous, next) => {
  if (previous.searchText !== next.searchText) return false;
  if (previous.memoizeRows && next.memoizeRows) {
    return previous.initialRows === next.initialRows && previous.columns === next.columns;
  }
  return previous.initialRows === next.initialRows &&
    previous.columns === next.columns &&
    previous.renderRow === next.renderRow &&
    previous.memoizeRows === next.memoizeRows;
});
