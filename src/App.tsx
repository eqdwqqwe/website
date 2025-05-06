import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import HomePage from './pages/Home/Home';
import Emotion from './pages/Emotion/Emotion';
import Advice from './pages/Advice/Advice';
import History from './pages/History/History';
import AI from './pages/Ask/AI';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button {
    background: none;
    border: none;
    outline: none;
    font-family: inherit;
  }
`;

const AppContainer = styled.div`
  width: 100%;
  min-height: 100vh;
`;

function App() {
  return (
    <Router>
      <GlobalStyle />
      <AppContainer>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/emotion" element={<Emotion />} />
          <Route path="/advice" element={<Advice />} />
          <Route path="/history" element={<History />} />
          <Route path="/ai" element={<AI />} />
        </Routes>
      </AppContainer>
    </Router>
  );
}

export default App;