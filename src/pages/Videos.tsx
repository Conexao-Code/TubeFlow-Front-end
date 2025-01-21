import React, { useEffect, useState } from 'react';
import { Plus, X, Edit2, Trash2, AlertTriangle, Youtube, ExternalLink, Search, Filter, Menu, Video, MessageSquare } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Video {
    id: string;
    title: string;
    channelId: string;
    channelName: string;
    freelancerId: string;
    freelancerName: string;
    status: VideoStatus;
    observations?: string;
    youtubeUrl?: string;
    createdAt: string;
}

interface Comment {
    text: string;
    userName: string;
    userRole: string;
}


interface Channel {
    id: string;
    name: string;
}

interface Freelancer {
    id: string;
    name: string;
    role: string;
}

type VideoStatus =
    | 'Pendente'
    | 'Roteiro_Solicitado'
    | 'Roteiro_Em_Andamento'
    | 'Roteiro_Concluído'
    | 'Narração_Solicitada'
    | 'Narração_Em_Andamento'
    | 'Narração_Concluída'
    | 'Edição_Solicitada'
    | 'Edição_Em_Andamento'
    | 'Edição_Concluída'
    | 'Thumbnail_Solicitada'
    | 'Thumbnail_Em_Andamento'
    | 'Thumbnail_Concluída'
    | 'Publicado'
    | 'Cancelado';

