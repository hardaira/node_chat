import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
  // Navigate,
} from 'react-router-dom';

// import { Provider } from 'react-redux';
// import { store } from './app/store';
import { App } from './App';
import { RoomPage } from './pages/RoomPage';

import { NotFoundPage } from './pages/NotFoundPage';

// import ScrollToTop from './components/ScrollToTop';

createRoot(document.getElementById('root') as HTMLDivElement).render(
  // <Provider store={store}>
    <BrowserRouter>
      {/* <ScrollToTop /> */}
      <Routes>
        <Route path="/" element={<App />}>
            <Route path=":room" element={<RoomPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </BrowserRouter>
  // </Provider>,
);
