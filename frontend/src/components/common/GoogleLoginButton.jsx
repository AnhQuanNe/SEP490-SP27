import { useEffect, useRef, useState } from 'react';

const GoogleLoginButton = ({ onSuccess, onError, text = 'signin_with' }) => {
    const buttonRef = useRef(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    useEffect(() => {
        const checkGoogleScript = () => {
            if (window.google?.accounts?.id) {
                setScriptLoaded(true);
            } else {
                setTimeout(checkGoogleScript, 200);
            }
        };
        checkGoogleScript();
    }, []);

    useEffect(() => {
        if (!scriptLoaded || !googleClientId) return;

        try {
            window.google.accounts.id.initialize({
                client_id: googleClientId,
                callback: (response) => {
                    if (response?.credential) {
                        onSuccess(response.credential);
                    } else if (onError) {
                        onError(new Error('Không nhận được credential từ Google'));
                    }
                },
            });

            if (buttonRef.current) {
                window.google.accounts.id.renderButton(buttonRef.current, {
                    theme: 'outline',
                    size: 'large',
                    width: '100%',
                    text: text, // 'signin_with' | 'signup_with' | 'continue_with'
                    shape: 'rectangular',
                    logo_alignment: 'left',
                });
            }
        } catch (err) {
            console.error('Lỗi khởi tạo Google Sign-In:', err);
        }
    }, [scriptLoaded, googleClientId, onSuccess, onError, text]);

    if (!googleClientId) {
        return (
            <div className="w-full text-center py-2 px-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
                ⚠️ Chưa điền <code>VITE_GOOGLE_CLIENT_ID</code> trong file .env để kích hoạt Google Sign-In.
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center">
            <div ref={buttonRef} className="w-full flex justify-center min-h-[40px]"></div>
        </div>
    );
};

export default GoogleLoginButton;
