'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, CheckCircle2, Clock, AlertCircle, TrendingUp, Users, Briefcase, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
}

interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  startDate: string;
  dueDate: string;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'clients'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const savedClients = localStorage.getItem('clients');
    const savedProjects = localStorage.getItem('projects');

    if (savedClients) setClients(JSON.parse(savedClients));
    if (savedProjects) setProjects(JSON.parse(savedProjects));
  }, []);

  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient = { ...client, id: Date.now().toString() };
    setClients([...clients, newClient]);
    setShowAddClient(false);
  };

  const addProject = (project: Omit<Project, 'id' | 'tasks'>) => {
    const newProject = { ...project, id: Date.now().toString(), tasks: [] };
    setProjects([...projects, newProject]);
    setShowAddProject(false);
  };

  const updateProjectProgress = (projectId: string, progress: number) => {
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, progress } : p
    ));
  };

  const updateProjectStatus = (projectId: string, status: Project['status']) => {
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, status } : p
    ));
  };

  const addTask = (projectId: string, taskTitle: string, dueDate: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskTitle,
      completed: false,
      dueDate
    };

    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p
    ));
  };

  const toggleTask = (projectId: string, taskId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const updatedTasks = p.tasks.map(t =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        const completedTasks = updatedTasks.filter(t => t.completed).length;
        const progress = updatedTasks.length > 0 ? (completedTasks / updatedTasks.length) * 100 : 0;
        return { ...p, tasks: updatedTasks, progress: Math.round(progress) };
      }
      return p;
    }));
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'in-progress').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalClients: clients.length,
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'not-started': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-600';
      case 'medium': return 'bg-orange-100 text-orange-600';
      case 'high': return 'bg-red-100 text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Service Provider Tracker</h1>
              <p className="text-slate-600 mt-1">Manage all your projects and clients in one place</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddClient(true)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2 transition"
              >
                <Plus size={20} />
                Add Client
              </button>
              <button
                onClick={() => setShowAddProject(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
              >
                <Plus size={20} />
                Add Project
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {['dashboard', 'projects', 'clients'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Projects</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalProjects}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Briefcase className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Active Projects</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.activeProjects}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Clock className="text-orange-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.completedProjects}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle2 className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Clients</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalClients}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Projects */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Recent Projects</h2>
              </div>
              <div className="p-6">
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="mx-auto text-slate-300" size={48} />
                    <p className="text-slate-600 mt-4">No projects yet. Create your first project!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.slice(0, 5).map((project) => {
                      const client = clients.find(c => c.id === project.clientId);
                      return (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition cursor-pointer"
                          onClick={() => setSelectedProject(project)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-slate-900">{project.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                {project.status.replace('-', ' ')}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                                {project.priority}
                              </span>
                            </div>
                            <p className="text-slate-600 text-sm mt-1">{client?.name || 'Unknown Client'}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-slate-600">Progress</p>
                              <p className="text-lg font-bold text-slate-900">{project.progress}%</p>
                            </div>
                            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const client = clients.find(c => c.id === project.clientId);
                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition cursor-pointer"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-bold text-lg text-slate-900">{project.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    </div>

                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Client:</span>
                        <span className="font-medium text-slate-900">{client?.name || 'Unknown'}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status.replace('-', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Due:</span>
                        <span className="font-medium text-slate-900">{format(new Date(project.dueDate), 'MMM dd, yyyy')}</span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-600">Progress:</span>
                          <span className="font-bold text-slate-900">{project.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Tasks:</span>
                          <span className="font-medium text-slate-900">
                            {project.tasks.filter(t => t.completed).length}/{project.tasks.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
                <Briefcase className="mx-auto text-slate-300" size={48} />
                <p className="text-slate-600 mt-4">No projects found</p>
              </div>
            )}
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => {
                const clientProjects = projects.filter(p => p.clientId === client.id);
                return (
                  <div
                    key={client.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-lg">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{client.name}</h3>
                        <p className="text-slate-600 text-sm">{client.company}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Email:</span>
                        <span className="text-slate-900">{client.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Phone:</span>
                        <span className="text-slate-900">{client.phone}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                        <span className="text-slate-600">Projects:</span>
                        <span className="font-bold text-slate-900">{clientProjects.length}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {clients.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
                <Users className="mx-auto text-slate-300" size={48} />
                <p className="text-slate-600 mt-4">No clients yet. Add your first client!</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Add New Client</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addClient({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                company: formData.get('company') as string,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    name="company"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddClient(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Add New Project</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addProject({
                clientId: formData.get('clientId') as string,
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                status: 'not-started',
                priority: formData.get('priority') as Project['priority'],
                progress: 0,
                startDate: formData.get('startDate') as string,
                dueDate: formData.get('dueDate') as string,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
                  <select
                    name="clientId"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Project Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddProject(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedProject.title}</h2>
                <p className="text-slate-600 mt-1">{selectedProject.description}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Project Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={selectedProject.status}
                  onChange={(e) => updateProjectStatus(selectedProject.id, e.target.value as Project['status'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Progress</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedProject.progress}
                  onChange={(e) => updateProjectProgress(selectedProject.id, parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center font-bold text-slate-900">{selectedProject.progress}%</div>
              </div>
            </div>

            {/* Tasks */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Tasks</h3>
              <div className="space-y-2 mb-4">
                {selectedProject.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(selectedProject.id, task.id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className={`${task.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-500">Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Task Form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addTask(
                  selectedProject.id,
                  formData.get('taskTitle') as string,
                  formData.get('taskDueDate') as string
                );
                e.currentTarget.reset();
              }}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="taskTitle"
                    placeholder="New task..."
                    required
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    name="taskDueDate"
                    required
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>

            <button
              onClick={() => setSelectedProject(null)}
              className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
