import React, { useEffect, useState } from 'react';
import {
    Home,
    Users,
    Video,
    FileText,
    Clock,
    BarChart2,
    Menu,
    Bell,
    ChevronDown,
    Play,
    Triangle,
    X,
    LogOut,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    Plus,
    Check,
    AlertTriangle,
    Phone,
    Mail,
    Calendar,
    Shield
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import HeaderAdmin from '../components/HeaderAdmin';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InputMask from 'react-input-mask';

type MenuItem = {
    id: string;
    label: string;
    icon: React.ReactNode;
};

type Administrator = {
    id: string;
    name: string;
    email: string;
    createdAt: string;
};

type AdministratorFormData = {
    name: string;
    email: string;
};

type Notification = {
    type: 'success' | 'error';
    message: string;
};

function App() {
    const [activeSection, setActiveSection] = useState('Administradores');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [notification, setNotification] = useState<Notification | null>(null);
    const [selectedAdmin, setSelectedAdmin] = useState<Administrator | null>(null);
    const [formData, setFormData] = useState<AdministratorFormData>({
        name: '',
        email: '',
    });
    const [formErrors, setFormErrors] = useState<Partial<AdministratorFormData>>({});
    const [administrators, setAdministrators] = useState<Administrator[]>([]);
    const [companyId, setCompanyId] = useState<string | null>(null);

    useEffect(() => {
        const storedCompanyId = localStorage.getItem('companyId');
        if (storedCompanyId) {
            setCompanyId(storedCompanyId);
        }
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchAdministrators = async () => {
        if (!companyId) return;

        try {
            const response = await fetch('https://apitubeflow.conexaocode.com/api/administrators', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Company-Id': companyId
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAdministrators(data.data);
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Erro ao buscar administradores.', { position: 'top-right' });
            }
        } catch (error) {
            console.error('Erro ao buscar administradores:', error);
            toast.error('Erro na conexão com o servidor.', { position: 'top-right' });
        }
    };

    useEffect(() => {
        fetchAdministrators();
    }, [companyId]);

    const validateForm = () => {
        const errors: Partial<AdministratorFormData> = {};

        if (!formData.name.trim()) {
            errors.name = 'Nome é obrigatório';
        }

        if (!formData.email.trim()) {
            errors.email = 'E-mail é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'E-mail inválido';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm() && selectedAdmin && companyId) {
            try {
                const response = await fetch(`https://apitubeflow.conexaocode.com/api/administrators/${selectedAdmin.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Company-Id': companyId
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                    }),
                });

                if (response.ok) {
                    toast.success('Administrador atualizado com sucesso!', { position: 'top-right' });
                    fetchAdministrators();
                    setIsEditModalOpen(false);
                    setFormData({ name: '', email: '' });
                } else {
                    const errorData = await response.json();
                    toast.error(errorData.message || 'Erro ao atualizar administrador.', { position: 'top-right' });
                }
            } catch (error) {
                console.error('Erro ao atualizar administrador:', error);
                toast.error('Erro na conexão com o servidor.', { position: 'top-right' });
            }
        }
    };

    const handleDelete = async () => {
        if (selectedAdmin && companyId) {
            try {
                const response = await fetch(`https://apitubeflow.conexaocode.com/api/administrators/${selectedAdmin.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Company-Id': companyId
                    },
                });

                if (response.ok) {
                    toast.success('Administrador excluído com sucesso!', { position: 'top-right' });
                    fetchAdministrators();
                    setIsDeleteModalOpen(false);
                    setSelectedAdmin(null);
                } else {
                    const errorData = await response.json();
                    toast.error(errorData.message || 'Erro ao excluir administrador.', { position: 'top-right' });
                }
            } catch (error) {
                console.error('Erro ao excluir administrador:', error);
                toast.error('Erro na conexão com o servidor.', { position: 'top-right' });
            }
        }
    };

    const openEditModal = (admin: Administrator) => {
        setSelectedAdmin(admin);
        setFormData({
            name: admin.name,
            email: admin.email,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (admin: Administrator) => {
        setSelectedAdmin(admin);
        setIsDeleteModalOpen(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!companyId) return;

        try {
            const response = await fetch('https://apitubeflow.conexaocode.com/api/register-administrator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Company-Id': companyId
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(data.message, { position: 'top-right' });
                setIsCreateModalOpen(false);
                setFormData({ name: '', email: '' });
                fetchAdministrators();
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Erro ao cadastrar administrador.', { position: 'top-right' });
            }
        } catch (error) {
            console.error('Erro na solicitação de cadastro:', error);
            toast.error('Erro na conexão com o servidor.', { position: 'top-right' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <ToastContainer />

            <Sidebar
                isSidebarOpen={isSidebarOpen}
                onCloseSidebar={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 min-h-screen flex flex-col">
                <HeaderAdmin
                    activeSection="Configurações"
                    onToggleSidebar={handleToggleSidebar}
                />

                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mb-6 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">
                            Lista de Administradores
                        </h2>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">Cadastrar Administrador</span>
                            <span className="sm:hidden">Novo</span>
                        </button>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Nome</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">E-mail</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Data de Cadastro</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {administrators.map((admin) => (
                                        <tr key={admin.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-800">{admin.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{admin.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{formatDate(admin.createdAt)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEditModal(admin)}
                                                        className="p-1 text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(admin)}
                                                        className="p-1 text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {administrators.map((admin) => (
                            <div key={admin.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">{admin.name}</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(admin)}
                                            className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 rounded-lg"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(admin)}
                                            className="p-2 text-red-600 hover:text-red-800 bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm">{admin.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm">Cadastrado em {formatDate(admin.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Create Modal */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-800">Cadastrar Novo Administrador</h2>
                                    <button
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleCreate} className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Nome
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Digite o nome completo"
                                        />
                                        {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            E-mail
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.email ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Digite o e-mail"
                                        />
                                        {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-800">Editar Administrador</h2>
                                    <button
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
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
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Digite o nome completo"
                                        />
                                        {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                                            E-mail
                                        </label>
                                        <input
                                            type="email"
                                            id="edit-email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.email ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Digite o e-mail"
                                        />
                                        {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Salvar Alterações
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {isDeleteModalOpen && selectedAdmin && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-800">Excluir Administrador</h2>
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
                                        Tem certeza de que deseja excluir o administrador <span className="font-semibold">{selectedAdmin.name}</span>? Essa ação não poderá ser desfeita.
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
                                        onClick={handleDelete}
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

export default App;