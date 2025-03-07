import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Download, Filter, Search, X, Menu } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import HeaderAdmin from '../components/HeaderAdmin';
import Sidebar from '../components/Sidebar';

interface LogEntry {
    id: string;
    videoId: string;
    videoTitle: string;
    channelName: string;
    freelancerName: string;
    previousStatus: string;
    newStatus: string;
    timestamp: string;
}

interface FreelancerStats {
    id: string;
    name: string;
    tasksCompleted: number;
    averageTime: number;
    delays: number;
    averageTimeFormatted?: string;
}
interface Channel {
    id: string;
    name: string;
}
interface Freelancer {
    id: string;
    name: string;
}

function LogsAndStats() {
    const [activeSection, setActiveSection] = useState('Logs e Estatísticas');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedChannel, setSelectedChannel] = useState('');
    const [selectedFreelancer, setSelectedFreelancer] = useState('');
    const [channels, setChannels] = useState<Channel[]>([]);
    const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [stats, setStats] = useState<FreelancerStats[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const ITEMS_PER_PAGE = 10;
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
    const companyId = localStorage.getItem('companyId') || '';

    // Set sidebar to open by default on larger screens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
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

    useEffect(() => {
        fetchChannels();
        fetchFreelancers();
        fetchLogs();
        fetchStats();
    }, [startDate, endDate, selectedChannel, selectedFreelancer, currentPage]);

    const formatTime = (timeInSeconds: number): string => {
        const days = Math.floor(timeInSeconds / 86400);
        const hours = Math.floor((timeInSeconds % 86400) / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
        if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    };

    const fetchChannels = async () => {
        try {
            const response = await fetch(
                `https://apitubeflow.conexaocode.com/api/channels2?companyId=${encodeURIComponent(companyId)}`
            );
            const json = await response.json();
            setChannels(json.channels);
        } catch (error) {
            console.error('Error fetching channels:', error);
            toast.error('Erro ao carregar canais');
        }
    };

    const fetchFreelancers = async () => {
        try {
            const response = await fetch(
                `https://apitubeflow.conexaocode.com/api/freelancers3?companyId=${encodeURIComponent(companyId)}`
            );
            const json = await response.json();
            setFreelancers(json.data);
        } catch (error) {
            console.error('Error fetching freelancers:', error);
            toast.error('Erro ao carregar freelancers');
        }
    };

    const fetchLogs = async () => {
        try {
            const params = new URLSearchParams({
                companyId: encodeURIComponent(companyId),
                page: currentPage.toString(),
                limit: ITEMS_PER_PAGE.toString(),
                ...(startDate && { startDate }),
                ...(endDate && { endDate }),
                ...(selectedChannel && { channelId: selectedChannel }),
                ...(selectedFreelancer && { freelancerId: selectedFreelancer })
            });
            
            const response = await fetch(
                `https://apitubeflow.conexaocode.com/api/logs2?${params}`
            );
            const data = await response.json();
            setLogs(data.logs);
            setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.error('Erro ao carregar logs');
        }
    };

    const fetchStats = async () => {
        try {
            const params = new URLSearchParams({
                companyId: encodeURIComponent(companyId),
                ...(startDate && { startDate }),
                ...(endDate && { endDate }),
                ...(selectedChannel && { channelId: selectedChannel }),
                ...(selectedFreelancer && { freelancerId: selectedFreelancer })
            });
            
            const response = await fetch(
                `https://apitubeflow.conexaocode.com/api/stats?${params}`
            );
            const data = await response.json();
            const formattedStats = data.stats.map((stat: FreelancerStats) => ({
                ...stat,
                averageTime: Number(stat.averageTime),
                averageTimeFormatted: formatTime(Number(stat.averageTime))
            }));
            setStats(formattedStats);
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Erro ao carregar estatísticas');
        }
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedChannel('');
        setSelectedFreelancer('');
        setCurrentPage(1);
        setIsFilterOpen(false);
    };

    const exportData = async (type: 'logs' | 'stats' | 'all') => {
        try {
            const params = new URLSearchParams({
                companyId: encodeURIComponent(companyId),
                ...(startDate && { startDate }),
                ...(endDate && { endDate }),
                ...(selectedChannel && { channelId: selectedChannel }),
                ...(selectedFreelancer && { freelancerId: selectedFreelancer }),
                type
            });
            
            const response = await fetch(
                `https://apitubeflow.conexaocode.com/api/export?${params}`
            );
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `export-${type}-${new Date().toISOString()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Dados exportados com sucesso!');
        } catch (error) {
            console.error('Error exporting data:', error);
            toast.error('Erro ao exportar dados');
        }
    };

    const validStats = stats.filter(stat => stat.tasksCompleted > 0);
    const overallAverage = validStats.length > 0
        ? validStats.reduce((acc, curr) => acc + curr.averageTime, 0) / validStats.length
        : 0;
    const overallAverageFormatted = formatTime(overallAverage);
    
    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleFilters = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
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
                <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
                    {/* Mobile Filter Toggle Button */}
                    <div className="md:hidden mb-4">
                        <button
                            onClick={toggleFilters}
                            className="w-full flex items-center justify-center h-10 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <Filter className="w-5 h-5 mr-2" />
                            {isFilterOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                        </button>
                    </div>

                    {/* Filters Section - Responsive */}
                    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6 ${isFilterOpen || window.innerWidth >= 768 ? 'block' : 'hidden md:block'}`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                            <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="w-full h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="w-full h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
                                <select
                                    value={selectedChannel}
                                    onChange={e => setSelectedChannel(e.target.value)}
                                    className="w-full h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Todos os Canais</option>
                                    {channels.map(channel => (
                                        <option key={channel.id} value={channel.id}>
                                            {channel.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Freelancer</label>
                                <select
                                    value={selectedFreelancer}
                                    onChange={e => setSelectedFreelancer(e.target.value)}
                                    className="w-full h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Todos os Freelancers</option>
                                    {freelancers.map(freelancer => (
                                        <option key={freelancer.id} value={freelancer.id}>
                                            {freelancer.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center justify-center">
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center justify-center h-10 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors w-full"
                                >
                                    <Filter className="w-5 h-5 mr-2" />
                                    Limpar Filtros
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards - Responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 sm:p-6 text-white">
                            <h3 className="text-lg font-semibold mb-2">Total de Tarefas</h3>
                            <p className="text-2xl sm:text-3xl font-bold">
                                {("0" + stats.reduce((acc, curr) => acc + curr.tasksCompleted, 0)).slice(-2)}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 sm:p-6 text-white">
                            <h3 className="text-lg font-semibold mb-2">Média de Tempo</h3>
                            <p className="text-2xl sm:text-3xl font-bold">{overallAverageFormatted}</p>
                        </div>
                    </div>

                    {/* Chart Section - Responsive */}
                    <div className="grid grid-cols-1 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Tarefas Concluídas por Freelancer
                            </h2>
                            <div className="h-60 sm:h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                                        <Bar dataKey="tasksCompleted" fill="#3B82F6" name="Tarefas Concluídas" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Logs Table - Responsive */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Histórico de Alterações</h2>
                            <button
                                onClick={() => exportData('logs')}
                                className="flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Exportar Logs
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-blue-50">
                                    <tr>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-blue-900">
                                            Data/Hora
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-blue-900">
                                            Vídeo
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-blue-900">
                                            Canal
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-blue-900">
                                            Freelancer
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-blue-900">
                                            Status Anterior
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-blue-900">
                                            Status Atual
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {logs.map(log => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap max-w-[150px] sm:max-w-[200px] truncate">
                                                {log.videoTitle}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                                {log.channelName}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                                {log.freelancerName}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                                {log.previousStatus?.replace(/_/g, ' ') || ''}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                                {log.newStatus?.replace(/_/g, ' ') || ''}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100">
                            <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-0">
                                Página {currentPage} de {totalPages}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Próxima
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default LogsAndStats;