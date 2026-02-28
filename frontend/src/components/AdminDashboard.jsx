import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Trash2, LogOut, Package, Plus, Key, MessageSquare, Users, BarChart3, Bell, ReceiptText, UserCircle } from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('analytics');
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ userCount: 0, orderCount: 0, revenue: 0 });
    const [passRequests, setPassRequests] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: '', brand: '', price: '', oldPrice: '', category: 'Clothing', description: '' });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    // Messaging & Notifications state
    const [selectedUserId, setSelectedUserId] = useState('');
    const [messageContent, setMessageContent] = useState('');
    const [notifContent, setNotifContent] = useState('');
    const [isGlobalNotif, setIsGlobalNotif] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) navigate('/admin/login');
        fetchData();
    }, [navigate, activeTab]);

    useEffect(() => {
        if (activeTab === 'messages' && selectedUserId) {
            fetchChatHistory();
        }
    }, [selectedUserId, activeTab]);

    const fetchData = async () => {
        if (activeTab === 'analytics') fetchStats();
        if (activeTab === 'inventory') fetchProducts();
        if (activeTab === 'orders') fetchOrders();
        if (activeTab === 'passwords') fetchPassRequests();
        if (activeTab === 'messages' || activeTab === 'notifications') fetchUsers();
    };

    const fetchChatHistory = async () => {
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`/api/admin/messages/${selectedUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setChatHistory(data);
        } catch (err) { console.error(err); }
    };

    const fetchStats = async () => {
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setStats(data);
        } catch (err) { console.error(err); }
    };

    const fetchOrders = async () => {
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch('/api/admin/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setOrders(data);
        } catch (err) { console.error(err); }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            setProducts(data);
        } catch (err) { console.error(err); }
    };

    const fetchUsers = async () => {
        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setUsers(data);
        } catch (err) { console.error(err); }
    };

    const fetchPassRequests = async () => {
        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch('/api/admin/password-requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setPassRequests(data);
        } catch (err) { console.error(err); }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const handleSubmitProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        const formData = new FormData();
        formData.append('name', newProduct.name);
        formData.append('brand', newProduct.brand);
        formData.append('price', newProduct.price);
        formData.append('oldPrice', newProduct.oldPrice);
        formData.append('category', newProduct.category);
        formData.append('description', newProduct.description);
        if (image) formData.append('image', image);

        try {
            const response = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            if (response.ok) {
                setNewProduct({ name: '', brand: '', price: '', oldPrice: '', category: 'Clothing', description: '' });
                setImage(null);
                fetchProducts();
                alert('Product added!');
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSendPass = async (userId, password) => {
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch('/api/admin/send-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, password })
            });
            if (res.ok) {
                alert('Password info sent to user!');
                fetchPassRequests();
            }
        } catch (err) { console.error(err); }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!selectedUserId || !messageContent) return;
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch('/api/admin/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: selectedUserId, content: messageContent })
            });
            if (res.ok) {
                alert('Message sent!');
                setMessageContent('');
                fetchChatHistory();
            }
        } catch (err) { console.error(err); }
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        if (!isGlobalNotif && !selectedUserId) return;
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch('/api/admin/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: selectedUserId, content: notifContent, isGlobal: isGlobalNotif })
            });
            if (res.ok) {
                alert('Notification sent!');
                setNotifContent('');
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <aside className="w-64 bg-gray-900 text-white flex flex-col scrollbar-hide">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Package className="text-crimson" /> BrandshopingLTD
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'bg-crimson' : 'hover:bg-gray-800'}`}>
                        <BarChart3 size={18} /> Analytics
                    </button>
                    <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'inventory' ? 'bg-crimson' : 'hover:bg-gray-800'}`}>
                        <Package size={18} /> Inventory
                    </button>
                    <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-crimson' : 'hover:bg-gray-800'}`}>
                        <ReceiptText size={18} /> Purchases
                    </button>
                    <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-crimson' : 'hover:bg-gray-800'}`}>
                        <Bell size={18} /> Notifications
                    </button>
                    <button onClick={() => setActiveTab('messages')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'messages' ? 'bg-crimson' : 'hover:bg-gray-800'}`}>
                        <MessageSquare size={18} /> Chat Support
                    </button>
                    <button onClick={() => setActiveTab('passwords')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'passwords' ? 'bg-crimson' : 'hover:bg-gray-800'}`}>
                        <Key size={18} /> Pass Requests
                    </button>
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition-colors">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-3xl font-black uppercase text-gray-900 tracking-tighter">
                        {activeTab === 'analytics' && 'Platform Analytics'}
                        {activeTab === 'inventory' && 'Inventory Management'}
                        {activeTab === 'orders' && 'Purchase History'}
                        {activeTab === 'notifications' && 'Global Alerts'}
                        {activeTab === 'messages' && 'User Communication'}
                        {activeTab === 'passwords' && 'Password Recovery'}
                    </h2>
                    <p className="text-gray-500 font-medium">Control center for BrandshopingLTD</p>
                </header>

                {activeTab === 'analytics' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <Users className="text-crimson mb-4" size={32} />
                            <h3 className="text-sm font-black uppercase text-gray-400 mb-1">Total Users</h3>
                            <p className="text-4xl font-black">{stats.userCount}</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <ReceiptText className="text-crimson mb-4" size={32} />
                            <h3 className="text-sm font-black uppercase text-gray-400 mb-1">Total Orders</h3>
                            <p className="text-4xl font-black">{stats.orderCount}</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <BarChart3 className="text-crimson mb-4" size={32} />
                            <h3 className="text-sm font-black uppercase text-gray-400 mb-1">Total Revenue</h3>
                            <p className="text-4xl font-black">${stats.revenue.toFixed(2)}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 self-start">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Plus className="text-crimson" /> New Product</h3>
                            <form onSubmit={handleSubmitProduct} className="space-y-4">
                                <input type="text" placeholder="Name" className="w-full px-4 py-2 border rounded-lg" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
                                <input type="text" placeholder="Brand" className="w-full px-4 py-2 border rounded-lg text-sm" value={newProduct.brand} onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })} />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" placeholder="New Price" className="w-full px-4 py-2 border rounded-lg text-sm" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required />
                                    <input type="number" placeholder="Old Price" className="w-full px-4 py-2 border rounded-lg text-sm" value={newProduct.oldPrice} onChange={e => setNewProduct({ ...newProduct, oldPrice: e.target.value })} />
                                </div>
                                <select className="w-full px-4 py-2 border rounded-lg text-sm bg-white" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} required>
                                    {['New Arrivals', 'Clothing', 'Shoes', 'Accessories', 'Home & Gift', 'Gift Cards'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <textarea placeholder="Description" className="w-full px-4 py-2 border rounded-lg h-24 text-sm" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}></textarea>
                                <div className="border-2 border-dashed border-gray-200 p-4 rounded-lg text-center">
                                    <input type="file" id="file-upload" className="hidden" onChange={e => setImage(e.target.files[0])} />
                                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-crimson">
                                        <Upload size={20} />
                                        <span className="text-[10px] font-black uppercase">{image ? image.name : 'Choose local image'}</span>
                                    </label>
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-crimson text-white py-2 rounded-lg font-bold uppercase">{loading ? 'Saving...' : 'Save'}</button>
                            </form>
                        </section>
                        <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr><th className="px-6 py-4 font-bold text-[10px] uppercase">Product</th><th className="px-6 py-4 font-bold text-[10px] uppercase">Category</th><th className="px-6 py-4 font-bold text-[10px] uppercase">Price</th><th className="px-6 py-4 font-bold text-right text-[10px] uppercase">Actions</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.map(p => (
                                        <tr key={p.id}>
                                            <td className="px-6 py-4 flex items-center gap-4">
                                                <img src={`${p.imagePath}`} className="w-12 h-12 object-cover rounded" alt="" />
                                                <span className="font-bold">{p.name}</span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-[10px] uppercase text-gray-400">{p.category}</td>
                                            <td className="px-6 py-4 font-bold">
                                                <span className="text-crimson">${p.price.toFixed(2)}</span>
                                                {p.oldPrice && <span className="ml-2 text-gray-300 line-through text-[10px]">${p.oldPrice.toFixed(2)}</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right"><button className="text-red-400 hover:text-crimson"><Trash2 size={18} /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                        <table className="w-full text-left font-sans">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase">Order ID</th>
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase">Customer</th>
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase">Payment</th>
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase">Amount</th>
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase">Items</th>
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map(o => (
                                    <tr key={o.id} className="text-sm">
                                        <td className="px-6 py-4 font-bold">#{o.id}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold">{o.user?.name}</p>
                                            <p className="text-[10px] text-gray-400">{o.user?.email}</p>
                                        </td>
                                        <td className="px-6 py-4 font-black uppercase text-[10px]">{o.paymentMethod}</td>
                                        <td className="px-6 py-4 font-bold text-crimson">${o.total.toFixed(2)}</td>
                                        <td className="px-6 py-4 max-w-xs truncate text-[10px] font-medium text-gray-500">
                                            {JSON.parse(o.items).map(i => `${i.name} (x${i.quantity})`).join(', ')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[8px] font-black uppercase">{o.status}</span>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && <tr><td colSpan="6" className="p-12 text-center text-gray-400">No purchases recorded yet</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in max-w-2xl mx-auto">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Bell className="text-crimson" /> Official Alerts</h3>
                        <form onSubmit={handleSendNotification} className="space-y-6">
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" checked={isGlobalNotif} onChange={() => { setIsGlobalNotif(true); setSelectedUserId(''); }} className="accent-crimson" />
                                    <span className="text-[10px] font-black uppercase">Send to All Users</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" checked={!isGlobalNotif} onChange={() => setIsGlobalNotif(false)} className="accent-crimson" />
                                    <span className="text-[10px] font-black uppercase">Send to Specific User</span>
                                </label>
                            </div>
                            {!isGlobalNotif && (
                                <select className="w-full px-4 py-3 border rounded-xl bg-white text-sm" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} required>
                                    <option value="">Select Target User</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.generatedUsername})</option>)}
                                </select>
                            )}
                            <textarea placeholder="Notification content..." className="w-full px-4 py-4 border rounded-xl h-40 text-sm focus:border-crimson outline-none" value={notifContent} onChange={e => setNotifContent(e.target.value)} required></textarea>
                            <button type="submit" className="w-full bg-crimson text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-all">Send Official Notification</button>
                        </form>
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Users className="text-crimson" /> Active Chats</h3>
                            <div className="space-y-3">
                                {users.map(u => (
                                    <div key={u.id} onClick={() => setSelectedUserId(u.id)} className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedUserId === u.id.toString() ? 'bg-crimson text-white border-crimson' : 'bg-gray-50 hover:bg-white border-transparent shadow-sm'}`}>
                                        <p className="font-bold">{u.name}</p>
                                        <p className={`text-[10px] uppercase font-medium ${selectedUserId === u.id.toString() ? 'text-white/60' : 'text-gray-400'}`}>{u.generatedUsername}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                        <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
                            {selectedUserId ? (
                                <>
                                    <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
                                        <h3 className="font-bold">Chat with {users.find(u => u.id.toString() === selectedUserId)?.name}</h3>
                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Customer Support Thread</p>
                                    </div>
                                    <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50/30">
                                        {chatHistory.length > 0 ? chatHistory.map(m => (
                                            <div key={m.id} className={`flex ${m.senderId === 0 ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] p-3 rounded-2xl text-xs font-medium ${m.senderId === 0 ? 'bg-black text-white' : 'bg-white shadow-sm border border-gray-100 text-gray-800'}`}>
                                                    <p className="text-[8px] font-black uppercase mb-1 opacity-50">{m.senderId === 0 ? 'Admin' : 'User'}</p>
                                                    {m.content}
                                                </div>
                                            </div>
                                        )) : <p className="text-center text-[10px] text-gray-300 uppercase font-black py-20">No messages yet</p>}
                                    </div>
                                    <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-100 flex gap-4">
                                        <input type="text" placeholder="Type response..." className="flex-1 border rounded-xl px-4 outline-none focus:border-crimson" value={messageContent} onChange={e => setMessageContent(e.target.value)} required />
                                        <button type="submit" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold uppercase text-[10px] hover:bg-crimson transition-all">Reply</button>
                                    </form>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                                    <MessageSquare size={48} className="mb-4" />
                                    <p className="text-sm font-bold uppercase">Select a chat to begin</p>
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {activeTab === 'passwords' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-lg font-bold flex items-center gap-2"><Key className="text-crimson" /> User Credentials & Password Recovery</h3>
                            <p className="text-xs text-gray-400 mt-1">All registered users and their account details. Click "Send via Email" to open your email app with pre-filled credentials.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Name</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Email</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Username</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Password (Hashed)</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {passRequests.map(req => (
                                        <tr key={req.id} className={req.password_request ? 'bg-yellow-50/50' : ''}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <UserCircle className="text-gray-300" size={28} />
                                                    <p className="font-bold text-sm">{req.name || 'No Name'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-600">{req.email}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{req.generatedUsername}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="bg-gray-100 px-3 py-1.5 rounded-lg text-[10px] font-mono text-gray-500 block max-w-[200px] truncate" title={req.password}>{req.password}</code>
                                            </td>
                                            <td className="px-6 py-4">
                                                {req.password_request ? (
                                                    <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-3 py-1 rounded-full uppercase animate-pulse">Reset Requested</span>
                                                ) : (
                                                    <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">Active</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a
                                                        href={`mailto:${req.email}?subject=${encodeURIComponent('BrandshoppingLTD - Your Account Credentials')}&body=${encodeURIComponent(`Dear ${req.name || 'Valued Customer'},\n\nHere are your BrandshoppingLTD account credentials:\n\nEmail: ${req.email}\nUsername: ${req.generatedUsername}\nPassword: Your password is securely stored. Please use the "Forgot Password" feature on our website to reset it.\n\nIf you did not request this information, please ignore this email.\n\nBest regards,\nBrandshoppingLTD Support Team`)}`}
                                                        className="bg-crimson text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-black transition-all inline-flex items-center gap-2"
                                                    >
                                                        📧 Send via Email
                                                    </a>
                                                    {req.password_request && (
                                                        <button
                                                            onClick={() => handleSendPass(req.id, req.password)}
                                                            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-green-600 transition-all"
                                                        >
                                                            ✓ Mark Resolved
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {passRequests.length === 0 && <tr><td colSpan="6" className="p-12 text-center text-gray-400 text-sm font-medium">No registered users found</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
