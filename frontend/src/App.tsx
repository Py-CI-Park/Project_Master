/**
 * Main App Component
 *
 * 애플리케이션의 진입점
 */

import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { router } from './routes';
import ErrorBoundary from './components/Common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
