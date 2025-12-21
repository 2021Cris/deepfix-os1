import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layout, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Search, 
  Settings, 
  Bell, 
  ChevronRight,
  Target,
  BarChart3,
  Sun,
  Moon
} from 'lucide-react';

const App = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Design new landing page', completed: false, priority: 'High', category: 'Work' },
    { id: 2, text: 'Review team feedback', completed: true, priority: 'Medium', category: 'Work' },
    { id: 3, text: 'Buy groceries', completed: false, priority: 'Low', category: 'Personal' },
  ]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('All');
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Local storage simulation (State based for this environment)
  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const task = {
      id: Date.now(),
      text: newTask,
      completed: false,
      priority: 'Medium',
      category: 'General'
    };
    setTasks([task, ...tasks]);
    setNewTask('');
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesFilter = filter === 'All' || 
                           (filter === 'Active' && !task.completed) || 
                           (filter === 'Completed' && task.completed);
      const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, searchQuery]);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-900'}`}>
      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <aside className={`fixed left-0 top-0 h-full w-20 md:w-64 border-r transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} hidden sm:flex flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Layout className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl hidden md:block">NexusFlow</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          {['Dashboard', 'Tasks', 'Schedule', 'Analytics', 'Settings'].map((item) => (
            <button
              key={item}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                item === 'Tasks' 
                  ? 'bg-indigo-600/10 text-indigo-600' 
                  : `hover:${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`
              }`}
            >
              {item === 'Dashboard' && <Layout size={20} />}
              {item === 'Tasks' && <CheckCircle2 size={20} />}
              {item === 'Schedule' && <Calendar size={20} />}
              {item === 'Analytics' && <BarChart3 size={20} />}
              {item === 'Settings' && <Settings size={20} />}
              <span className="hidden md:block font-medium">{item}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="sm:ml-20 md:ml-64 p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Good Morning!</h1>
            <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Here's what's happening with your projects today.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} hover:shadow-md transition-all`}
            >
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
            </button>
            <div className="relative group">
              <Bell size={20} className="cursor-pointer" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full border-2 border-white shadow-sm overflow-hidden">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Tasks', value: stats.total, icon: Layout, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' }
          ].map((stat, i) => (
            <div key={i} className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} p-3 rounded-xl`}>
                  <stat.icon className={`${stat.color} w-6 h-6`} />
                </div>
                <span className="text-sm font-medium text-slate-400">+12% vs last week</span>
              </div>
              <h3 className="text-sm font-medium text-slate-400">{stat.label}</h3>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tasks Section */}
        <div className={`rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-sm overflow-hidden`}>
          <div className="p-6 border-b border-inherit flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">Tasks</h2>
              <div className="flex bg-gray-100 p-1 rounded-lg dark:bg-slate-700">
                {['All', 'Active', 'Completed'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                      filter === f 
                        ? 'bg-white shadow-sm text-indigo-600 dark:bg-slate-600 dark:text-indigo-400' 
                        : 'text-slate-500'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-xl border w-full md:w-64 focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                  darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
                }`}
              />
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={addTask} className="flex gap-2 mb-6">
              <input 
                type="text" 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a new task..."
                className={`flex-1 px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                  darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
                }`}
              />
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Add Task</span>
              </button>
            </form>

            <div className="space-y-3">
              {filteredTasks.length > 0 ? filteredTasks.map(task => (
                <div 
                  key={task.id}
                  className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${
                    darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                  } hover:shadow-md`}
                >
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className={`transition-colors ${task.completed ? 'text-green-500' : 'text-slate-400 hover:text-indigo-500'}`}
                    >
                      {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </button>
                    <div>
                      <span className={`text-sm md:text-base font-medium transition-all ${task.completed ? 'line-through text-slate-400' : ''}`}>
                        {task.text}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          task.priority === 'High' ? 'bg-red-100 text-red-600' :
                          task.priority === 'Medium' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{task.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-gray-200">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <Target className="mx-auto text-slate-300 mb-4" size={48} />
                  <p className="text-slate-500">No tasks found. Time to relax or start something new!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className={`sm:hidden fixed bottom-0 left-0 right-0 border-t flex justify-around p-4 ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <Layout className="text-indigo-600" />
        <CheckCircle2 className="text-slate-400" />
        <Calendar className="text-slate-400" />
        <Settings className="text-slate-400" />
      </nav>
    </div>
  );
};

export default App;
