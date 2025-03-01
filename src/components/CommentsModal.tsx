import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Send, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

interface Video {
    id: string;
    title: string;
    channelId: string;
    channelName: string;
    freelancerId: string;
    freelancerName: string;
    scriptWriterId?: string;
    narratorId?: string;
    editorId?: string;
    thumbMakerId?: string;
    scriptWriterName?: string;
    narratorName?: string;
    editorName?: string;
    thumbMakerName?: string;
    status: string;
    observations?: string;
    youtubeUrl?: string;
    createdAt: string;
}

interface Comment {
    id: string;
    text: string;
    userName: string;
    userRole: string;
    createdAt: string;
    userId: string;
}

interface CommentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    video: Video | null;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ isOpen, onClose, video }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const commentsContainerRef = useRef<HTMLDivElement>(null);
    const currentUserId = localStorage.getItem('isFreelancer') === 'true'
        ? localStorage.getItem('userId')
        : localStorage.getItem('userIdA');

    // Format timestamp to relative time (e.g., "2 minutes ago")
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (seconds < 60) return 'agora mesmo';
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} atrás`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
        
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
        
        const months = Math.floor(days / 30);
        if (months < 12) return `${months} ${months === 1 ? 'mês' : 'meses'} atrás`;
        
        const years = Math.floor(months / 12);
        return `${years} ${years === 1 ? 'ano' : 'anos'} atrás`;
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen && video) {
            fetchComments(video.id);
            
            // Set up polling for real-time updates
            const intervalId = setInterval(() => {
                fetchComments(video.id, true);
            }, 5000); // Poll every 5 seconds
            
            return () => clearInterval(intervalId);
        }
    }, [isOpen, video]);

    useEffect(() => {
        scrollToBottom();
    }, [comments]);

    const fetchComments = async (videoId: string, silent = false) => {
        try {
            const companyId = localStorage.getItem('companyId');
            const response = await fetch(
                `https://apitubeflow.conexaocode.com/api/videos/${videoId}/comments?companyId=${companyId}`
            );
            const data = await response.json();

            if (data.comments) {
                // Sort comments by creation date (oldest first)
                const sortedComments = data.comments
                    .map((comment: any) => ({
                        id: comment.id || Math.random().toString(36).substr(2, 9),
                        text: comment.text || '',
                        userName: comment.userName || 'Anônimo',
                        userRole: comment.userRole || 'Desconhecido',
                        createdAt: comment.createdAt || new Date().toISOString(),
                        userId: comment.userId || ''
                    }))
                    .sort((a: Comment, b: Comment) => 
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    );
                
                // Only show toast if new comments were added and not in silent mode
                if (!silent && sortedComments.length > comments.length && comments.length > 0) {
                    toast.info('Novos comentários disponíveis!', { position: 'top-right' });
                }
                
                setComments(sortedComments);
            } else {
                setComments([]);
            }
        } catch (error) {
            console.error('Erro ao buscar comentários:', error);
            if (!silent) {
                toast.error('Erro ao buscar comentários.', { position: 'top-right' });
            }
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !video || isSubmitting) return;
        
        setIsSubmitting(true);
        const companyId = localStorage.getItem('companyId');
        const isFreelancer = localStorage.getItem('isFreelancer') === 'true';
        const userId = isFreelancer
            ? localStorage.getItem('userId')
            : localStorage.getItem('userIdA');
        const userType = isFreelancer ? 'freelancer' : 'user';

        try {
            const response = await fetch(
                `https://apitubeflow.conexaocode.com/api/videos/${video.id}/comments`,
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
                // Add optimistic update
                const userName = localStorage.getItem('userName') || 'Você';
                const userRole = isFreelancer ? 'Freelancer' : 'Administrador';
                
                setComments([...comments, {
                    id: Math.random().toString(36).substr(2, 9),
                    text: newComment,
                    userName,
                    userRole,
                    createdAt: new Date().toISOString(),
                    userId: userId || ''
                }]);
                
                setNewComment('');
                fetchComments(video.id, true);
                toast.success('Comentário adicionado com sucesso!', { position: 'top-right' });
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Erro ao adicionar comentário.', { position: 'top-right' });
            }
        } catch (error) {
            console.error('Erro ao adicionar comentário:', error);
            toast.error('Erro ao adicionar comentário.', { position: 'top-right' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddComment();
        }
    };

    if (!isOpen || !video) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all overflow-hidden">
                {/* Header - Smaller and more compact */}
                <div className="p-3 bg-blue-600 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <MessageSquare className="w-4 h-4 text-white" />
                            <h2 className="text-base font-medium text-white">
                                Comentários: <span className="font-normal text-sm opacity-90">{video.title}</span>
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Fechar"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col h-[650px]">
                    {/* Comments area - Larger to prioritize message visibility */}
                    <div 
                        ref={commentsContainerRef}
                        className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-gray-50"
                    >
                        {comments.length > 0 ? (
                            <div className="space-y-3">
                                {comments.map((comment) => {
                                    const isCurrentUser = comment.userId === currentUserId;
                                    
                                    return (
                                        <div
                                            key={comment.id}
                                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div 
                                                className={`max-w-[85%] ${
                                                    isCurrentUser 
                                                        ? 'bg-blue-600 text-white rounded-t-xl rounded-bl-xl' 
                                                        : 'bg-white border border-gray-200 rounded-t-xl rounded-br-xl shadow-sm'
                                                } p-3 transition-all`}
                                            >
                                                {!isCurrentUser && (
                                                    <div className="flex items-center space-x-2 mb-1.5">
                                                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-xs">
                                                            {comment.userName?.charAt(0)?.toUpperCase() || 'A'}
                                                        </div>
                                                        <span className="font-medium text-sm text-gray-800">
                                                            {comment.userName}
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                <p className={`${isCurrentUser ? 'text-white' : 'text-gray-700'} whitespace-pre-wrap text-base leading-relaxed`}>
                                                    {comment.text}
                                                </p>
                                                
                                                <div className={`flex items-center mt-1 text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-400'}`}>
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {formatTimeAgo(comment.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                    <MessageSquare className="w-6 h-6 text-blue-500" />
                                </div>
                                <p className="text-gray-700 font-medium">Nenhum comentário encontrado</p>
                                <p className="text-sm text-gray-500 mt-1">Seja o primeiro a comentar!</p>
                            </div>
                        )}
                    </div>

                    {/* Comment input area - Compact but functional */}
                    <div className="p-3 bg-white border-t border-gray-100 rounded-b-2xl">
                        <div className="flex items-end space-x-2">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Escreva um comentário..."
                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400 min-h-[60px] max-h-[100px]"
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={isSubmitting || !newComment.trim()}
                                className={`p-3 ${
                                    isSubmitting || !newComment.trim() 
                                        ? 'bg-gray-200 text-gray-400' 
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                } rounded-xl transition-colors flex-shrink-0`}
                                aria-label="Enviar comentário"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentsModal;