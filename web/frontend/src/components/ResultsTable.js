import React, { useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';

export default function ResultsTable({
  data, highlightNames = [], defaultSort=[{id:'Predicted Score',desc:true}]
}) {
  const columns = useMemo(() => [
    { Header:'Draft Year', accessor:'Draft Year' },
    { Header:'Pick Number',accessor:'Pick Number' },
    { Header:'Name',        accessor:'Name' },
    { Header:'Position',    accessor:'Position Group' },
    {
      Header:'Predicted Score',
      accessor:'Predicted Score',
      sortType: (a,b,id) => a.values[id] - b.values[id]
    },
  ], []);

  const {
    getTableProps, getTableBodyProps,
    headerGroups, rows, prepareRow
  } = useTable(
    { columns, data, initialState:{sortBy:defaultSort} },
    useSortBy
  );

  return (
    <div className="p-4 bg-surface-light dark:bg-surface-dark rounded shadow">
      {/* now scrolling happens here */}
      <div className="overflow-auto max-h-[60vh] overflow-x-auto">
        <table {...getTableProps()} className="min-w-full border-collapse">
          <thead>
            {headerGroups.map((hg,i) => (
              <tr {...hg.getHeaderGroupProps()} key={i}>
                {hg.headers.map((col,j) => (
                  <th
                    {...col.getHeaderProps(col.getSortByToggleProps())}
                    key={j}
                    className="sticky top-0 z-10 bg-bg-light dark:bg-bg-dark px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase border-b border-gray-300 dark:border-gray-600"
                  >
                    <div className="flex items-center">
                      <span className="flex flex-col space-y-0.5 mr-1">
                        {col.isSorted
                          ? (col.isSortedDesc
                              ? <svg className="w-4 h-4 text-gray-900 dark:text-gray-100" viewBox="0 0 20 20" fill="currentColor"><path d="M5 7l5 5 5-5H5z"/></svg>
                              : <svg className="w-4 h-4 text-gray-900 dark:text-gray-100" viewBox="0 0 20 20" fill="currentColor"><path d="M5 13l5-5 5 5H5z"/></svg>
                            )
                          : 
                          <div className="flex flex-col opacity-50">
                            <svg className="w-3 h-3 text-gray-400 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M5 13l5-5 5 5H5z" />
                            </svg>
                            <svg className="w-3 h-3 text-gray-400 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M5 7l5 5 5-5H5z" />
                            </svg>
                          </div>}
                      </span>
                      <span>{col.render('Header')}</span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="divide-y divide-gray-300 dark:divide-gray-600">
            {rows.map((row,idx)=>{
              prepareRow(row);
              const name = row.original.Name;
              const pick = row.original['Pick Number'];
              const highlight = highlightNames.includes(name) || pick==='—';
              return (
                <tr
                  {...row.getRowProps()}
                  data-name={name}
                  className={highlight ? 'bg-accent bg-opacity-20 dark:bg-accent-dark dark:bg-opacity-20' : ''}
                  key={idx}
                >
                  {row.cells.map((cell,k)=>(
                    <td
                      {...cell.getCellProps()}
                      key={k}
                      className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100"
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
