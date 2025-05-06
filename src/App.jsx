// src/App.jsx
import { BrowserRouter as Router } from 'react-router-dom';
import MainApp from './MainApp';
import './App.css';

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

export default App;
