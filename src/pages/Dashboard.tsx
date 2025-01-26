import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
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
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('http://77.37.43.248:1100/api/dashboard');
                const data = await response.json();

                setStats(data.stats);
                setRecentActivities(data.recentActivities);
            } catch (error) {
                console.error('Erro ao buscar dados do dashboard:', error);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed bottom-0 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg"
            >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {isSidebarOpen && (
                <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            )}

            <main className="flex-1 min-h-screen flex flex-col">
                <Header activeSection={activeSection} />
                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <p className="text-gray-600 text-sm">Vídeos em Andamento</p>
                            <p className="text-3xl font-semibold text-gray-900 mt-2">{stats.videosInProgress}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <p className="text-gray-600 text-sm">Vídeos Concluídos</p>
                            <p className="text-3xl font-semibold text-gray-900 mt-2">{stats.videosCompleted}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <p className="text-gray-600 text-sm">Freelancers Ativos</p>
                            <p className="text-3xl font-semibold text-gray-900 mt-2">{stats.activeFreelancers}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <p className="text-gray-600 text-sm">Canais Gerenciados</p>
                            <p className="text-3xl font-semibold text-gray-900 mt-2">{stats.managedChannels}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Atividades Recentes</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">{activity.message}</p>
                                        </div>
                                        <span className="text-sm text-gray-500">{activity.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
