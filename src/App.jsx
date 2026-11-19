import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import AppRoutes from './routes.jsx';

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { fontSize: '14px', borderRadius: '12px' },
          success: { iconTheme: { primary: '#0ca30c', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  );
}
