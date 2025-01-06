import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RestrictedWrapper from './restrictedWrapper';
import './index.scss';
import App from './App';
import Login from './modules/login/Login';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const fallbackPath = '/login';

root.render(
  <BrowserRouter>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<Navigate to="/login" />} />
    <Route
      path="/*"
      element={
        <RestrictedWrapper fallbackPath={fallbackPath}>
          <App />
        </RestrictedWrapper>
      }
    />
  </Routes>
</BrowserRouter>
);

reportWebVitals();