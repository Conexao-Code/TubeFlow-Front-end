import React, { useEffect, useState } from 'react';
import { Plus, X, Edit2, Trash2, AlertTriangle, Youtube, ExternalLink, Search, Filter, Menu, Video, MessageSquare, MessageCircle, Send, XCircle, BellRing, MessageSquareWarning } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import HeaderAdmin from '../components/HeaderAdmin';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Video {
    id: string;
    title: string;
    channelId: string;
    channelName: string;
    freelancerId: string;
    freelancerName: string;
    scriptWriterId?: string;
    narratorId?: string;
    editorId?: string; // Adicionad
    thumbMakerId?: string; // Adicionada
    scriptWriterName?: string; // Já existente
    narratorName?: string; // Já existente
    editorName?: string; // Já existente
    thumbMakerName?: string; // Já existente
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
    const [activeSection, setActiveSection] = useState('Vídeos');
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
            const companyId = localStorage.getItem('companyId');
            const response = await fetch(
                `https://apitubeflow.conexaocode.com/api/videos/${videoId}/comments?companyId=${companyId}`
            );
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
        const companyId = localStorage.getItem('companyId');
        const isFreelancer = localStorage.getItem('isFreelancer') === 'true';
        const userId = isFreelancer
            ? localStorage.getItem('userId')
            : localStorage.getItem('userIdA');
        const userType = isFreelancer ? 'freelancer' : 'user';

        try {
            const response = await fetch(
                `https://apitubeflow.conexaocode.com/api/videos/${selectedVideoForComments.id}/comments`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: newComment,
                        userId,
                        userType,
                        companyId
                    }),
                }
            );

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

    const role = localStorage.getItem('role')?.replace(/\s+/g, '_') || '';
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
        roteirista: ['Pendente', 'Roteiro_Solicitado', 'Roteiro_Em_Andamento', 'Roteiro_Concluído'],
        narrador: ['Narração_Solicitada', 'Narração_Em_Andamento', 'Narração_Concluída'],
        editor: ['Edição_Solicitada', 'Edição_Em_Andamento', 'Edição_Concluída'],
        thumb_maker: ['Thumbnail_Solicitada', 'Thumbnail_Em_Andamento', 'Thumbnail_Concluída'], // ✅ Confirme que está correto
        admin: [
            'Pendente', 'Roteiro_Solicitado', 'Roteiro_Em_Andamento', 'Roteiro_Concluído',
            'Narração_Solicitada', 'Narração_Em_Andamento', 'Narração_Concluída',
            'Edição_Solicitada', 'Edição_Em_Andamento', 'Edição_Concluída',
            'Thumbnail_Solicitada', 'Thumbnail_Em_Andamento', 'Thumbnail_Concluída',
            'Publicado', 'Cancelado'
        ]
    };



    const getAvailableStatuses = () => {
        if (role === 'admin') return statusesByRole.admin;
        if (activeTab === 'published' || activeTab === 'cancelled') {
            return ['Publicado', 'Cancelado'];
        }
        return statusesByRole[role as keyof typeof statusesByRole] || [];
    };


    const canDeleteVideo = () => {
        return role === 'admin';
    };

    const canCreateVideo = () => {
        return role === 'admin';
    };

    const canEditVideo = (video: Video) => {
        return role === 'admin';
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
            const companyId = localStorage.getItem('companyId');
            const params = new URLSearchParams({
                companyId: companyId || '',
                ...(selectedChannel && { channelId: selectedChannel }),
                ...(selectedFreelancer && { freelancerId: selectedFreelancer }),
                ...(selectedStatus && { status: selectedStatus }),
                ...(searchTerm && { searchTerm }),
            });

            const response = await fetch(
                `https://apitubeflow.conexaocode.com/api/videos?${params.toString()}`
            );
            const data = await response.json();

            const mappedVideos = data.map((video: any) => ({
                id: video.id,
                title: video.title,
                channelId: video.channel_id,
                channelName: video.channel_name || '',
                scriptWriterId: video.script_writer_id || '',
                narratorId: video.narrator_id || '',
                editorId: video.editor_id || '',
                thumbMakerId: video.thumb_maker_id || '',
                scriptWriterName: video.script_writer_name || '',
                narratorName: video.narrator_name || '',
                editorName: video.editor_name || '',
                thumbMakerName: video.thumb_maker_name || '',
                status: video.status,
                observations: video.observations || '',
                youtubeUrl: video.youtube_url || null,
                createdAt: video.created_at,
            }));

            setVideos(mappedVideos);
        } catch (error) {
            console.error('Erro ao buscar vídeos:', error);
            toast.error('Erro ao buscar vídeos.', { position: 'top-right' });
        }
    };


    const filteredVideos = videos.filter((video) => {

        if (activeTab === 'cancelled') {
            if (role === 'admin') {
                return video.status === 'Cancelado';
            }

            if (isFreelancer) {
                const userId = localStorage.getItem('userId');
                if (!userId) return false;

                const normalizedUserId = parseInt(userId, 10);

                return (
                    video.status === 'Cancelado' &&
                    (parseInt(video.scriptWriterId || '', 10) === normalizedUserId ||
                        parseInt(video.narratorId || '', 10) === normalizedUserId ||
                        parseInt(video.editorId || '', 10) === normalizedUserId ||
                        parseInt(video.thumbMakerId || '', 10) === normalizedUserId)
                );
            }

            return false;
        }

        if (activeTab === 'published') {
            if (role === 'admin') {
                return video.status === 'Publicado';
            }

            if (isFreelancer) {
                const userId = localStorage.getItem('userId');
                if (!userId) return false;

                const normalizedUserId = parseInt(userId, 10);

                return (
                    video.status === 'Publicado' &&
                    (parseInt(video.scriptWriterId || '', 10) === normalizedUserId ||
                        parseInt(video.narratorId || '', 10) === normalizedUserId ||
                        parseInt(video.editorId || '', 10) === normalizedUserId ||
                        parseInt(video.thumbMakerId || '', 10) === normalizedUserId)
                );
            }

            return false;
        }

        if (activeTab === 'production') {
            if (video.status === 'Publicado' || video.status === 'Cancelado') {
                return false;
            }

            if (role === 'admin') {
                return true;
            }

            if (isFreelancer) {
                const userId = localStorage.getItem('userId');

                if (!userId) {
                    return false;
                }

                const normalizedUserId = parseInt(userId, 10);

                switch (video.status) {
                    case 'Roteiro_Solicitado':
                    case 'Roteiro_Em_Andamento':
                    case 'Roteiro_Concluído':
                        return video.scriptWriterId !== undefined && parseInt(video.scriptWriterId, 10) === normalizedUserId;

                    case 'Narração_Solicitada':
                    case 'Narração_Em_Andamento':
                    case 'Narração_Concluída':
                        return video.narratorId !== undefined && parseInt(video.narratorId, 10) === normalizedUserId;

                    case 'Edição_Solicitada':
                    case 'Edição_Em_Andamento':
                    case 'Edição_Concluída':
                        return video.editorId !== undefined && parseInt(video.editorId, 10) === normalizedUserId;

                    case 'Thumbnail_Solicitada':
                    case 'Thumbnail_Em_Andamento':
                        return video.thumbMakerId !== undefined && parseInt(video.thumbMakerId, 10) === normalizedUserId;

                    default:
                        return false;
                }
            }

            return false;
        }

        return false;
    });


    const fetchChannels = async () => {
        try {
            const response = await fetch('apitubeflow.conexaocode.com/api/channels');
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
            const response = await fetch('apitubeflow.conexaocode.com/api/freelancers');
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
            setNewVideoFreelancer(selectedVideo.scriptWriterId || ''); // Certifique-se de usar o scriptWriterId
            setNewVideoNarrator(selectedVideo.narratorId || ''); // Certifique-se de usar o narratorId
            setNewVideoEditor(selectedVideo.editorId || ''); // Certifique-se de usar o editorId
            setNewVideoThumbMaker(selectedVideo.thumbMakerId || ''); // Certifique-se de usar o thumbMakerId
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
        if (!newVideoTitle) {
            toast.error('O título do vídeo é obrigatório.', { position: 'top-right' });
            return;
        }

        if (!newVideoChannel) {
            toast.error('O canal do vídeo é obrigatório.', { position: 'top-right' });
            return;
        }

        if (!newVideoFreelancer) {
            toast.error('O roteirista do vídeo é obrigatório.', { position: 'top-right' });
            return;
        }

        if (!newVideoNarrator) {
            toast.error('O narrador do vídeo é obrigatório.', { position: 'top-right' });
            return;
        }

        if (!newVideoEditor) {
            toast.error('O editor do vídeo é obrigatório.', { position: 'top-right' });
            return;
        }

        if (!newVideoThumbMaker) {
            toast.error('O thumb maker do vídeo é obrigatório.', { position: 'top-right' });
            return;
        }

        const data = {
            title: newVideoTitle,
            channelId: newVideoChannel,
            scriptWriterId: newVideoFreelancer,
            narratorId: newVideoNarrator,
            editorId: newVideoEditor,
            thumbMakerId: newVideoThumbMaker,
            status: 'Pendente',
            observations: newVideoObservations || null,
            youtubeUrl: null,
            userId: localStorage.getItem('userIdA')  // 🠔 Adicione esta linha
        };


        try {
            const response = await fetch('apitubeflow.conexaocode.com/api/videos', {
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

        if (!newVideoTitle || !newVideoChannel || !newVideoFreelancer || !newVideoNarrator || !newVideoEditor || !newVideoThumbMaker) {
            toast.error('Todos os campos obrigatórios devem ser preenchidos.', { position: 'top-right' });
            return;
        }

        // Identificar userId ou userIdA
        const isFreelancer = localStorage.getItem('isFreelancer') === 'true';
        const userId = isFreelancer
            ? localStorage.getItem('userId')
            : localStorage.getItem('userIdA');

        if (!userId) {
            toast.error('Usuário não identificado.', { position: 'top-right' });
            return;
        }

        const updatedData = {
            title: newVideoTitle,
            channelId: newVideoChannel,
            status: selectedVideo.status, // Mantém o status atual
            observations: newVideoObservations || null,
            youtubeUrl: selectedVideo.youtubeUrl || null, // Mantém a URL do YouTube se já existir
            scriptWriterId: newVideoFreelancer,
            narratorId: newVideoNarrator,
            editorId: newVideoEditor,
            thumbMakerId: newVideoThumbMaker,
            userId, // Envia o identificador do usuário
        };

        try {
            const response = await fetch(`apitubeflow.conexaocode.com/api/videos/${selectedVideo.id}`, {
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
            const response = await fetch(`apitubeflow.conexaocode.com/api/videos/${selectedVideo.id}`, {
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

    const [isSendMessageModalOpen, setIsSendMessageModalOpen] = useState(false);
    const [pendingStatusChange, setPendingStatusChange] = useState<{ videoId: string, newStatus: string } | null>(null);

    const handleStatusChange = async (videoId: string, newStatus: string) => {
        const availableStatuses = getAvailableStatuses();

        if (!availableStatuses.includes(newStatus) && role !== 'admin') {
            toast.error('Você não tem permissão para definir este status.', { position: 'top-right' });
            return;
        }

        if (['Roteiro_Solicitado', 'Narração_Solicitada', 'Edição_Solicitada', 'Thumbnail_Solicitada'].includes(newStatus)) {
            setPendingStatusChange({ videoId, newStatus });
            setIsSendMessageModalOpen(true);
            return;
        }

        await updateVideoStatus(videoId, newStatus, 0);
    };

    const updateVideoStatus = async (videoId: string, newStatus: string, sendMessage: number) => {
        const isFreelancer = localStorage.getItem('isFreelancer') === 'true';
        const userId = isFreelancer
            ? localStorage.getItem('userId')
            : localStorage.getItem('userIdA');

        if (!userId) {
            toast.error('Usuário não identificado.', { position: 'top-right' });
            return;
        }

        try {
            const response = await fetch(`apitubeflow.conexaocode.com/api/videos/${videoId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    userId,
                    isUser: !isFreelancer,
                    sendMessage
                }),
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

    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="min-h-screen flex overflow-x-hidden">
            <ToastContainer />
            <Sidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isSidebarOpen={isSidebarOpen}
                onCloseSidebar={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 min-h-screen flex flex-col relative bg-gray-50 w-full overflow-x-auto">
                <HeaderAdmin
                    activeSection="Configurações"
                    onToggleSidebar={handleToggleSidebar}
                />
                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mb-8 max-w-[1920px] mx-auto">
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
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Todos os Status</option>
                                    {getAvailableStatuses().map((status) => (
                                        <option key={status} value={status}>
                                            {status.replace(/_/g, ' ')}
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

                        <div className="hidden lg:block 2xl:hidden">
                            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-x-auto">
                                <table className="w-full whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900 border-b">Título</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900 border-b">Canal</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900 border-b">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900 border-b w-[250px]">Observações</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900 border-b">Roteirista</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900 border-b">Narrador</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900 border-b">Editor</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900 border-b">Thumb Maker</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900 border-b">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredVideos.map((video) => (
                                            <tr key={video.id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-4 py-3 font-medium text-gray-900 break-words">{video.title}</td>
                                                <td className="px-4 py-3 text-gray-600 break-words flex items-center">
                                                    <Youtube className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                                                    {video.channelName}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={video.status}
                                                        onChange={(e) => handleStatusChange(video.id, e.target.value)}
                                                        className={`inline-flex items-center px-3 py-2 rounded-full text-sm border focus:ring-2 focus:ring-blue-500 transition-colors duration-150 ${statusColors[video.status]?.bg || 'bg-gray-100'} ${statusColors[video.status]?.text || 'text-gray-600'}`}
                                                    >
                                                        {getAvailableStatuses().map((status) => (
                                                            <option key={status} value={status}>
                                                                {status.replace(/_/g, ' ')}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 break-words">{video.observations || 'N/A'}</td>
                                                <td className="px-4 py-3 text-gray-600 break-words">{video.scriptWriterName || 'N/A'}</td>
                                                <td className="px-4 py-3 text-gray-600 break-words">{video.narratorName || 'N/A'}</td>
                                                <td className="px-4 py-3 text-gray-600 break-words">{video.editorName || 'N/A'}</td>
                                                <td className="px-4 py-3 text-gray-600 break-words">{video.thumbMakerName || 'N/A'}</td>
                                                <td className="px-4 py-3 flex gap-2">
                                                    {canEditVideo(video) && (
                                                        <button onClick={() => { setSelectedVideo(video); setIsEditModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar">
                                                            <Edit2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {canDeleteVideo() && (
                                                        <button onClick={() => { setSelectedVideo(video); setIsDeleteModalOpen(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Excluir">
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {video.youtubeUrl && (
                                                        <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Ver no YouTube">
                                                            <ExternalLink className="w-5 h-5" />
                                                        </a>
                                                    )}
                                                    <button onClick={() => openCommentsModal(video)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Comentários">
                                                        <MessageSquare className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden 2xl:block">
                            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-x-auto">
                                <table className="w-full whitespace-normal">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900 border-b">Título</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900 border-b">Canal</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900 border-b">Status</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900 border-b w-[300px]">Observações</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900 border-b">Roteirista</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900 border-b">Narrador</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900 border-b">Editor</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900 border-b">Thumb Maker</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900 border-b">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredVideos.map((video) => (
                                            <tr key={video.id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-900 break-words">{video.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <Youtube className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                                                        <span className="text-gray-600 break-words">{video.channelName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={video.status}
                                                        onChange={(e) => handleStatusChange(video.id, e.target.value)}
                                                        className={`inline-flex items-center px-3 py-2 rounded-full text-sm border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150 ${statusColors[video.status]?.bg || 'bg-gray-100'} ${statusColors[video.status]?.text || 'text-gray-600'}`}
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
                                                    <div className="relative group">
                                                        <div className="max-h-24 overflow-hidden text-gray-600">
                                                            {video.observations || 'N/A'}
                                                        </div>
                                                        {video.observations && video.observations.length > 100 && (
                                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent h-12 pointer-events-none group-hover:hidden" />
                                                        )}
                                                        {video.observations && video.observations.length > 100 && (
                                                            <button
                                                                onClick={() => {
                                                                    const dialog = document.createElement('dialog');
                                                                    dialog.className = 'p-6 rounded-lg shadow-xl max-w-2xl w-full';
                                                                    dialog.innerHTML = `
                        <div class="flex flex-col">
                          <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold text-gray-900">Observações</h3>
                            <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('dialog').close()">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div class="text-gray-600 whitespace-pre-wrap">${video.observations}</div>
                        </div>
                      `;
                                                                    document.body.appendChild(dialog);
                                                                    dialog.showModal();
                                                                    dialog.addEventListener('close', () => {
                                                                        dialog.remove();
                                                                    });
                                                                }}
                                                                className="text-blue-600 hover:text-blue-800 text-sm mt-2 focus:outline-none group-hover:block hidden"
                                                            >
                                                                Ver mais
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 break-words">{video.scriptWriterName || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 break-words">{video.narratorName || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 break-words">{video.editorName || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 break-words">{video.thumbMakerName || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {canEditVideo(video) && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedVideo(video);
                                                                    setIsEditModalOpen(true);
                                                                }}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
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
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
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
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                                                                title="Ver no YouTube"
                                                            >
                                                                <ExternalLink className="w-5 h-5" />
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={() => openCommentsModal(video)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-150"
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
                        <div className="lg:hidden space-y-4 w-full">
                            {filteredVideos.map((video) => (
                                <div
                                    key={video.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                                >
                                    <div className="p-4 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{video.title}</h3>
                                                <div className="flex items-center mt-2 text-gray-600">
                                                    <Youtube className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                                                    <span className="text-sm">{video.channelName}</span>
                                                </div>
                                            </div>
                                            {video.youtubeUrl && (
                                                <a
                                                    href={video.youtubeUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                </a>
                                            )}
                                        </div>

                                        <div className="w-full">
                                            <select
                                                value={video.status}
                                                onChange={(e) => handleStatusChange(video.id, e.target.value)}
                                                className={`w-full px-3 py-2 rounded-lg text-sm border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${statusColors[video.status]?.bg || 'bg-gray-100'
                                                    } ${statusColors[video.status]?.text || 'text-gray-600'}`}
                                                disabled={role !== 'admin' && !getAvailableStatuses().includes(video.status)}
                                            >
                                                {getAvailableStatuses().map((status) => (
                                                    <option key={status} value={status}>
                                                        {status.replace(/_/g, ' ')}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-500">Roteirista</label>
                                                <p className="text-sm text-gray-900">{video.scriptWriterName || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-500">Narrador</label>
                                                <p className="text-sm text-gray-900">{video.narratorName || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-500">Editor</label>
                                                <p className="text-sm text-gray-900">{video.editorName || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-500">Thumb Maker</label>
                                                <p className="text-sm text-gray-900">{video.thumbMakerName || 'N/A'}</p>
                                            </div>
                                        </div>

                                        {video.observations && (
                                            <div className="pt-3 border-t border-gray-100">
                                                <label className="text-xs font-medium text-gray-500 mb-1 block">Observações</label>
                                                <p className="text-sm text-gray-700 line-clamp-3">{video.observations}</p>
                                                {video.observations.length > 150 && (
                                                    <button
                                                        onClick={() => {
                                                            const dialog = document.createElement('dialog');
                                                            dialog.className = 'p-6 rounded-lg shadow-xl max-w-2xl w-full';
                                                            dialog.innerHTML = `
                              <div class="flex flex-col">
                                <div class="flex justify-between items-center mb-4">
                                  <h3 class="text-lg font-semibold text-gray-900">Observações</h3>
                                  <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('dialog').close()">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                                <div class="text-gray-600 whitespace-pre-wrap">${video.observations}</div>
                              </div>
                            `;
                                                            document.body.appendChild(dialog);
                                                            dialog.showModal();
                                                            dialog.addEventListener('close', () => {
                                                                dialog.remove();
                                                            });
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 text-sm mt-1 focus:outline-none"
                                                    >
                                                        Ver mais
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div className="flex gap-2">
                                                {canEditVideo(video) && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedVideo(video);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => openCommentsModal(video)}
                                                className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                Comentários
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {isSendMessageModalOpen && pendingStatusChange && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100"
                            style={{
                                animation: 'modal-pop 0.3s ease-out',
                            }}
                        >
                            {/* Header */}
                            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-t-2xl border-b border-blue-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-600 rounded-lg">
                                            <BellRing className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800">Enviar Notificação</h2>
                                            <p className="text-sm text-gray-600 mt-0.5">Via WhatsApp</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsSendMessageModalOpen(false);
                                            updateVideoStatus(pendingStatusChange.videoId, pendingStatusChange.newStatus, 0);
                                        }}
                                        className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="flex items-start space-x-4 mb-8">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <MessageSquareWarning className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900 mb-1">Confirmar Envio</h3>
                                        <p className="text-gray-600">
                                            Você está prestes a enviar uma notificação via WhatsApp para o freelancer responsável.
                                            Deseja prosseguir com o envio?
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => {
                                            setIsSendMessageModalOpen(false);
                                            updateVideoStatus(pendingStatusChange.videoId, pendingStatusChange.newStatus, 0);
                                        }}
                                        className="inline-flex items-center px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        <XCircle className="w-5 h-5 mr-2 text-gray-500" />
                                        Não Enviar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsSendMessageModalOpen(false);
                                            updateVideoStatus(pendingStatusChange.videoId, pendingStatusChange.newStatus, 1);
                                        }}
                                        className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm"
                                    >
                                        <Send className="w-5 h-5 mr-2" />
                                        Enviar Notificação
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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