function Videos() {
    const [activeSection, setActiveSection] = useState('Gerenciamento de Vídeos');
    const [activeTab, setActiveTab] = useState<'production' | 'published' | 'cancelled'>('production');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChannel, setSelectedChannel] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedFreelancer, setSelectedFreelancer] = useState<string>('');
    const [newVideoTitle, setNewVideoTitle] = useState('');
    const [newVideoChannel, setNewVideoChannel] = useState('');
    const [newVideoFreelancer, setNewVideoFreelancer] = useState('');
    const [newVideoObservations, setNewVideoObservations] = useState('');
    const [newVideoNarrator, setNewVideoNarrator] = useState<string>('');
    const [newVideoEditor, setNewVideoEditor] = useState<string>('');
    const [newVideoThumbMaker, setNewVideoThumbMaker] = useState<string>('');
    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [selectedVideoForComments, setSelectedVideoForComments] = useState<Video | null>(null);

    const fetchComments = async (videoId: string) => {
        try {
            const response = await fetch(`http://localhost:1100/api/videos/${videoId}/comments`);
            const data = await response.json();

            if (data.comments) {
                setComments(
                    data.comments.map((comment: any) => ({
                        text: comment.text || '',
                        userName: comment.userName || 'Anônimo',
                        userRole: comment.userRole || 'Desconhecido',
                    }))
                );
            } else {
                setComments([]);
            }
        } catch (error) {
            console.error('Erro ao buscar comentários:', error);
            toast.error('Erro ao buscar comentários.', { position: 'top-right' });
        }
    };

    const handleAddComment = async () => {
        if (!newComment || !selectedVideoForComments) return;

        const isFreelancer = localStorage.getItem('isFreelancer') === 'true';
        const userId = isFreelancer
            ? localStorage.getItem('userId')
            : localStorage.getItem('userIdA');
        const userType = isFreelancer ? 'freelancer' : 'user';

        try {
            const response = await fetch(`http://localhost:1100/api/videos/${selectedVideoForComments.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newComment, userId, userType }),
            });

            if (response.ok) {
                fetchComments(selectedVideoForComments.id);
                setNewComment('');
                toast.success('Comentário adicionado com sucesso!', { position: 'top-right' });
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Erro ao adicionar comentário.', { position: 'top-right' });
            }
        } catch (error) {
            console.error('Erro ao adicionar comentário:', error);
            toast.error('Erro ao adicionar comentário.', { position: 'top-right' });
        }
    };


    const openCommentsModal = (video: Video) => {
        setSelectedVideoForComments(video);
        fetchComments(video.id);
        setIsCommentsModalOpen(true);
    };

    const closeCommentsModal = () => {
        setIsCommentsModalOpen(false);
        setSelectedVideoForComments(null);
        setComments([]);
    };

    const role = localStorage.getItem('role');
    const isFreelancer = localStorage.getItem('isFreelancer') === 'true';
    const userId = localStorage.getItem('userId');

    const statusColors: Record<VideoStatus, { bg: string; text: string }> = {
        Pendente: { bg: 'bg-gray-200', text: 'text-gray-700' },
        Roteiro_Solicitado: { bg: 'bg-blue-200', text: 'text-blue-700' },
        Roteiro_Em_Andamento: { bg: 'bg-orange-200', text: 'text-orange-700' },
        Roteiro_Concluído: { bg: 'bg-green-200', text: 'text-green-700' },
        Narração_Solicitada: { bg: 'bg-teal-200', text: 'text-teal-700' },
        Narração_Em_Andamento: { bg: 'bg-orange-300', text: 'text-orange-800' },
        Narração_Concluída: { bg: 'bg-green-300', text: 'text-green-800' },
        Edição_Solicitada: { bg: 'bg-indigo-200', text: 'text-indigo-700' },
        Edição_Em_Andamento: { bg: 'bg-yellow-200', text: 'text-yellow-700' },
        Edição_Concluída: { bg: 'bg-green-400', text: 'text-green-900' },
        Thumbnail_Solicitada: { bg: 'bg-purple-200', text: 'text-purple-700' },
        Thumbnail_Em_Andamento: { bg: 'bg-yellow-300', text: 'text-yellow-800' },
        Thumbnail_Concluída: { bg: 'bg-green-500', text: 'text-green-900' },
        Publicado: { bg: 'bg-green-600', text: 'text-white' },
        Cancelado: { bg: 'bg-red-300', text: 'text-red-800' },
    };

    const statusesByRole = {
        roteirista: [
            'Pendente',
            'Roteiro_Solicitado',
            'Roteiro_Em_Andamento',
            'Roteiro_Concluído'
        ],
        narrador: [
            'Narração_Solicitada',
            'Narração_Em_Andamento',
            'Narração_Concluída'
        ],
        editor: [
            'Edição_Solicitada',
            'Edição_Em_Andamento',
            'Edição_Concluída'
        ],
        thumbnail: [
            'Thumbnail_Solicitada',
            'Thumbnail_Em_Andamento',
            'Thumbnail_Concluída'
        ],
        admin: [
            'Pendente',
            'Roteiro_Solicitado',
            'Roteiro_Em_Andamento',
            'Roteiro_Concluído',
            'Narração_Solicitada',
            'Narração_Em_Andamento',
            'Narração_Concluída',
            'Edição_Solicitada',
            'Edição_Em_Andamento',
            'Edição_Concluída',
            'Thumbnail_Solicitada',
            'Thumbnail_Em_Andamento',
            'Thumbnail_Concluída',
            'Publicado',
            'Cancelado'
        ]
    };

    const getAvailableStatuses = () => {
        if (role === 'admin') return statusesByRole.admin;
        return statusesByRole[role as keyof typeof statusesByRole] || [];
    };

    const canDeleteVideo = () => {
        return role === 'admin';
    };

    const canCreateVideo = () => {
        return role === 'admin';
    };

    const canEditVideo = (video: Video) => {
        if (role === 'admin') return true;
        const availableStatuses = getAvailableStatuses();
        return availableStatuses.includes(video.status);
    };

    useEffect(() => {
        fetchChannels();
        fetchFreelancers();
    }, []);

    useEffect(() => {
        fetchVideos();
    }, [selectedChannel, selectedFreelancer, selectedStatus, searchTerm]);

    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const fetchVideos = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedChannel) params.append('channelId', selectedChannel);
            if (selectedFreelancer) params.append('freelancerId', selectedFreelancer);
            if (selectedStatus) params.append('status', selectedStatus);
            if (searchTerm) params.append('searchTerm', searchTerm);

            const response = await fetch(`http://localhost:1100/api/videos?${params.toString()}`);
            const data = await response.json();


            const mappedVideos = data.map((video: any) => ({
                id: video.id,
                title: video.title,
                channelId: video.channel_id,
                channelName: video.channel_name || '',
                freelancerId: video.freelancer_id,
                freelancerName: video.freelancer_name || '',
                status: video.status,
                observations: video.observations,
                youtubeUrl: video.youtube_url,
                createdAt: video.created_at,
            }));

            setVideos(mappedVideos);
        } catch (error) {
            console.error('Erro ao buscar vídeos:', error);
            toast.error('Erro ao buscar vídeos.', { position: 'top-right' });
        }
    };

    const filteredVideos = videos.filter((video) => {
        const availableStatuses = selectedRole
            ? statusesByRole[selectedRole as keyof typeof statusesByRole] || []
            : getAvailableStatuses();

        // Sempre manter vídeos publicados e cancelados visíveis
        const isAlwaysVisible = video.status === 'Publicado' || video.status === 'Cancelado';

        // Verificar se o vídeo é visível com base na role selecionada ou na role do usuário
        const isVisibleBasedOnRole = availableStatuses.includes(video.status);

        const isVisible = isAlwaysVisible || isVisibleBasedOnRole;

        if (!isVisible) return false;

        // Filtrar com base na aba ativa
        if (activeTab === 'production') {
            return video.status !== 'Publicado' && video.status !== 'Cancelado';
        }

        if (activeTab === 'published') {
            return video.status === 'Publicado';
        }

        if (activeTab === 'cancelled') {
            return video.status === 'Cancelado';
        }

        return true;
    });




    const fetchChannels = async () => {
        try {
            const response = await fetch('http://localhost:1100/api/channels');
            const json = await response.json();

            if (Array.isArray(json.channels)) {
                setChannels(json.channels);
            } else {
                throw new Error('API response channels is not an array');
            }
        } catch (error) {
            console.error('Erro ao buscar canais:', error);
            toast.error('Erro ao buscar canais.', { position: 'top-right' });
        }
    };

    const fetchFreelancers = async () => {
        try {
            const response = await fetch('http://localhost:1100/api/freelancers');
            const json = await response.json();

            if (Array.isArray(json.data)) {
                setFreelancers(json.data);
            } else {
                throw new Error('API response data is not an array');
            }
        } catch (error) {
            console.error('Erro ao buscar freelancers:', error);
            toast.error('Erro ao buscar freelancers.', { position: 'top-right' });
        }
    };

    useEffect(() => {
        if (isEditModalOpen && selectedVideo) {
            setNewVideoTitle(selectedVideo.title);
            setNewVideoChannel(selectedVideo.channelId);
            setNewVideoFreelancer(selectedVideo.freelancerId);
            setNewVideoObservations(selectedVideo.observations || '');
        }
    }, [isEditModalOpen, selectedVideo]);

    const clearCreateVideoFields = () => {
        setNewVideoTitle('');
        setNewVideoChannel('');
        setNewVideoFreelancer('');
        setNewVideoNarrator('');
        setNewVideoEditor('');
        setNewVideoThumbMaker('');
        setNewVideoObservations('');
    };


    const handleCreateVideo = async () => {
        if (!newVideoTitle || !newVideoChannel) {
            toast.error('Todos os campos obrigatórios devem ser preenchidos.', { position: 'top-right' });
            return;
        }

        const data = {
            title: newVideoTitle,
            channelId: newVideoChannel,
            freelancerId: newVideoFreelancer,
            narratorId: newVideoNarrator,
            editorId: newVideoEditor,
            thumbMakerId: newVideoThumbMaker,
            status: 'Pendente',
            observations: newVideoObservations,
            youtubeUrl: null,
        };

        try {
            const response = await fetch('http://localhost:1100/api/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                fetchVideos();
                setIsCreateModalOpen(false);
                clearCreateVideoFields();
                toast.success('Vídeo criado com sucesso!', { position: 'top-right' });
            } else {
                const error = await response.json();
                toast.error(error.message, { position: 'top-right' });
            }
        } catch (error) {
            console.error('Erro ao criar vídeo:', error);
            toast.error('Erro ao criar vídeo.', { position: 'top-right' });
        }
    };


    const handleEditVideo = async () => {
        if (!selectedVideo) return;

        const updatedData = {
            title: newVideoTitle,
            channelId: newVideoChannel,
            freelancerId: newVideoFreelancer,
            observations: newVideoObservations,
        };

        try {
            const response = await fetch(`http://localhost:1100/api/videos/${selectedVideo.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            if (response.ok) {
                fetchVideos();
                setIsEditModalOpen(false);
                toast.success('Vídeo atualizado com sucesso!', { position: 'top-right' });
            } else {
                const error = await response.json();
                toast.error(error.message, { position: 'top-right' });
            }
        } catch (error) {
            console.error('Erro ao editar vídeo:', error);
            toast.error('Erro ao editar vídeo.', { position: 'top-right' });
        }
    };

    const handleDeleteVideo = async () => {
        if (!selectedVideo) return;
        try {
            const response = await fetch(`http://localhost:1100/api/videos/${selectedVideo.id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchVideos();
                setIsDeleteModalOpen(false);
                setSelectedVideo(null);
                toast.success('Vídeo excluído com sucesso!', { position: 'top-right' });
            } else {
                const error = await response.json();
                toast.error(error.message, { position: 'top-right' });
            }
        } catch (error) {
            console.error('Erro ao excluir vídeo:', error);
            toast.error('Erro ao excluir vídeo.', { position: 'top-right' });
        }
    };

    const handleStatusChange = async (videoId: string, newStatus: string, freelancerId: string) => {
        const availableStatuses = getAvailableStatuses();

        if (!availableStatuses.includes(newStatus) && role !== 'admin') {
            toast.error('Você não tem permissão para definir este status.', { position: 'top-right' });
            return;
        }

        try {
            const response = await fetch(`http://localhost:1100/api/videos/${videoId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, userId: freelancerId }),
            });

            if (response.ok) {
                fetchVideos();
                toast.success('Status atualizado com sucesso!', { position: 'top-right' });
            } else {
                const error = await response.json();
                toast.error(error.message, { position: 'top-right' });
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            toast.error('Erro ao atualizar status.', { position: 'top-right' });
        }
    };

    const clearFilters = () => {
        setSelectedChannel('');
        setSelectedStatus('');
        setSelectedFreelancer('');
        setSearchTerm('');
    };

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
                        {role === 'admin' && (
                            <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end mb-6 gap-4">
                                {canCreateVideo() && (
                                    <button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors w-full sm:w-auto justify-center shadow-sm"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Novo Vídeo
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="flex border-b border-gray-200 mb-6">
                            <button
                                onClick={() => setActiveTab('production')}
                                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'production'
                                    ? 'text-blue-600 border-blue-600'
                                    : 'text-gray-500 border-transparent hover:text-blue-600 hover:border-blue-300'
                                    }`}
                            >
                                Em Produção
                            </button>
                            <button
                                onClick={() => setActiveTab('published')}
                                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'published'
                                    ? 'text-blue-600 border-blue-600'
                                    : 'text-gray-500 border-transparent hover:text-blue-600 hover:border-blue-300'
                                    }`}
                            >
                                Publicados
                            </button>
                            <button
                                onClick={() => setActiveTab('cancelled')}
                                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'cancelled'
                                    ? 'text-blue-600 border-blue-600'
                                    : 'text-gray-500 border-transparent hover:text-blue-600 hover:border-blue-300'
                                    }`}
                            >
                                Cancelados
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Buscar vídeos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-full h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <select
                                    value={selectedChannel}
                                    onChange={(e) => setSelectedChannel(e.target.value)}
                                    className="w-full h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Todos os Canais</option>
                                    {channels.map((channel) => (
                                        <option key={channel.id} value={channel.id}>
                                            {channel.name}
                                        </option>
                                    ))}
                                </select>

                                {role === 'admin' && (
                                    <select
                                        value={selectedRole || ""}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        className="w-full h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Selecione uma Role</option>
                                        <option value="editor">Editor</option>
                                        <option value="roteirista">Roteirista</option>
                                        <option value="narrador">Narrador</option>
                                        <option value="thumbnail">Thumbnail</option>
                                    </select>
                                )}

                                <button
                                    onClick={clearFilters}
                                    className="flex items-center justify-center h-10 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <Filter className="w-5 h-5 mr-2" />
                                    Limpar Filtros
                                </button>
                            </div>
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden lg:block">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-blue-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-blue-900">Título</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-blue-900">Canal</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-blue-900">Status</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-blue-900">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredVideos.map((video) => (
                                            <tr key={video.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-900">{video.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <Youtube className="w-4 h-4 text-red-600 mr-2" />
                                                        <span className="text-gray-600">{video.channelName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={video.status}
                                                        onChange={(e) => handleStatusChange(video.id, e.target.value, video.freelancerId)}
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${statusColors[video.status]?.bg || 'bg-gray-100'} ${statusColors[video.status]?.text || 'text-gray-600'}`}
                                                        disabled={role !== 'admin' && !getAvailableStatuses().includes(video.status)}
                                                    >
                                                        {getAvailableStatuses().map((status) => (
                                                            <option key={status} value={status}>
                                                                {status.replace(/_/g, ' ')}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {canEditVideo(video) && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedVideo(video);
                                                                    setIsEditModalOpen(true);
                                                                }}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                                title="Editar"
                                                            >
                                                                <Edit2 className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                        {canDeleteVideo() && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedVideo(video);
                                                                    setIsDeleteModalOpen(true);
                                                                }}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                                title="Excluir"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                        {video.youtubeUrl && (
                                                            <a
                                                                href={video.youtubeUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                                title="Ver no YouTube"
                                                            >
                                                                <ExternalLink className="w-5 h-5" />
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={() => openCommentsModal(video)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                            title="Visualizar Comentários"
                                                        >
                                                            <MessageSquare className="w-5 h-5" />
                                                        </button>

                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {isCommentsModalOpen && selectedVideoForComments && (
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
                                    <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-t-2xl border-b border-blue-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-blue-600 rounded-lg">
                                                    <MessageSquare className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-semibold text-gray-800">
                                                        Comentários
                                                    </h2>
                                                    <p className="text-sm text-gray-600 mt-0.5">
                                                        {selectedVideoForComments.title}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={closeCommentsModal}
                                                className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                                            >
                                                <X className="w-5 h-5 text-gray-500" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col h-[600px]">
                                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                                            {comments.length > 0 ? (
                                                <div className="space-y-4">
                                                    {comments.map((comment, index) => (
                                                        <div
                                                            key={index}
                                                            className="bg-gray-50 hover:bg-gray-100/80 p-4 rounded-xl transition-colors border border-gray-100"
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-medium">
                                                                        {comment.userName?.charAt(0)?.toUpperCase() || 'A'}
                                                                    </div>


                                                                    <div>
                                                                        <h3 className="font-semibold text-gray-900">
                                                                            {comment.userName}
                                                                        </h3>
                                                                        <span className="text-sm text-gray-500">
                                                                            {comment.userRole}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <p className="text-gray-700 pl-13">
                                                                {comment.text}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <MessageSquare className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500 font-medium">Nenhum comentário encontrado</p>
                                                    <p className="text-sm text-gray-400 mt-1">Seja o primeiro a comentar!</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
                                            <div className="space-y-4">
                                                <textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="Escreva um comentário..."
                                                    className="w-full h-24 px-4 py-3 bg-white border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                                                />
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={handleAddComment}
                                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                                                    >
                                                        <MessageSquare className="w-5 h-5 mr-2" />
                                                        Adicionar Comentário
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mobile Card View */}
                        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredVideos.map((video) => (
                                <div
                                    key={video.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-4"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900">{video.title}</h3>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-gray-600">
                                            <Youtube className="w-4 h-4 text-red-600 mr-2" />
                                            {video.channelName}
                                        </div>
                                        <div className="text-gray-600">
                                            Freelancer: <span className="font-medium">{video.freelancerName}</span>
                                        </div>
                                        <select
                                            value={video.status}
                                            onChange={(e) => handleStatusChange(video.id, e.target.value, video.freelancerId)}
                                            className={`w-full inline-flex items-center px-3 py-1 rounded-full text-sm border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${statusColors[video.status]?.bg || 'bg-gray-100'} ${statusColors[video.status]?.text || 'text-gray-600'}`}
                                            disabled={role !== 'admin' && !getAvailableStatuses().includes(video.status)}
                                        >
                                            {getAvailableStatuses().map((status) => (
                                                <option key={status} value={status}>
                                                    {status.replace(/_/g, ' ')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            {canEditVideo(video) && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedVideo(video);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                            )}
                                            {canDeleteVideo() && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedVideo(video);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                        {video.youtubeUrl && (
                                            <a
                                                href={video.youtubeUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                                            >
                                                <ExternalLink className="w-4 h-4 mr-1" />
                                                Ver no YouTube
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {(isCreateModalOpen || isEditModalOpen) && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
                            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-t-2xl border-b border-blue-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-600 rounded-lg">
                                            <Video className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800">
                                                {isCreateModalOpen ? 'Novo Vídeo' : 'Editar Vídeo'}
                                            </h2>
                                            <p className="text-sm text-gray-600 mt-0.5">
                                                {isCreateModalOpen ? 'Adicione um novo vídeo ao sistema' : 'Atualize as informações do vídeo'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (isCreateModalOpen) clearCreateVideoFields();
                                            setIsCreateModalOpen(false);
                                            setIsEditModalOpen(false);
                                        }}
                                        className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (isCreateModalOpen) {
                                        handleCreateVideo();
                                    } else {
                                        handleEditVideo();
                                    }
                                }}
                                className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Título e Canal - Primeira linha */}
                                    <div className="md:col-span-2 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Título do Vídeo
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={newVideoTitle}
                                                    onChange={(e) => setNewVideoTitle(e.target.value)}
                                                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                                                    placeholder="Digite o título do vídeo"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Canal
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={newVideoChannel}
                                                    onChange={(e) => setNewVideoChannel(e.target.value)}
                                                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                                                >
                                                    <option value="">Selecione um canal</option>
                                                    {channels.map((channel) => (
                                                        <option key={channel.id} value={channel.id}>
                                                            {channel.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <Youtube className="w-5 h-5 text-gray-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Freelancers - Grid de 2 colunas */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                                                <span className="mr-2">Roteirista</span>
                                                <div className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Principal</div>
                                            </label>
                                            <select
                                                value={newVideoFreelancer}
                                                onChange={(e) => setNewVideoFreelancer(e.target.value)}
                                                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            >
                                                <option value="">Selecione um roteirista</option>
                                                {freelancers
                                                    .filter((freelancer) => freelancer.role === 'roteirista')
                                                    .map((freelancer) => (
                                                        <option key={freelancer.id} value={freelancer.id}>
                                                            {freelancer.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Narrador
                                            </label>
                                            <select
                                                value={newVideoNarrator}
                                                onChange={(e) => setNewVideoNarrator(e.target.value)}
                                                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            >
                                                <option value="">Selecione um narrador</option>
                                                {freelancers
                                                    .filter((freelancer) => freelancer.role === 'narrador')
                                                    .map((freelancer) => (
                                                        <option key={freelancer.id} value={freelancer.id}>
                                                            {freelancer.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Editor
                                            </label>
                                            <select
                                                value={newVideoEditor}
                                                onChange={(e) => setNewVideoEditor(e.target.value)}
                                                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            >
                                                <option value="">Selecione um editor</option>
                                                {freelancers
                                                    .filter((freelancer) => freelancer.role === 'editor')
                                                    .map((freelancer) => (
                                                        <option key={freelancer.id} value={freelancer.id}>
                                                            {freelancer.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Thumb Maker
                                            </label>
                                            <select
                                                value={newVideoThumbMaker}
                                                onChange={(e) => setNewVideoThumbMaker(e.target.value)}
                                                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            >
                                                <option value="">Selecione um thumb maker</option>
                                                {freelancers
                                                    .filter((freelancer) => freelancer.role === 'thumb maker')
                                                    .map((freelancer) => (
                                                        <option key={freelancer.id} value={freelancer.id}>
                                                            {freelancer.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Comentários - Linha completa */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Comentários e Observações
                                        </label>
                                        <textarea
                                            value={newVideoObservations}
                                            onChange={(e) => setNewVideoObservations(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                            rows={4}
                                            placeholder="Adicione comentários ou observações importantes sobre o vídeo..."
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isCreateModalOpen) clearCreateVideoFields();
                                            setIsCreateModalOpen(false);
                                            setIsEditModalOpen(false);
                                        }}
                                        className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                                    >
                                        {isCreateModalOpen ? (
                                            <span className="flex items-center">
                                                <Plus className="w-5 h-5 mr-2" />
                                                Criar Vídeo
                                            </span>
                                        ) : (
                                            <span className="flex items-center">
                                                <Edit2 className="w-5 h-5 mr-2" />
                                                Salvar Alterações
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {isDeleteModalOpen && selectedVideo && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-800">Excluir Vídeo</h2>
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
                                        Tem certeza que deseja excluir o vídeo <span className="font-semibold">{selectedVideo.title}</span>? Essa ação não pode ser desfeita.
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
                                        onClick={handleDeleteVideo}
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

export default Videos;