import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, Search, X, Menu, FileSpreadsheet, File, } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import HeaderAdmin from '../components/HeaderAdmin';
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
    Cell,
    LineChart,
    Line
} from 'recharts';

interface ReportData {
    id: string;
    channelName: string;
    videoTitle: string;
    status: string;
    averageTime: string;
    rawData: {
        totalTasks: string;
        averageSeconds: number;
    };
    freelancerName?: string;
    createdAt?: string;
}


interface Channel {
    id: string;
    name: string;
}

interface Freelancer {
    id: string;
    name: string;
}

interface GlobalStats {
    totalTasks: number;
    averageTime: number;
    topFreelancer: string;
    topChannel: string;
}

interface StatusCount {
    status: string;
    count: number;
}

function CustomReports() {
    const [activeSection, setActiveSection] = useState('Relatórios');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedChannel, setSelectedChannel] = useState('');
    const [selectedFreelancer, setSelectedFreelancer] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [channels, setChannels] = useState<Channel[]>([]);
    const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
    const [reportData, setReportData] = useState<ReportData[]>([]);
    const [globalStats, setGlobalStats] = useState<GlobalStats>({
        totalTasks: 0,
        averageTime: 0,
        topFreelancer: '',
        topChannel: ''
    });

    const [statusCounts, setStatusCounts] = useState<StatusCount[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const formatTimeSpent = (totalSeconds: number): string => {
        if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
            return '0m 0s';
        }

        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;
    };


    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
    const STATUS_OPTIONS = [
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
    ];

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        await Promise.all([
            fetchChannels(),
            fetchFreelancers()
        ]);
    };

    const fetchChannels = async () => {
        try {
            const companyId = localStorage.getItem('companyId');
            const response = await fetch(
                `https://apitubeflow.conexaocode.com/api/channels3?companyId=${companyId}`
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
            const companyId = localStorage.getItem('companyId');
            const response = await fetch(
                `https://apitubeflow.conexaocode.com/api/freelancers2?companyId=${companyId}`
            );
            const json = await response.json();
            setFreelancers(json.data);
        } catch (error) {
            console.error('Error fetching freelancers:', error);
            toast.error('Erro ao carregar freelancers');
        }
    };

    const generateReport = async () => {
        setIsLoading(true);

        try {
            const companyId = localStorage.getItem('companyId');
            const params = new URLSearchParams({
                companyId: companyId || '',
                ...(startDate && { startDate }),
                ...(endDate && { endDate }),
                ...(selectedChannel && { channelId: selectedChannel }),
                ...(selectedFreelancer && { freelancerId: selectedFreelancer }),
                ...(selectedStatus && { status: selectedStatus }),
            });

            const [reportResponse, statsResponse, statusResponse] = await Promise.all([
                fetch(`https://apitubeflow.conexaocode.com/api/reports/data?${params}`),
                fetch(`https://apitubeflow.conexaocode.com/api/reports/stats?${params}`),
                fetch(`https://apitubeflow.conexaocode.com/api/reports/status?${params}`),
            ]);

            const reportData = await reportResponse.json();
            const statsData = await statsResponse.json();
            const statusData = await statusResponse.json();

            const formattedStatusData = statusData.map((item: { status: string; count: string }) => ({
                status: item.status,
                count: Number(item.count) || 0
            }));
            setStatusCounts(formattedStatusData);

            const formattedReportData = reportData.map((item: ReportData) => ({
                ...item,
                timeSpentInSeconds: item.rawData.averageSeconds || 0,
                timeSpent: item.averageTime || formatTimeSpent(item.rawData.averageSeconds || 0),
            }));

            setReportData(formattedReportData);
            setGlobalStats({
                totalTasks: Number(statsData.totaltasks) || 0,
                averageTime: Number(statsData.averagetime) || 0,
                topFreelancer: statsData.topfreelancer || '',
                topChannel: statsData.topchannel || ''
            });

            toast.success('Relatório gerado com sucesso!');
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Erro ao gerar relatório');
        } finally {
            setIsLoading(false);
        }
    };


    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedChannel('');
        setSelectedFreelancer('');
        setSelectedStatus('');
    };

    const exportReport = async (format: 'excel' | 'pdf') => {
        try {
            const companyId = localStorage.getItem('companyId');
            const params = new URLSearchParams({
                format,
                companyId: companyId || '',
                ...(startDate && { startDate }),
                ...(endDate && { endDate }),
                ...(selectedChannel && { channelId: selectedChannel }),
                ...(selectedFreelancer && { freelancerId: selectedFreelancer }),
                ...(selectedStatus && { status: selectedStatus })
            });

            const response = await fetch(
                `https://apitubeflow.conexaocode.com/api/reports/export?${params}`
            );

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report-${new Date().toISOString()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success(`Relatório exportado com sucesso em ${format.toUpperCase()}!`);
        } catch (error) {
            console.error('Error exporting report:', error);
            toast.error('Erro ao exportar relatório');
        }
    };

    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    return (
        <div className="min-h-screen bg-gray-50 flex">
            <ToastContainer />
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                onCloseSidebar={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 min-h-screen flex flex-col relative w-full max-w-full">
                <HeaderAdmin
                    activeSection="Configurações"
                    onToggleSidebar={handleToggleSidebar}
                />
                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="flex justify-end mb-6">
                        <div className="flex gap-2">
                            <button
                                onClick={() => exportReport('excel')}
                                className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                <FileSpreadsheet className="w-5 h-5 mr-2" />
                                Excel
                            </button>
                            <button
                                onClick={() => exportReport('pdf')}
                                className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                <File className="w-5 h-5 mr-2" />
                                PDF
                            </button>
                        </div>
                    </div>


                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data Inicial
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data Final
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Canal
                                </label>
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
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Freelancer
                                </label>
                                <select
                                    value={selectedFreelancer}
                                    onChange={(e) => setSelectedFreelancer(e.target.value)}
                                    className="w-full h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Todos os Freelancers</option>
                                    {freelancers.map((freelancer) => (
                                        <option key={freelancer.id} value={freelancer.id}>
                                            {freelancer.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Todos os Status</option>
                                    {STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>
                                            {status.replace(/_/g, ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={generateReport}
                                    disabled={isLoading}
                                    className="flex items-center justify-center h-10 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'Gerando...' : 'Gerar Relatório'}
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center justify-center h-10 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <Filter className="w-5 h-5 mr-2" />
                                    Limpar Filtros
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Global Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                            <h3 className="text-lg font-semibold mb-2">Total de Tarefas</h3>
                            <p className="text-3xl font-bold">{globalStats.totalTasks}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                            <h3 className="text-lg font-semibold mb-2">Média de Tempo</h3>
                            <p className="text-3xl font-bold">
                                {globalStats.averageTime > 0
                                    ? formatTimeSpent(globalStats.averageTime)
                                    : '0'}
                            </p>
                        </div>



                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                            <h3 className="text-lg font-semibold mb-2">Top Freelancer</h3>
                            <p className="text-3xl font-bold">{globalStats.topFreelancer}</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                            <h3 className="text-lg font-semibold mb-2">Canal Mais Ativo</h3>
                            <p className="text-3xl font-bold">{globalStats.topChannel}</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Status</h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusCounts}
                                            dataKey="count"
                                            nameKey="status"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({ status, count }) => `${status.replace(/_/g, ' ')}: ${count}`}
                                        >
                                            {statusCounts.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => [`Quantidade: ${value}`]}
                                        />
                                        <Legend
                                            wrapperStyle={{ paddingTop: '20px' }}
                                            formatter={(value) => value.replace(/_/g, ' ')}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Progresso ao Longo do Tempo</h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={reportData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="createdAt"
                                            tickFormatter={(str) => {
                                                const date = new Date(str);
                                                return date.toLocaleDateString('pt-BR');
                                            }}
                                        />
                                        <YAxis
                                            tickFormatter={(value) => formatTimeSpent(value).replace(/[^0-9hm]/g, '')}
                                        />
                                        <Tooltip
                                            formatter={(value: number) => formatTimeSpent(Number(value))}
                                            labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="timeSpentInSeconds"
                                            stroke="#3B82F6"
                                            name="Tempo Médio por Tarefa"
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 8 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>

                    {/* Report Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-blue-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-blue-900">Canal</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-blue-900">Vídeo</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-blue-900">Status Atual</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-blue-900">Média de Tempo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {reportData.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-600">{item.channelName}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.videoTitle}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{item.status.replace(/_/g, ' ')}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{item.averageTime}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default CustomReports;