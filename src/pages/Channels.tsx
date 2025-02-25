import React, { useState, useEffect } from 'react';
import { Plus, X, AlertTriangle, Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import HeaderAdmin from '../components/HeaderAdmin';
import ChannelCard from '../components/ChannelCard';
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
  const [editFormData, setEditFormData] = useState({ name: '', description: '', youtubeUrl: '' });
  const [formErrors, setFormErrors] = useState<{ name?: string; description?: string; youtubeUrl?: string }>({});

  const [createFormData, setCreateFormData] = useState({ name: '', description: '', youtubeUrl: '' });
  const [createFormErrors, setCreateFormErrors] = useState<{ name?: string; description?: string; youtubeUrl?: string }>({});

  const totalChannels = channels.length;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch('apitubeflow.conexaocode.com/api/channels');
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

  useEffect(() => {
    if (selectedChannel) {
      setEditFormData({
        name: selectedChannel.name,
        description: selectedChannel.description,
        youtubeUrl: selectedChannel.youtubeUrl,
      });
    }
  }, [selectedChannel]);

  const handleCreateChannel = async (data: any) => {
    try {
      const response = await fetch('apitubeflow.conexaocode.com/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const newChannel = await response.json();
        setChannels([...channels, { ...data, id: newChannel.id, totalVideos: 0, monthlyVideos: 0 }]);
        setIsCreateModalOpen(false);
        setCreateFormData({ name: '', description: '', youtubeUrl: '' });
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
      const response = await fetch(`apitubeflow.conexaocode.com/api/channels/${selectedChannel.id}`, {
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
      const response = await fetch(`apitubeflow.conexaocode.com/api/channels/${selectedChannel.id}`, {
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

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors: { name?: string; description?: string; youtubeUrl?: string } = {};
    if (!editFormData.name) errors.name = 'O nome é obrigatório.';
    if (!editFormData.description) errors.description = 'A descrição é obrigatória.';
    if (!editFormData.youtubeUrl) errors.youtubeUrl = 'A URL do YouTube é obrigatória.';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    await handleEditChannel(editFormData);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors: { name?: string; description?: string; youtubeUrl?: string } = {};
    if (!createFormData.name) errors.name = 'O nome é obrigatório.';
    if (!createFormData.description) errors.description = 'A descrição é obrigatória.';
    if (!createFormData.youtubeUrl) errors.youtubeUrl = 'A URL do YouTube é obrigatória.';
    setCreateFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    await handleCreateChannel(createFormData);
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
        <HeaderAdmin activeSection={activeSection}>
          <button
            onClick={() => setIsSidebarOpen((prevState) => !prevState)}
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>
        </HeaderAdmin>
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
                  const channelToEdit = channels.find((c) => c.id === id) || null;
                  setSelectedChannel(channelToEdit);
                  setIsEditModalOpen(true);
                }}
                onDelete={(id) => {
                  const channelToDelete = channels.find((c) => c.id === id) || null;
                  setSelectedChannel(channelToDelete);
                  setIsDeleteModalOpen(true);
                }}
              />
            ))}
          </div>
        </main>
      </div>
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Novo Canal</h2>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setCreateFormData({ name: '', description: '', youtubeUrl: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="create-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="create-name"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      createFormErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Digite o nome do canal"
                  />
                  {createFormErrors.name && <p className="mt-1 text-sm text-red-500">{createFormErrors.name}</p>}
                </div>
                <div>
                  <label htmlFor="create-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="create-description"
                    value={createFormData.description}
                    onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      createFormErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Digite a descrição do canal"
                  />
                  {createFormErrors.description && <p className="mt-1 text-sm text-red-500">{createFormErrors.description}</p>}
                </div>
                <div>
                  <label htmlFor="create-youtubeUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube URL
                  </label>
                  <input
                    type="text"
                    id="create-youtubeUrl"
                    value={createFormData.youtubeUrl}
                    onChange={(e) => setCreateFormData({ ...createFormData, youtubeUrl: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      createFormErrors.youtubeUrl ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Digite a URL do canal no YouTube"
                  />
                  {createFormErrors.youtubeUrl && <p className="mt-1 text-sm text-red-500">{createFormErrors.youtubeUrl}</p>}
                </div>
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setCreateFormData({ name: '', description: '', youtubeUrl: '' });
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Criar Canal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditModalOpen && selectedChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Editar Canal</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedChannel(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Digite o nome do canal"
                  />
                  {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
                </div>
                <div>
                  <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="edit-description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Digite a descrição do canal"
                  />
                  {formErrors.description && <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>}
                </div>
                <div>
                  <label htmlFor="edit-youtubeUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube URL
                  </label>
                  <input
                    type="text"
                    id="edit-youtubeUrl"
                    value={editFormData.youtubeUrl}
                    onChange={(e) => setEditFormData({ ...editFormData, youtubeUrl: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.youtubeUrl ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Digite a URL do canal no YouTube"
                  />
                  {formErrors.youtubeUrl && <p className="mt-1 text-sm text-red-500">{formErrors.youtubeUrl}</p>}
                </div>
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedChannel(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isDeleteModalOpen && selectedChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Excluir Canal</h2>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-gray-600">
                  Tem certeza de que deseja excluir o canal <span className="font-semibold">{selectedChannel.name}</span>? Essa ação não poderá ser desfeita.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button onClick={handleDeleteChannel} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default Channels;
