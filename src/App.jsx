import React, { useState } from 'react';
import './App.css';

function App() {
  const [state, setState] = useState({
    url: '',
    alias: ''
  });
  const [created, setCreated] = useState('');
  const [error, setError] = useState('');
  const handleChange = event => {
    const newState = Object.assign({}, state);
    newState[event.target.name] = event.target.value;
    setState(newState);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setCreated('');
    setError('');
    createUrl(state.url, state.alias);
  };

  const createUrl = async (url, alias) => {
    const res = await fetch('/url', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        'url': url,
        'alias': alias || undefined
      })
    })
    if (res.ok) {
      const result = await res.json();
      setCreated(result.created.alias);
    } else {
      const result = await res.json();
      setError(result.stack);
    }

  }

  return (
    <div className="App">
      <div className="App-header">
        <h1>Urls Shortner</h1>
        <form action="" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="url">Url: </label>
            <input type="text"
              name='url'
              onChange={handleChange}
              value={state.url}
              required />
          </div>
          <div>
            <label htmlFor="alias">Alias(optional): </label>
            <input type="text"
              name='alias'
              onChange={handleChange}
              value={state.alias}
            />
          </div>
          <div>
            <button type='submit'>Submit</button>
          </div>
        </form>
        <div>
          <p className="" style={{ display: created ? 'block' : 'none' }}>Your short url is: <a href="http://">{created}</a></p>
          <p className="" style={{ display: error ? 'block' : 'none' }}>Error: {error}</p>
        </div>
      </div>

    </div>
  );
}

export default App;
