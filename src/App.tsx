import React from 'react';
import './App.css';
import { ReactPeriodSelector } from "./components/react-period-selector";

function App() {
  return (
    <div className="App">
      <ReactPeriodSelector onUpdateDateRange={() => 'asdf'} />
    </div>
  );
}

export default App;
