import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AiChatProvider } from './context/AiChatContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AppRoutes from './routes/AppRoutes';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AiChatProvider>
                    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
                        <Navbar />
                        <main className="flex-grow">
                            <AppRoutes />
                        </main>
                        <Footer />
                    </div>
                </AiChatProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;