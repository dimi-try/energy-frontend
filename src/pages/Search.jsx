import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL;

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    axios.get(`${BACKEND_URL}/search?q=${query}`).then((res) => setResults(res.data));
  };

  return (
    <div>
      <input type="text" placeholder="Название или бренд..." value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={handleSearch}>Поиск</button>
      <ul>{results.map((r) => <li key={r.id}>{r.name}</li>)}</ul>
    </div>
  );
};

export default Search;
