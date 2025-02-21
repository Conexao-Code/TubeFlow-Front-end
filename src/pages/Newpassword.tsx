import React, { useState } from 'react';
import { Play, Triangle, ArrowLeft, Eye, EyeOff, Lock, Check, AlertTriangle } from 'lucide-react';

type Notification = {
    type: 'success' | 'error';
    message: string;
};

function NewPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [notification, setNotification] = useState<Notification | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const email = localStorage.getItem('recoveryEmail') || '';
    const code = localStorage.getItem('recoveryCode') || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            setNotification({ type: 'error', message: 'Por favor, preencha todos os campos' });
            return;
        }

        if (password.length < 8) {
            setNotification({ type: 'error', message: 'A senha deve ter pelo menos 8 caracteres' });
            return;
        }

        if (password !== confirmPassword) {
            setNotification({ type: 'error', message: 'As senhas não coincidem' });
            return;
        }

        const email = localStorage.getItem('recoveryEmail');
        const code = localStorage.getItem('recoveryCode');

        if (!email || !code) {
            setNotification({
                type: 'error',
                message: 'Dados de recuperação ausentes. Por favor, recomece o processo.',
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('https://api.conexaocode.com/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword: password }),
            });

            const data = await response.json();

            if (response.ok) {
                setNotification({ type: 'success', message: 'Senha alterada com sucesso!' });
                localStorage.removeItem('recoveryEmail');
                localStorage.removeItem('recoveryCode');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
            } else {
                setNotification({ type: 'error', message: data.message || 'Erro ao alterar a senha.' });
            }
        } catch (error) {
            console.error('Erro na solicitação:', error);
            setNotification({ type: 'error', message: 'Erro na conexão com o servidor.' });
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col items-center justify-center p-4">
            {/* Logo */}
            <div className="mb-8 flex items-center gap-2">
                <Play className="w-8 h-8 text-blue-600 fill-blue-600" />
                <Triangle className="w-8 h-8 text-blue-600 fill-blue-600" />
                <h1 className="text-3xl font-bold text-gray-800">TubeFlow</h1>
            </div>

            {/* Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Nova Senha</h1>
                    <p className="text-gray-600">Digite e confirme sua nova senha</p>
                </div>

                {notification && (
                    <div
                        className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${notification.type === 'success'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Nova Senha
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Digite sua nova senha"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmar Nova Senha
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Confirme sua nova senha"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors duration-200 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isLoading ? 'Alterando...' : 'Alterar Senha'}
                    </button>
                </form>

                {/* Back Link */}
                <div className="mt-8 text-center">
                    <a href="/codigo" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </a>
                </div>
            </div>
        </div>
    );
}

export default NewPassword;
