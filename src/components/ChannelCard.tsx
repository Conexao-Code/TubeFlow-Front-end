import React from 'react';
import { Youtube, Pencil, Trash2, ExternalLink } from 'lucide-react';

interface ChannelCardProps {
  id: string;
  name: string;
  description: string;
  totalVideos: number;
  monthlyVideos: number;
  youtubeUrl: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({
  id,
  name,
  description,
  totalVideos,
  monthlyVideos,
  youtubeUrl,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Youtube className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(id)}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Total de Vídeos</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">{totalVideos}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Vídeos este Mês</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">{monthlyVideos}</p>
        </div>
      </div>

      <a
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Abrir no YouTube
      </a>
    </div>
  );
}

export default ChannelCard;