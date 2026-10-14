import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import AppRoutes from './routes/AppRoutes';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
                    <Navbar />
                    <main className="flex-grow">
                        <AppRoutes />
                    </main>
                    <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
                        <p>© {new Date().getFullYear()} SEP490-SP27 Authentication System. All rights reserved.</p>
                    </footer>
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;