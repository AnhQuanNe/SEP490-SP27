import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AppRoutes from './routes/AppRoutes';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-rose-500 selection:text-white">
                    <Navbar />
                    <main className="flex-grow">
                        <AppRoutes />
                    </main>
                    <Footer />
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;