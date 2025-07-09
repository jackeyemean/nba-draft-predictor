// ResultsTable.js
import React, { useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';

export default function ResultsTable({
  data,
  highlightNames = [],
  defaultSort = [{ id: 'Predicted Score', desc: true }]
}) {
  const columns = useMemo(
    () => [
      { Header: 'Draft Year', accessor: 'Draft Year' },
      { Header: 'Pick Number', accessor: 'Pick Number' },
      { Header: 'Name', accessor: 'Name' },
      { Header: 'Position', accessor: 'Position Group' },
      {
        Header: 'Predicted Score',
        accessor: 'Predicted Score',
        sortType: (rowA, rowB, columnId) =>
          rowA.values[columnId] - rowB.values[columnId]
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable(
    { columns, data, initialState: { sortBy: defaultSort } },
    useSortBy
  );

  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <div className="overflow-x-auto">
        <table {...getTableProps()} className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            {headerGroups.map((hg, i) => (
              <tr {...hg.getHeaderGroupProps()} key={i}>
                {hg.headers.map((col, j) => (
                  <th
                    {...col.getHeaderProps(col.getSortByToggleProps())}
                    key={j}
                    className="sticky top-0 px-4 py-2 text-left text-sm font-semibold text-gray-800 uppercase border-b border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <span>{col.render('Header')}</span>
                      <span className="flex flex-col space-y-0.5">
                        {col.isSorted ? (
                          col.isSortedDesc ? (
                            <svg className="w-4 h-4 text-gray-800" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M5 7l5 5 5-5H5z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-800" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M5 13l5-5 5 5H5z" />
                            </svg>
                          )
                        ) : (
                          <div className="flex flex-col opacity-50">
                            <svg className="w-3 h-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M5 13l5-5 5 5H5z" />
                            </svg>
                            <svg className="w-3 h-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M5 7l5 5 5-5H5z" />
                            </svg>
                          </div>
                        )}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
            {rows.map((row, idx) => {
              prepareRow(row);
              const name     = row.original.Name;
              const pick     = row.original['Pick Number'];
              const isCustom = pick === '—';
              const isMatch  = highlightNames.includes(name);
              const bgClass  = isMatch || isCustom ? 'bg-gray-200' : '';
              const hoverCls = isCustom ? '' : 'hover:bg-gray-100';
              return (
                <tr
                  {...row.getRowProps()}
                  data-name={name}
                  className={`${bgClass} ${hoverCls}`}
                >
                  {row.cells.map((cell, k) => (
                    <td
                      {...cell.getCellProps()}
                      key={k}
                      className="px-4 py-2 text-sm text-gray-800"
                    >
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
