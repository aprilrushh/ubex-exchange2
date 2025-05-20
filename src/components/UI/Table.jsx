import React from 'react';
import './Table.css';

const Table = ({ headers = [], children }) => {
  return (
    <table className="table">
      {headers.length > 0 && (
        <thead>
          <tr>
            {headers.map((h, idx) => (
              <th key={idx}>{h}</th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>{children}</tbody>
    </table>
  );
};

export default Table;
