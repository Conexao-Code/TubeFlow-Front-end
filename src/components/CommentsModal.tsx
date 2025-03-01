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

    // Format relative time
    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) {
            return 'agora';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} atrás`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
        } else {
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
    };

    // Format time
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch comments
    const fetchComments = async (videoId: string) => {
        try {
            const companyId = localStorage.getItem('companyId');
            const response = await fetch(
                `https://apitubeflow.conexaocode.com/api/videos/${videoId}/comments?companyId=${companyId}`
            );
            const data = await response.json();

            if (data.comments) {
                const formattedComments = data.comments.map((comment: any) => ({
                    id: comment.id || Math.random().toString(36).substr(2, 9),
                    text: comment.text || '',
                    userName: comment.userName || 'Anônimo',
                    userRole: comment.userRole || 'Desconhecido',
                    createdAt: comment.createdAt || new Date().toISOString(),
                    userId: comment.userId || ''
                }));
                
                // Sort comments by creation date (oldest first)
                formattedComments.sort((a: Comment, b: Comment) => 
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
                
                setComments(formattedComments);
                
                // Scroll to bottom after comments load
                setTimeout(scrollToBottom, 100);
            } else {
                setComments([]);
            }
        } catch (error) {
            console.error('Erro ao buscar comentários:', error);
            toast.error('Erro ao buscar comentários.', { position: 'top-right' });
        }
    };

    // Poll for new comments
    useEffect(() => {
        if (!isOpen || !video) return;
        
        fetchComments(video.id);
        
        // Set up polling for real-time updates
        const intervalId = setInterval(() => {
            if (video) {
                fetchComments(video.id);
            }
        }, 5000); // Poll every 5 seconds
        
        return () => clearInterval(intervalId);
    }, [isOpen, video]);

    // Scroll to bottom when comments change
    useEffect(() => {
        scrollToBottom();
    }, [comments]);

    // Handle adding a new comment
    const handleAddComment = async () => {
        if (!newComment.trim() || !video) return;
        
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
                
                const newCommentObj: Comment = {
                    id: Math.random().toString(36).substr(2, 9),
                    text: newComment,
                    userName,
                    userRole,
                    createdAt: new Date().toISOString(),
                    userId: userId || ''
                };
                
                setComments(prev => [...prev, newCommentObj]);
                setNewComment('');
                scrollToBottom();
                
                // Fetch the latest comments to ensure consistency
                fetchComments(video.id);
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

    // Handle key press (Enter to submit)
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddComment();
        }
    };

    if (!isOpen || !video) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all overflow-hidden">
                {/* Header */}
                <div className="p-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <MessageSquare className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    Comentários
                                </h2>
                                <p className="text-sm text-blue-100 mt-0.5 max-w-md truncate">
                                    {video.title}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Fechar"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col h-[600px]">
                    {/* Comments area */}
                    <div 
                        ref={commentsContainerRef}
                        className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gray-50"
                    >
                        {comments.length > 0 ? (
                            <div className="space-y-4">
                                {comments.map((comment, index) => {
                                    const isCurrentUser = comment.userId === currentUserId;
                                    
                                    return (
                                        <div
                                            key={comment.id || index}
                                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div 
                                                className={`max-w-[80%] ${
                                                    isCurrentUser 
                                                        ? 'bg-blue-600 text-white rounded-t-xl rounded-bl-xl' 
                                                        : 'bg-white text-gray-800 border border-gray-200 rounded-t-xl rounded-br-xl'
                                                } p-4 shadow-sm`}
                                            >
                                                {!isCurrentUser && (
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-medium text-sm">
                                                            {comment.userName?.charAt(0)?.toUpperCase() || 'A'}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-sm">
                                                                {comment.userName}
                                                            </h3>
                                                            <span className="text-xs text-gray-500">
                                                                {comment.userRole}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <p className={`text-sm whitespace-pre-wrap ${isCurrentUser ? 'text-white' : 'text-gray-700'}`}>
                                                    {comment.text}
                                                </p>
                                                
                                                <div className={`flex items-center justify-end mt-1 text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-400'}`}>
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    <span>{formatTime(comment.createdAt)}</span>
                                                    <span className="ml-1">({formatRelativeTime(comment.createdAt)})</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare className="w-8 h-8 text-blue-600" />
                                </div>
                                <p className="text-gray-700 font-medium">Nenhum comentário encontrado</p>
                                <p className="text-sm text-gray-500 mt-1">Seja o primeiro a comentar!</p>
                            </div>
                        )}
                    </div>

                    {/* Comment input area */}
                    <div className="p-4 bg-white border-t border-gray-100 rounded-b-2xl">
                        <div className="flex items-end space-x-2">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Escreva um comentário..."
                                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400 min-h-[80px] max-h-[120px]"
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={isSubmitting || !newComment.trim()}
                                className={`p-3 ${
                                    isSubmitting || !newComment.trim() 
                                        ? 'bg-gray-300 cursor-not-allowed' 
                                        : 'bg-blue-600 hover:bg-blue-700'
                                } text-white font-medium rounded-xl transition-all shadow-sm flex-shrink-0`}
                                aria-label="Enviar comentário"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-right">
                            Pressione Enter para enviar ou Shift+Enter para quebrar linha
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentsModal;