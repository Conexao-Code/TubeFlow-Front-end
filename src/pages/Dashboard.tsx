import React, { useState, useEffect } from 'react';
import { 
  Menu,
  Video,
  CheckCircle,
  Users,
  Youtube,
  Clock,
  TrendingUp,
  Bell
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface RecentActivity {
    id: number;
    message: string; 
    time: string;
}

function Dashboard() {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [stats, setStats] = useState({
        videosInProgress: 0,
        videosCompleted: 0,
        activeFreelancers: 0,
        managedChannels: 0,
    });
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('http://localhost:1100/api/dashboard');
                const data = await response.json();
                setStats(data.stats);
                setRecentActivities(data.recentActivities);
            } catch (error) {
                console.error('Erro ao buscar dados do dashboard:', error);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        {
            title: 'Vídeos em Andamento',
            value: stats.videosInProgress,
            icon: Video,
            color: 'bg-blue-50 text-blue-600'
        },
        {
            title: 'Vídeos Concluídos',
            value: stats.videosCompleted,
            icon: CheckCircle,
            color: 'bg-green-50 text-green-600'
        },
        {
            title: 'Freelancers Ativos',
            value: stats.activeFreelancers,
            icon: Users,
            color: 'bg-purple-50 text-purple-600'
        },
        {
            title: 'Canais Gerenciados',
            value: stats.managedChannels,
            icon: Youtube,
            color: 'bg-red-50 text-red-600'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar 
                activeSection={activeSection} 
                setActiveSection={setActiveSection}
                isSidebarOpen={isSidebarOpen}
                onCloseSidebar={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col min-h-screen">
                <Header activeSection={activeSection}>
                    <button
                        onClick={() => setIsSidebarOpen((prevState) => !prevState)}
                        className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </Header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statCards.map((card, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2 rounded-lg ${card.color}`}>
                                        <card.icon className="w-6 h-6" />
                                    </div>

                                </div>
                                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-blue-50 p-2 rounded-lg">
                                        <Bell className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900">Atividades Recentes</h2>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-gray-100 p-2 rounded-full">
                                                <Clock className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <p className="text-sm text-gray-600">{activity.message}</p>
                                        </div>
                                        <span className="text-sm text-gray-500 font-medium">{activity.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;