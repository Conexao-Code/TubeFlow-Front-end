import { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Triangle, Check, AlertTriangle } from 'lucide-react';

export default function VerificationCode() {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const inputRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
    const navigate = useNavigate();
    const email = localStorage.getItem('recoveryEmail') || '';

    const handleChange = (index: number, value: string) => {
        if (value.length <= 1 && /^[0-9]*$/.test(value)) {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);

            if (value && index < 5) {
                inputRefs[index + 1].current?.focus();
            }
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pasteData)) {
            const newCode = pasteData.split('');
            setCode(newCode);

            const lastIndex = Math.min(newCode.length - 1, 5);
            inputRefs[lastIndex]?.current?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const verificationCode = code.join('');
        if (verificationCode.length === 6) {
            try {
                const response = await fetch('https://api.conexaocode.com/api/verify-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, code: verificationCode }),
                });
    
                const data = await response.json();
    
                if (response.ok) {
                    setNotification({ type: 'success', message: 'Código verificado com sucesso!' });
                    localStorage.setItem('recoveryCode', verificationCode); 
                    setTimeout(() => navigate('/reset-password'), 1500);
                } else {
                    setNotification({ type: 'error', message: data.message || 'Erro ao verificar código.' });
                }
            } catch (error) {
                console.error('Erro ao verificar código:', error);
                setNotification({ type: 'error', message: 'Erro na conexão com o servidor.' });
            }
        } else {
            setNotification({ type: 'error', message: 'Por favor, insira um código válido.' });
        }
    };
    

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col items-center justify-center p-4">
            {/* Logo Section */}
            <div className="mb-8 flex items-center gap-2">
                <Play className="w-8 h-8 text-blue-600 fill-blue-600" />
                <Triangle className="w-8 h-8 text-blue-600 fill-blue-600" />
                <h1 className="text-3xl font-bold text-gray-800">TubeFlow</h1>
            </div>

            {/* Notification */}
            {notification && (
                <div
                    className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
                        notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}
                >
                    {notification.type === 'success' ? (
                        <Check className="w-5 h-5 flex-shrink-0" />
                    ) : (
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span>{notification.message}</span>
                </div>
            )}

            {/* Verification Code Box */}
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 font-poppins">Recuperação</h1>
                    <p className="text-gray-600 font-poppins">
                        Digite o código de verificação enviado para seu e-mail
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between gap-2 mb-8">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={inputRefs[index]}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={index === 0 ? handlePaste : undefined} 
                                className="w-12 h-12 border-2 rounded-lg text-center text-xl font-semibold text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-poppins"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors font-poppins"
                    >
                        Verificar
                    </button>
                </form>
            </div>
        </div>
    );
}
