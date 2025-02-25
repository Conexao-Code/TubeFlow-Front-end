import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Menu, Info, Bell } from 'lucide-react';
import HeaderAdmin from '../components/HeaderAdmin';
import Sidebar from '../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';

function Settings() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [senderPhone, setSenderPhone] = useState('');
    const [messageTemplate, setMessageTemplate] = useState('');
    const [autoNotify, setAutoNotify] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`apitubeflow.conexaocode.com/api/settings`);
                if (!response.ok) {
                    throw new Error('Erro ao carregar configurações.');
                }
                const data = await response.json();

                setApiKey(data.api_key || '');
                setSenderPhone(data.sender_phone || '');
                // Converter \n armazenado no banco para quebra de linha real
                setMessageTemplate(data.message_template?.replace(/\\n/g, '\n') || 'Olá, {name}! Um novo vídeo foi atribuído a você: {titulo}');
                setAutoNotify(data.auto_notify || false);
            } catch (error) {
                toast.error('Erro ao carregar configurações.', { position: 'top-right' });
            }
        };

        fetchSettings();
    }, []);

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('apitubeflow.conexaocode.com/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    apiKey,
                    senderPhone,
                    messageTemplate: messageTemplate.replace(/\n/g, '\\n'),
                    autoNotify,
                }),
            });

            if (!response.ok) {
                throw new Error('Erro ao salvar configurações.');
            }

            toast.success('Configurações salvas com sucesso!', { position: 'top-right' });
        } catch (error) {
            toast.error('Erro ao salvar configurações.', { position: 'top-right' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <ToastContainer />

            <Sidebar
                activeSection="settings"
                setActiveSection={() => { }}
                isSidebarOpen={isSidebarOpen}
                onCloseSidebar={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 min-h-screen flex flex-col">
                <HeaderAdmin activeSection="settings">
                    <button
                        onClick={() => setIsSidebarOpen((prevState) => !prevState)}
                        className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </HeaderAdmin>

                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Configurações</h2>
                        <p className="mt-1 text-sm text-gray-600">Gerencie as configurações do sistema</p>
                    </div>

                    <div className="max-w-2xl">
                        <form onSubmit={handleSaveSettings}>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                                        API Key do WhatsGW
                                    </label>
                                    <input
                                        type="text"
                                        id="apiKey"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Digite sua API Key"
                                    />
                                    <p className="mt-2 text-sm text-gray-600">
                                        Para obter sua API Key, acesse{' '}
                                        <a
                                            href="https://app.whatsgw.com.br/w_desenvolvedor.aspx"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            este link
                                        </a>.
                                    </p>
                                </div>

                                <div className="p-6 border-b border-gray-100">
                                    <label htmlFor="senderPhone" className="block text-sm font-medium text-gray-700">
                                        Número do Remetente (WhatsApp)
                                    </label>
                                    <input
                                        type="text"
                                        id="senderPhone"
                                        value={senderPhone}
                                        onChange={(e) => setSenderPhone(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Digite o número do remetente"
                                    />
                                </div>

                                {/* Message Template */}
                                <div className="p-6 border-b border-gray-100">
                                    <label htmlFor="messageTemplate" className="block text-sm font-medium text-gray-700">
                                        Modelo de Mensagem (WhatsApp)
                                    </label>
                                    <textarea
                                        id="messageTemplate"
                                        value={messageTemplate}
                                        onChange={(e) => setMessageTemplate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        rows={4}
                                        placeholder="Use {name} para o nome do freelancer e {titulo} para o título do vídeo"
                                    />

                                    <p className="mt-1 text-sm text-gray-600">
                                        Utilize <span className="text-blue-600">{'{name}'}</span> para o nome do freelancer e <span className="text-blue-600">{'{titulo}'}</span> para o título do vídeo.
                                    </p>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <Bell className="w-5 h-5 text-gray-600" />
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-700">
                                                        Notificações Automáticas
                                                    </h3>
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        Ative para enviar mensagens automáticas aos freelancers
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setAutoNotify(!autoNotify)}
                                            className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out ${autoNotify ? 'bg-blue-600' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${autoNotify ? 'translate-x-5' : 'translate-x-0'}`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Salvar Configurações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Settings;
