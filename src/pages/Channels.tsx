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
    const [channels, setChannels] = useState<Channel[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [totalMonthlyVideos, setTotalMonthlyVideos] = useState(0);

    const totalChannels = channels.length;

    // Lidar com resize para exibir o Sidebar no desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Buscar dados dos canais
    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const response = await fetch('http://localhost:1100/api/channels');
                const data = await response.json();

                setChannels(data.channels);
                setTotalMonthlyVideos(data.totalMonthlyVideos);
            } catch (error) {
                console.error('Erro ao buscar canais:', error);
                toast.error('Erro ao buscar canais.', { position: 'top-right' });
            }
        };

        fetchChannels();
    }, []);

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

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isSidebarOpen={isSidebarOpen}
                onCloseSidebar={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col min-h-screen">
                <Header activeSection={activeSection}>
                    <button
                        onClick={() => setIsSidebarOpen((prevState) => !prevState)}
                        className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </Header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
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
                </main>
            </div>
        </div>
    );
}

export default Channels;
