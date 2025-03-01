import React, { useState, useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';
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
    text: string;
    userName: string;
    userRole: string;
}

interface CommentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    video: Video | null;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ isOpen, onClose, video }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        if (isOpen && video) {
            fetchComments(video.id);
        }
    }, [isOpen, video]);

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
        if (!newComment || !video) return;
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
                fetchComments(video.id);
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

    if (!isOpen || !video) return null;

    return (
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
                                    {video.title}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
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
    );
};

export default CommentsModal;