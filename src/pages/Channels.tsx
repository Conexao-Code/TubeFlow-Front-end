import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, AlertTriangle, Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ChannelCard from '../components/ChannelCard';
import ChannelForm from '../components/ChannelForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Channel {
    id: string;
    name: string;
    description: string;
    totalVideos: number;
    monthlyVideos: number;
    youtubeUrl: string;
}

function Channels() {
    const [activeSection, setActiveSection] = useState('Canais');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [channels, setChannels] = useState<Channel[]>([
        {
            id: '1',
            name: 'Canal Exemplo',
            description: 'Um canal de exemplo para demonstração',
            totalVideos: 150,
            monthlyVideos: 8,
            youtubeUrl: 'https://youtube.com/channel/example',
        },
    ]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

    const totalChannels = channels.length;
    const [totalMonthlyVideos, setTotalMonthlyVideos] = useState(0);


    const handleCreateChannel = async (data: any) => {
        try {
            const response = await fetch('http://localhost:1100/api/channels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const newChannel = await response.json();
                setChannels([...channels, { ...data, id: newChannel.id, totalVideos: 0, monthlyVideos: 0 }]);
                setIsCreateModalOpen(false);
                toast.success('Canal criado com sucesso!', { position: 'top-right' });
            } else {
                const error = await response.json();
                toast.error(error.message, { position: 'top-right' });
            }
        } catch (error) {
            console.error('Erro ao criar canal:', error);
            toast.error('Erro ao criar canal.', { position: 'top-right' });
        }
    };

    const handleEditChannel = async (data: any) => {
        if (!selectedChannel) return;

        try {
            const response = await fetch(`http://localhost:1100/api/channels/${selectedChannel.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const updatedChannels = channels.map((channel) =>
                    channel.id === selectedChannel.id ? { ...channel, ...data } : channel
                );
                setChannels(updatedChannels);
                setIsEditModalOpen(false);
                setSelectedChannel(null);
                toast.success('Canal atualizado com sucesso!', { position: 'top-right' });
            } else {
                const error = await response.json();
                toast.error(error.message, { position: 'top-right' });
            }
        } catch (error) {
            console.error('Erro ao editar canal:', error);
            toast.error('Erro ao editar canal.', { position: 'top-right' });
        }
    };

    const handleDeleteChannel = async () => {
        if (!selectedChannel) return;

        try {
            const response = await fetch(`http://localhost:1100/api/channels/${selectedChannel.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setChannels(channels.filter((channel) => channel.id !== selectedChannel.id));
                setIsDeleteModalOpen(false);
                setSelectedChannel(null);
                toast.success('Canal excluído com sucesso!', { position: 'top-right' });
            } else {
                const error = await response.json();
                toast.error(error.message, { position: 'top-right' });
            }
        } catch (error) {
            console.error('Erro ao excluir canal:', error);
            toast.error('Erro ao excluir canal.', { position: 'top-right' });
        }
    };


    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const response = await fetch('http://localhost:1100/api/channels');
                const data = await response.json();
    
                setChannels(data.channels);
                setTotalMonthlyVideos(data.totalMonthlyVideos); // Atualize o estado corretamente
            } catch (error) {
                console.error('Erro ao buscar canais:', error);
                toast.error('Erro ao buscar canais.', { position: 'top-right' });
            }
        };
    
        fetchChannels();
    }, []);
    


    return (
        <div className="min-h-screen bg-gray-50 flex">
            <ToastContainer />
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed bottom-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg"
            >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {isSidebarOpen && (
                <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            )}

            <main className="flex-1 min-h-screen flex flex-col">
                <Header activeSection={activeSection} />

                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-semibold text-gray-900">Gerenciamento de Canais</h1>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Novo Canal
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <p className="text-gray-600 text-sm">Total de Canais</p>
                                <p className="text-3xl font-semibold text-gray-900 mt-2">{totalChannels}</p>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <p className="text-gray-600 text-sm">Vídeos Publicados este Mês</p>
                                <p className="text-3xl font-semibold text-gray-900 mt-2">{totalMonthlyVideos}</p>

                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {channels.map((channel) => (
                            <ChannelCard
                                key={channel.id}
                                {...channel}
                                onEdit={(id) => {
                                    setSelectedChannel(channels.find((c) => c.id === id) || null);
                                    setIsEditModalOpen(true);
                                }}
                                onDelete={(id) => {
                                    setSelectedChannel(channels.find((c) => c.id === id) || null);
                                    setIsDeleteModalOpen(true);
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Create Modal */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-800">Cadastrar Novo Canal</h2>
                                    <button
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                <ChannelForm onSubmit={handleCreateChannel} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {isEditModalOpen && selectedChannel && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-800">Editar Canal</h2>
                                    <button
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                <ChannelForm
                                    onSubmit={handleEditChannel}
                                    initialData={{
                                        name: selectedChannel.name,
                                        description: selectedChannel.description,
                                        youtubeUrl: selectedChannel.youtubeUrl,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {isDeleteModalOpen && selectedChannel && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-800">Excluir Canal</h2>
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <p className="text-gray-600">
                                        Tem certeza que deseja excluir o canal <span className="font-semibold">{selectedChannel.name}</span>? Essa ação não pode ser desfeita.
                                    </p>
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDeleteChannel}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Channels;