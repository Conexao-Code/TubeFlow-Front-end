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
    Calendar
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InputMask from 'react-input-mask';

type MenuItem = {
    id: string;
    label: string;
    icon: React.ReactNode;
};

type Freelancer = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    phone: string;
};

type FreelancerFormData = {
    name: string;
    email: string;
    role: string;
    password?: string;
    phone: string;
};

type Notification = {
    type: 'success' | 'error';
    message: string;
};

function App() {
    const [activeSection, setActiveSection] = useState('freelancers');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [notification, setNotification] = useState<Notification | null>(null);
    const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
    const [formData, setFormData] = useState<FreelancerFormData>({
        name: '',
        email: '',
        role: '',
        password: '',
        phone: '',
    });
    const [formErrors, setFormErrors] = useState<Partial<FreelancerFormData>>({});
    const [freelancers, setFreelancers] = useState<Freelancer[]>([]);

    const roles = ['Roteirista', 'Editor', 'Narrador', 'Thumb Maker'];

    // Set sidebar open by default on desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        // Set initial state
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchFreelancers = async () => {
        try {
            const response = await fetch('http://localhost:1100/api/freelancers', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setFreelancers(data.data);
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Erro ao buscar freelancers.', { position: 'top-right' });
            }
        } catch (error) {
            console.error('Erro ao buscar freelancers:', error);
            toast.error('Erro na conexão com o servidor.', { position: 'top-right' });
        }
    };

    useEffect(() => {
        fetchFreelancers();
    }, []);

    const validateForm = (isEdit = false) => {
        const errors: Partial<FreelancerFormData> = {};

        if (!formData.name.trim()) {
            errors.name = 'Nome é obrigatório';
        }

        if (!formData.email.trim()) {
            errors.email = 'E-mail é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'E-mail inválido';
        }

        if (!formData.role) {
            errors.role = 'Função é obrigatória';
        }

        if (!isEdit && !formData.password?.trim()) {
            errors.password = 'Senha é obrigatória';
        } else if (!isEdit && formData.password && formData.password.length < 6) {
            errors.password = 'Senha deve ter no mínimo 6 caracteres';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm(true) && selectedFreelancer) {
            try {
                const response = await fetch(`http://localhost:1100/api/freelancers/${selectedFreelancer.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        role: formData.role,
                        phone: formData.phone,
                    }),
                });

                if (response.ok) {
                    toast.success('Freelancer atualizado com sucesso!', { position: 'top-right' });
                    fetchFreelancers();
                    setIsEditModalOpen(false);
                    setFormData({ name: '', email: '', role: '', password: '', phone: '' });
                } else {
                    const errorData = await response.json();
                    toast.error(errorData.message || 'Erro ao atualizar freelancer.', { position: 'top-right' });
                }
            } catch (error) {
                console.error('Erro ao atualizar freelancer:', error);
                toast.error('Erro na conexão com o servidor.', { position: 'top-right' });
            }
        }
    };

    const handleDelete = async () => {
        if (selectedFreelancer) {
            try {
                const response = await fetch(`http://localhost:1100/api/freelancers/${selectedFreelancer.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    toast.success('Freelancer excluído com sucesso!', { position: 'top-right' });
                    fetchFreelancers();
                    setIsDeleteModalOpen(false);
                    setSelectedFreelancer(null);
                } else {
                    const errorData = await response.json();
                    toast.error(errorData.message || 'Erro ao excluir freelancer.', { position: 'top-right' });
                }
            } catch (error) {
                console.error('Erro ao excluir freelancer:', error);
                toast.error('Erro na conexão com o servidor.', { position: 'top-right' });
            }
        }
    };

    const openEditModal = (freelancer: Freelancer) => {
        setSelectedFreelancer(freelancer);
        setFormData({
            name: freelancer.name,
            email: freelancer.email,
            role: freelancer.role,
            phone: freelancer.phone,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (freelancer: Freelancer) => {
        setSelectedFreelancer(freelancer);
        setIsDeleteModalOpen(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <ToastContainer />
            
            <Sidebar 
                activeSection={activeSection} 
                setActiveSection={setActiveSection}
                isSidebarOpen={isSidebarOpen}
                onCloseSidebar={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 min-h-screen flex flex-col">
                <Header activeSection={activeSection}>
                    <button
                        onClick={() => setIsSidebarOpen((prevState) => !prevState)}
                        className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </Header>

                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mb-6 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">
                            Lista de Freelancers
                        </h2>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">Cadastrar Freelancer</span>
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
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Função</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Data de Cadastro</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {freelancers.map((freelancer) => (
                                        <tr key={freelancer.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-800">{freelancer.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{freelancer.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{freelancer.role}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{formatDate(freelancer.createdAt)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEditModal(freelancer)}
                                                        className="p-1 text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(freelancer)}
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
                        {freelancers.map((freelancer) => (
                            <div key={freelancer.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">{freelancer.name}</h3>
                                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mt-1">
                                            {freelancer.role}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(freelancer)}
                                            className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 rounded-lg"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(freelancer)}
                                            className="p-2 text-red-600 hover:text-red-800 bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm">{freelancer.email}</span>
                                    </div>
                                    {freelancer.phone && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Phone className="w-4 h-4" />
                                            <span className="text-sm">{freelancer.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm">Cadastrado em {formatDate(freelancer.createdAt)}</span>
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
                                    <h2 className="text-xl font-semibold text-gray-800">Cadastrar Novo Freelancer</h2>
                                    <button
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        const response = await fetch('http://localhost:1100/api/register-freelancer', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({
                                                name: formData.name,
                                                email: formData.email,
                                                role: formData.role,
                                                phone: formData.phone,
                                            }),
                                        });

                                        if (response.ok) {
                                            const data = await response.json();
                                            toast.success(data.message, { position: 'top-right' });
                                            setIsCreateModalOpen(false);
                                            setFormData({ name: '', email: '', role: '', phone: '' });
                                            fetchFreelancers();
                                        } else {
                                            const errorData = await response.json();
                                            toast.error(errorData.message || 'Erro ao cadastrar freelancer.', { position: 'top-right' });
                                        }
                                    } catch (error) {
                                        console.error('Erro na solicitação de cadastro:', error);
                                        toast.error('Erro na conexão com o servidor.', { position: 'top-right' });
                                    }
                                }}
                                className="p-6"
                            >
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
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                formErrors.name ? 'border-red-500' : 'border-gray-300'
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
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                formErrors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Digite o e-mail"
                                        />
                                        {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                            Função
                                        </label>
                                        <select
                                            id="role"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                formErrors.role ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        >
                                            <option value="">Selecione uma função</option>
                                            {roles.map((role) => (
                                                <option key={role} value={role}>
                                                    {role}
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.role && <p className="mt-1 text-sm text-red-500">{formErrors.role}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Telefone
                                        </label>
                                        <InputMask
                                            mask="(99) 99999-9999"
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                formErrors.phone ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Digite o número de telefone"
                                        />
                                        {formErrors.phone && <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>}
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
                                    <h2 className="text-xl font-semibold text-gray-800">Editar Freelancer</h2>
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
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                formErrors.name ? 'border-red-500' : 'border-gray-300'
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
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                formErrors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Digite o e-mail"
                                        />
                                        {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-1">
                                            Função
                                        </label>
                                        <select
                                            id="edit-role"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                formErrors.role ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        >
                                            <option value="">Selecione uma função</option>
                                            {roles.map((role) => (
                                                <option key={role} value={role}>
                                                    {role}
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.role && <p className="mt-1 text-sm text-red-500">{formErrors.role}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Telefone
                                        </label>
                                        <InputMask
                                            mask="(99) 99999-9999"
                                            id="edit-phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                formErrors.phone ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Digite o número de telefone"
                                        />
                                        {formErrors.phone && <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>}
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
                {isDeleteModalOpen && selectedFreelancer && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-800">Excluir Freelancer</h2>
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
                                        Tem certeza de que deseja excluir o freelancer <span className="font-semibold">{selectedFreelancer.name}</span>? Essa ação não poderá ser desfeita.
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