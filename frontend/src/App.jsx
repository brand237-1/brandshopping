import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ShoppingBag, Search as SearchIcon, Heart, ChevronLeft, ChevronRight, Menu, X, ArrowRight, User as UserIcon, LogOut, Package, MessageSquare, CreditCard, Wallet, Smartphone, Bell, Send, Banknote, Globe, Building2, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import debounce from 'lodash.debounce';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

// --- CONTEXTS ---
const AuthContext = createContext();
const CartContext = createContext();
const ToastContext = createContext();

export const useAuth = () => useContext(AuthContext);
export const useCart = () => useContext(CartContext);
export const useToast = () => useContext(ToastContext);

// --- TOAST NOTIFICATION SYSTEM ---
const toastStyles = {
  success: { bg: 'bg-black', border: 'border-green-500/30', icon: <CheckCircle size={18} className="text-green-400" />, accent: 'bg-green-500' },
  error: { bg: 'bg-black', border: 'border-red-500/30', icon: <XCircle size={18} className="text-red-400" />, accent: 'bg-red-500' },
  info: { bg: 'bg-black', border: 'border-blue-500/30', icon: <Info size={18} className="text-blue-400" />, accent: 'bg-blue-500' },
  warning: { bg: 'bg-black', border: 'border-yellow-500/30', icon: <AlertCircle size={18} className="text-yellow-400" />, accent: 'bg-yellow-500' },
};

const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed top-6 right-6 z-[300] flex flex-col gap-3 pointer-events-none">
    <AnimatePresence>
      {toasts.map(toast => {
        const style = toastStyles[toast.type] || toastStyles.info;
        return (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`pointer-events-auto ${style.bg} text-white rounded-2xl shadow-2xl border ${style.border} overflow-hidden min-w-[320px] max-w-[420px] backdrop-blur-xl`}
          >
            <div className={`h-1 ${style.accent}`}>
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                className={`h-full ${style.accent}`}
              />
            </div>
            <div className="p-4 flex items-start gap-3">
              <span className="mt-0.5 shrink-0">{style.icon}</span>
              <div className="flex-1 min-w-0">
                {toast.title && <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-white/70">{toast.title}</p>}
                <p className="text-xs font-medium leading-relaxed">{toast.message}</p>
              </div>
              <button onClick={() => removeToast(toast.id)} className="text-white/40 hover:text-white transition-colors shrink-0">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', title = null, duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, title, duration }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const Marquee = ({ text, bg = "bg-black", textColor = "text-white", speed = 20 }) => (
  <div className={`${bg} ${textColor} overflow-hidden whitespace-nowrap py-2 uppercase font-black text-[10px] tracking-[0.3em] flex border-y border-white/5`}>
    <motion.div
      animate={{ x: [0, "-50%"] }}
      transition={{ repeat: Infinity, duration: speed, ease: "linear" }}
      className="flex flex-nowrap"
    >
      {[...Array(10)].map((_, i) => (
        <span key={i} className="px-12 whitespace-nowrap">{text}</span>
      ))}
    </motion.div>
  </div>
);

const PromoBar = () => (
  <Marquee
    text="✨ FREE SHIPPING ON ORDERS OVER $200 • 🛍️ EXCLUSIVE DESIGNER PIECES • 💖 LIMITED DROPS WEEKLY • 👑 BRANDSHOPINGLTD SIGNATURE • 🌿 SUSTAINABLY CRAFTED •"
    bg="bg-pink-accent"
    textColor="text-deep-crimson"
  />
);

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);

  const fetchSuggestions = useCallback(
    debounce((q) => {
      if (!q) return setSuggestions([]);
      fetch(`${API_BASE_URL}/api/search?q=${q}`)
        .then(res => res.json())
        .then(data => setSuggestions(data));
    }, 300),
    []
  );

  useEffect(() => {
    fetchSuggestions(query);
  }, [query, fetchSuggestions]);

  return (
    <div className="relative flex-1 max-w-md hidden lg:block">
      <div className="flex items-center border-b border-gray-200 py-2">
        <SearchIcon className="w-4 h-4 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="SEARCH EXCLUSIVE COLLECTION..."
          className="w-full bg-transparent outline-none text-[10px] font-bold uppercase tracking-widest"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShow(true); }}
          onFocus={() => setShow(true)}
        />
      </div>
      <AnimatePresence>
        {show && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 w-full bg-white shadow-2xl mt-2 rounded-lg overflow-hidden z-50 border border-gray-100"
          >
            {suggestions.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0" onClick={() => setShow(false)}>
                <img src={`${API_BASE_URL || ''}${p.imagePath}`} className="w-10 h-10 object-cover rounded" alt="" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-tight">{p.name}</p>
                  <p className="text-[10px] text-crimson font-bold">${p.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const location = useLocation();

  const items = [
    { name: '✨ New Arrivals', path: '/collection/New Arrivals' },
    { name: '🧥 Clothing', path: '/collection/Clothing' },
    { name: '👠 Shoes', path: '/collection/Shoes' },
    { name: '💍 Accessories', path: '/collection/Accessories' },
    { name: '🏠 Home & Gift', path: '/collection/Home & Gift' },
    { name: '💳 Gift Cards', path: '/collection/Gift Cards' }
  ];

  const adminItem = { name: '👑 Admin Vault', path: '/admin/login' };

  return (
    <nav className="glass sticky top-0 z-40 border-b border-white/20 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-8">
        <div className="flex items-center gap-4 md:gap-8">
          <button
            className="md:hidden text-brand-black p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/" className="flex items-center gap-2 group transition-all" onClick={() => setIsOpen(false)}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-deep-crimson rounded-lg md:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-lg md:text-xl italic">B</span>
            </div>
            <div className="flex flex-col -gap-1">
              <span className="text-base md:text-xl font-black tracking-tighter uppercase leading-none">Brandshoping✨</span>
              <span className="text-[6px] md:text-[8px] font-bold tracking-[0.4em] uppercase opacity-50 ml-0.5">Limited Luxury</span>
            </div>
          </Link>

          <div className="hidden md:flex gap-6 items-center">
            {items.map(item => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-[10px] font-bold uppercase tracking-widest hover:text-deep-crimson transition-all whitespace-nowrap ${location.pathname === item.path ? 'text-deep-crimson decoration-2 underline underline-offset-4' : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <SearchBar />

        <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 border-r border-gray-100 pr-3 mr-1">
                <Link to="/profile" className="flex items-center gap-1 hover:text-deep-crimson transition-colors">
                  <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-[10px] font-black uppercase hidden lg:block tracking-tighter">{user.username}</span>
                </Link>
                <button onClick={logout} className="hover:text-deep-crimson transition-all" aria-label="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 border-r border-gray-100 pr-4 mr-1">
                <Link to="/login" className="text-[10px] font-black uppercase tracking-widest hover:text-deep-crimson transition-colors">Login</Link>
                <Link to="/signup" className="text-[10px] font-black uppercase tracking-widest hover:text-deep-crimson transition-colors">Join</Link>
              </div>
            )}
          </div>

          <Link to="/profile" className="relative cursor-pointer group p-2 rounded-full hover:bg-black/5 transition-colors">
            <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 group-hover:text-deep-crimson transition-colors" />
            <span className="absolute top-0 right-0 bg-deep-crimson text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow-lg">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100 overflow-hidden shadow-2xl"
          >
            <div className="container-mobile py-8 flex flex-col gap-1">
              {items.map((item, idx) => (
                <motion.div
                  key={item.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    to={item.path}
                    className={`block py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-between group ${location.pathname === item.path ? 'bg-pink-accent text-deep-crimson shadow-sm' : 'hover:bg-off-white'}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </motion.div>
              ))}

              <div className="h-[1px] bg-gray-50 my-4 mx-6" />

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: items.length * 0.05 }}
              >
                <Link
                  to="/profile"
                  className="block py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-off-white flex items-center justify-between"
                  onClick={() => setIsOpen(false)}
                >
                  <span>👤 My Essence (Profile)</span>
                  <ArrowRight size={14} />
                </Link>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: (items.length + 1) * 0.05 }}
              >
                <Link
                  to={adminItem.path}
                  className="mt-4 block py-5 px-6 rounded-3xl bg-brand-black text-white text-xs font-black uppercase tracking-[0.3em] text-center shadow-xl shadow-black/20 group"
                  onClick={() => setIsOpen(false)}
                >
                  {adminItem.name} ✨
                </Link>
              </motion.div>

              {user && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="mt-8 text-[9px] font-black uppercase tracking-widest text-brand-gray/40 text-center w-full hover:text-deep-crimson transition-colors"
                >
                  Sign Out of Sanctuary
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const HeroCarousel = () => {
  const slides = [
    { image: "/pictures/posts/luxury-silk-dress.png", title: "Refined Silk Collection", category: "NEW ARRIVALS" },
    { image: "/pictures/posts/designer-wool-coat.png", title: "Autumn Outerwear", category: "SEASONAL EDIT" },
    { image: "/pictures/posts/luxury-accessories-set.png", title: "Essential Details", category: "ACCESSORIES" }
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx(s => (s + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-[70vh] md:h-[90vh] overflow-hidden bg-brand-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-black/20 to-brand-black/40 z-10" />
          <motion.img
            src={slides[idx].image}
            className="w-full h-full object-cover animate-slow-zoom"
            alt=""
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-white/80 font-bold tracking-[0.5em] text-[8px] md:text-[10px] uppercase mb-4"
            >
              {slides[idx].category} ✨
            </motion.p>
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="text-white text-4xl sm:text-6xl md:text-9xl font-black tracking-tighter serif mb-8 leading-[0.9]"
            >
              {slides[idx].title.split(' ').map((word, i) => (
                <span key={i} className="block last:text-deep-crimson italic">{word}</span>
              ))}
            </motion.h1>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <Link
                to="/collection/New Arrivals"
                className="group relative inline-flex items-center gap-4 bg-white text-brand-black px-8 md:px-10 py-4 md:py-5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-deep-crimson hover:text-white transition-all overflow-hidden shadow-2xl"
              >
                <span className="relative z-10 flex items-center gap-2 text-brand-black group-hover:text-white">Explore Drop 🛍️ <ArrowRight size={16} /></span>
                <div className="absolute inset-0 bg-white group-hover:bg-deep-crimson transition-colors" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-2 md:gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`h-1 transition-all duration-500 rounded-full ${i === idx ? 'w-8 md:w-12 bg-white' : 'w-2 md:w-4 bg-white/30 hover:bg-white/50'}`}
          />
        ))}
      </div>
    </section>
  );
};

const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const imgUrl = product.imagePath?.startsWith('http') ? product.imagePath : `${API_BASE_URL || ''}${product.imagePath}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative flex flex-col cursor-pointer bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-50 h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => user ? navigate(`/product/${product.id}`) : navigate('/login')}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase text-brand-black shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-deep-crimson animate-pulse" /> ✨ NEW DROP
          </span>
        </div>

        <button className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-brand-gray/40 hover:text-deep-crimson transition-colors shadow-sm active:scale-90">
          <Heart size={14} />
        </button>

        <motion.img
          src={imgUrl}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          alt={product.name}
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800"; }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-4 right-4 z-20"
            >
              <button className="w-full bg-brand-black/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-xl shadow-2xl hover:bg-deep-crimson transition-colors border border-white/10">
                View & Buy 🛍️
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 md:p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray/60">{product.brand || 'Elite Luxury'}</p>
          <div className="flex gap-1 text-deep-crimson">
            {[...Array(5)].map((_, i) => <span key={i} className="text-[8px]">★</span>)}
          </div>
        </div>

        <h4 className="font-black serif italic text-lg md:text-xl mb-3 tracking-tight group-hover:text-deep-crimson transition-colors">{product.name}</h4>

        <div className="mt-auto flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-xl md:text-2xl font-black tracking-tighter text-brand-black">${product.price.toFixed(2)}</p>
            <p className="text-[8px] font-bold text-brand-gray/40 uppercase tracking-widest">Available in {product.colors ? JSON.parse(product.colors).length : 2} Shades 🌈</p>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            className="w-10 h-10 rounded-xl bg-off-white hover:bg-deep-crimson hover:text-white transition-all duration-300 flex items-center justify-center shadow-inner group/btn"
          >
            <ShoppingBag size={16} className="group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- CHAT WIDGET ---
const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to BrandshopingLTD! How can we assist your style journey today?", sender: 'bot' }
  ]);

  const faqs = [
    { q: "Where is my order?", a: "Estimated shipping is 3-5 business days. Check 'My Orders' in your profile for tracking!" },
    { q: "How do returns work?", a: "Returns are accepted within 30 days. Unworn items with tags only! $7 fee applies." },
    { q: "Do you ship to my country?", a: "Currently, we offer exclusive shipping within the United States." },
    { q: "Talk to a Human", a: "I've alerted the Admin. They will message you directly in your profile soon!" }
  ];

  const handleFaq = (faq) => {
    setMessages([...messages, { id: Date.now(), text: faq.q, sender: 'user' }, { id: Date.now() + 1, text: faq.a, sender: 'bot' }]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const token = localStorage.getItem('userToken');
    if (!token) {
      setMessages([...messages, { id: Date.now(), text: inputMessage, sender: 'user' }, { id: Date.now() + 1, text: "Please sign in to send messages directly to our team.", sender: 'bot' }]);
      setInputMessage('');
      return;
    }

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: inputMessage })
      });
      if (res.ok) {
        setMessages([...messages, { id: Date.now(), text: inputMessage, sender: 'user' }, { id: Date.now() + 1, text: "Message sent! Our team will reply shortly in your profile.", sender: 'bot' }]);
        setInputMessage('');
      }
    } catch (err) { console.error(err); }
  };

  return (
    <>
      <button
        className="fixed bottom-8 right-8 bg-crimson text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-end p-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="bg-white w-[350px] h-[550px] rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden border border-gray-100"
            >
              <div className="bg-black text-white p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest">BrandshopingLTD Support</h3>
                  <p className="text-[8px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online & Ready to help
                  </p>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-[10px] font-medium leading-relaxed ${m.sender === 'user' ? 'bg-black text-white' : 'bg-white text-gray-800 shadow-sm border border-gray-100'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex flex-wrap gap-2 mb-4">
                  {faqs.map((faq, i) => (
                    <button key={i} onClick={() => handleFaq(faq)} className="text-[8px] font-bold uppercase tracking-tighter bg-gray-50 hover:bg-gray-100 px-2 py-1.5 rounded-full border border-gray-100 transition-all">
                      {faq.q}
                    </button>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-50 border-none outline-none px-4 py-3 rounded-xl text-[10px] font-medium"
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                  />
                  <button type="submit" className="bg-crimson text-white p-3 rounded-xl hover:bg-black transition-colors">
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const Footer = ({ onOpenPolicy }) => (
  <footer className="bg-white border-t border-gray-100 pt-20 pb-10 mt-20">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest mb-6">Customer Care</h4>
        <ul className="space-y-3 text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
          <li><button onClick={() => onOpenPolicy('returns')} className="hover:text-black transition-colors">Returns & Exchanges</button></li>
          <li><button onClick={() => onOpenPolicy('shipping')} className="hover:text-black transition-colors">Shipping Information</button></li>
          <li><button onClick={() => onOpenPolicy('status')} className="hover:text-black transition-colors">Order Status</button></li>
          <li><button onClick={() => onOpenPolicy('faq')} className="hover:text-black transition-colors">FAQ</button></li>
        </ul>
      </div>
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest mb-6">Information</h4>
        <ul className="space-y-3 text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
          <li><button onClick={() => onOpenPolicy('about')} className="hover:text-black transition-colors">About Us</button></li>
          <li><button onClick={() => onOpenPolicy('sustainability')} className="hover:text-black transition-colors">Sustainability</button></li>
          <li><button onClick={() => onOpenPolicy('privacy')} className="hover:text-black transition-colors">Privacy Policy</button></li>
          <li><button onClick={() => onOpenPolicy('terms')} className="hover:text-black transition-colors">Terms of Service</button></li>
        </ul>
      </div>
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest mb-6">Contact</h4>
        <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-tighter">
          123 Fashion Ave, Suite 500<br />
          New York, NY 10001<br />
          support@brandshoppingltd.com<br />
          Mon-Fri, 9 AM - 6 PM EST
        </p>
      </div>
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest mb-6">Newsletter</h4>
        <p className="text-[10px] text-gray-500 mb-4 font-bold uppercase tracking-tighter">Get 10% OFF your first order when you subscribe.</p>
        <div className="flex border-b border-black py-2">
          <input type="email" placeholder="kingkenzy237@gmail.com" className="bg-transparent border-none outline-none text-[10px] font-bold uppercase w-full" />
          <button
            onClick={() => { alert('Thank you for joining our exclusive list! 📧👗'); }}
            className="text-crimson font-black text-[10px] uppercase hover:tracking-widest transition-all"
          >
            Join
          </button>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 mt-20 text-[10px] text-gray-400 font-bold uppercase tracking-widest flex justify-between">
      <span>© 2026 BrandshopingLTD</span>
      <div className="flex gap-6">
        <a href="#">Instagram</a>
        <a href="#">X</a>
        <a href="#">Spotify</a>
      </div>
    </div>
  </footer>
);

const InfoModal = ({ type, onClose }) => {
  const content = {
    returns: {
      title: "Returns & Exchanges Policy",
      text: "At BrandshopingLTD, we want you to love your fit. If you aren't 100% satisfied, you can return or exchange any unworn, unwashed clothing with original tags attached within 30 days of delivery.\n\nExchanges: Free of charge for a different size or color.\nReturns: A flat $7 shipping fee will be deducted from your refund.\nNon-returnable: Intimates, bodysuits, and final sale items."
    },
    shipping: {
      title: "Shipping Information",
      text: "Domestic Shipping:\nStandard (3-5 business days): FREE on all orders over $200. For orders under $200, a flat rate of $9.95 applies.\nExpress (1-2 business days): $25.00 flat rate.\n\nProcessing: Orders are processed Monday–Friday. Orders placed after 2 PM EST will ship the following business day."
    },
    status: {
      title: "Order Status",
      text: "Once your order ships, you will receive an email with a tracking number. You can also track your order directly in your BrandshopingLTD account dashboard under 'My Orders.' If your status says 'Pending,' we are currently preparing your items for shipment."
    },
    faq: {
      title: "FAQ",
      text: "Do you ship internationally? Currently, we only ship within the United States.\n\nCan I change my order? We process orders quickly, but if you email us within 1 hour of placing the order, we will do our best to assist.\n\nWhat sizes do you carry? We offer a curated range from XS to XL. Check our specific size guides on each product page."
    },
    about: {
      title: "About Us",
      text: "BrandshopingLTD is a premier destination for exclusive, high-end fashion. Founded in the heart of New York City, we believe that clothing is more than just fabric—it's an identity. We curate limited-run collections from emerging and established designers to ensure you always stand out from the crowd."
    },
    sustainability: {
      title: "Sustainability",
      text: "We are committed to a 'Quality Over Quantity' philosophy. BrandshopingLTD partners with manufacturers who prioritize ethical labor practices and sustainable materials. By creating timeless pieces that last for years, we aim to reduce the environmental impact of fast fashion."
    },
    privacy: {
      title: "Privacy Policy",
      text: "Your privacy is our priority. We collect information (email, address, and payment details) solely to process your orders and improve your shopping experience. We never sell your data to third parties. All transactions are encrypted via Stripe for maximum security."
    },
    terms: {
      title: "Terms of Service",
      text: "By using BrandshopingLTD.com, you agree to our terms of use. All content, images, and logos are the property of BrandshopingLTD. We reserve the right to cancel orders due to pricing errors or stock unavailability."
    }
  };

  const active = content[type];
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-xl p-10 md:p-16 rounded-sm shadow-2xl overflow-y-auto max-h-[80vh]"
      >
        <button onClick={onClose} className="absolute top-6 right-6 hover:rotate-90 transition-transform"><X /></button>
        <h3 className="text-4xl font-black uppercase tracking-tighter mb-8">{active.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">{active.text}</p>
        <button onClick={onClose} className="mt-12 w-full bg-black text-white py-4 font-black uppercase tracking-widest text-[10px] hover:bg-crimson transition-all">Close</button>
      </motion.div>
    </div>
  );
};

const CollectionPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const token = localStorage.getItem('userToken');
    fetch(`/api/products?category=${category}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, [category, user]);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <Helmet>
        <title>{category} | BrandshopingLTD</title>
      </Helmet>
      <div className="mb-12">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-crimson mb-2 block">Collection</span>
        <h2 className="text-5xl font-black uppercase tracking-tighter italic">{category}</h2>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 animate-pulse">
          {[1, 2, 3, 4].map(n => <div key={n} className="aspect-[3/4] bg-gray-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 gap-y-16">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
      {products.length === 0 && !loading && <p className="text-center py-20 text-gray-400 uppercase font-bold text-[10px] tracking-widest">No items found in this collection.</p>}
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('userToken');
    fetch(`${API_BASE_URL}/api/products/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        const initialImg = data.imagePath.startsWith('http') ? data.imagePath : `${API_BASE_URL || ''}${data.imagePath}`;
        setActiveImage(initialImg);
        setLoading(false);
      });
  }, [id, user]);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user]);

  if (!user) return null;

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-40 text-center animate-pulse uppercase font-black tracking-widest text-[10px]">Loading Essence...</div>;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-40 text-center uppercase font-black tracking-widest text-[10px]">Product Vanished</div>;

  const gallery = product.gallery ? JSON.parse(product.gallery) : [];
  const hasGallery = gallery.length > 0;
  const sizes = product.sizes ? JSON.parse(product.sizes) : [];
  const colors = product.colors ? JSON.parse(product.colors) : [];

  const handleAdd = () => {
    if (sizes.length > 0 && !selectedSize) {
      if (window.__showToast) window.__showToast('Please select a size to continue.', 'warning', 'Size Required');
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      if (window.__showToast) window.__showToast('Please select a color choice.', 'warning', 'Color Required');
      return;
    }
    addToCart(product, selectedSize, selectedColor);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 animate-slide-up">
      <Helmet>
        <title>{product.name} | BrandshopingLTD✨</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <Link to="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] mb-12 hover:text-deep-crimson transition-all group">
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Collection 🛍️
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        <div className="space-y-8">
          <div className="relative group overflow-hidden bg-off-white rounded-[2.5rem] aspect-[4/5] shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={activeImage}
                alt={product.name}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute top-8 right-8">
              <button className="w-12 h-12 bg-white/80 backdrop-blur-xl rounded-full flex items-center justify-center text-deep-crimson shadow-xl hover:scale-110 transition-transform">
                <Heart size={20} />
              </button>
            </div>
          </div>
          {hasGallery && (
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {gallery.map((img, idx) => {
                const url = img.startsWith('http') ? img : `${API_BASE_URL || ''}${img}`;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveImage(url)}
                    className={`relative w-28 h-28 rounded-3xl overflow-hidden flex-shrink-0 border-2 transition-all shadow-md ${activeImage === url ? 'border-deep-crimson shadow-deep-crimson/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={url} className="w-full h-full object-cover" alt="" />
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-deep-crimson font-black text-[10px] tracking-[0.5em] uppercase mb-6 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-deep-crimson" /> {product.brand || 'Luxury Signature'} ✨
          </span>
          <h1 className="text-6xl md:text-8xl font-black serif tracking-tight mb-8 leading-[0.8] italic">{product.name}</h1>

          <div className="flex items-center gap-8 mb-12">
            <p className="text-5xl font-black tracking-tighter text-deep-crimson bg-pink-accent px-6 py-2 rounded-2xl shadow-sm italic">
              ${product.price ? Number(product.price).toFixed(2) : '0.00'}
            </p>
            {product.oldPrice && (
              <p className="text-2xl text-brand-gray line-through font-bold opacity-40 italic">
                ${Number(product.oldPrice).toFixed(2)}
              </p>
            )}
          </div>

          <p className="text-brand-gray text-lg leading-relaxed mb-16 font-medium max-w-lg italic opacity-80 serif">
            "{product.description || 'A timeless masterpiece crafted with precision and elegance for the modern individual who seeks perfection in every detail.'}"
          </p>

          <div className="space-y-12 mb-16 max-w-md">
            {sizes.length > 0 && (
              <div>
                <div className="flex justify-between items-end mb-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Select Essence & Size</h4>
                  <span className="text-[10px] font-bold text-deep-crimson italic">{selectedSize || 'Required'}</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-[10px] font-black uppercase transition-all shadow-sm ${selectedSize === s ? 'border-deep-crimson bg-deep-crimson text-white shadow-deep-crimson/30 scale-110' : 'border-gray-100 bg-white hover:border-deep-crimson hover:text-deep-crimson'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleAdd}
              className="w-full bg-brand-black text-white py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs hover:bg-deep-crimson transition-all active:scale-[0.95] duration-500 shadow-2xl flex items-center justify-center gap-3 overflow-hidden group"
            >
              <ShoppingBag size={20} className="group-hover:rotate-12 transition-transform" />
              <span>Add to Bag {(!selectedSize && sizes.length > 0) ? '— Select Size ✨' : 'Now 🛍️'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-12 border-t border-gray-100">
            <div className="flex flex-col gap-2">
              <span className="text-deep-crimson text-xl">✨</span>
              <p className="text-[10px] font-black uppercase tracking-widest">Designer Craft</p>
              <p className="text-[9px] font-medium text-brand-gray opacity-60">Superior materials only</p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-deep-crimson text-xl">🌿</span>
              <p className="text-[10px] font-black uppercase tracking-widest">Sustainably Made</p>
              <p className="text-[9px] font-medium text-brand-gray opacity-60">Ethically sourced pieces</p>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-48 bg-off-white rounded-[3rem] p-16 md:p-24 shadow-inner">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-deep-crimson font-black text-[10px] tracking-[0.5em] uppercase mb-8 block">The Philosophy ✨</span>
          <h3 className="text-4xl md:text-6xl font-black serif italic tracking-tight mb-12 leading-tight">"Clothing is the primary identity of the soul, rendered in silk and light."</h3>
          <div className="w-24 h-[1px] bg-deep-crimson/30 mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-left">
            <p className="text-lg text-brand-gray leading-relaxed font-medium italic opacity-80 serif">
              At BrandshopingLTD, we believe every stitch tells a story of ambition and grace. Our pieces are curated for the visionaries who see fashion not as a trend, but as a timeless legacy.
            </p>
            <p className="text-lg text-brand-gray leading-relaxed font-medium italic opacity-80 serif">
              Sustainability isn't a feature; it's our foundational promise. We work exclusively with artisans who honor the planet as much as the craft, ensuring luxury that feels as good as it looks.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- LOADING SCREEN ---
const LoadingScreen = () => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1, ease: "easeInOut" }}
    className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
      className="mb-8"
    >
      <img src="/logo.png" alt="BrandshopingLTD" className="h-20 w-auto invert" />
    </motion.div>
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="text-center"
    >
      <h1 className="text-white text-2xl font-black uppercase tracking-[0.5em] mb-2 italic">BrandshopingLTD</h1>
      <p className="text-crimson text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Curating Perfection...</p>
    </motion.div>
    <motion.div
      className="absolute bottom-20 w-48 h-[1px] bg-white/10 overflow-hidden"
    >
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-full h-full bg-crimson shadow-[0_0_10px_#d00000]"
      />
    </motion.div>
  </motion.div>
);

// --- REVIEW SECTION ---
const ReviewSection = () => {
  const reviews = [
    { id: 1, name: "Sophia R.", rating: 5, text: "The quality of the Fallon Dress is unmatched. I felt like a queen at the gala! BrandshoppingLTD is my new go-to for luxury pieces.", date: "Feb 12, 2026" },
    { id: 2, name: "Marcus T.", rating: 5, text: "Finally, a store that understands modern masculine elegance. The peacoat fits perfectly and the material is premium.", date: "Jan 28, 2026" },
    { id: 3, name: "Elena V.", rating: 4, text: "Stunning designs and ethical production. The shipping was fast, and the packaging was as beautiful as the blouse itself.", date: "Feb 05, 2026" },
    { id: 4, name: "James L.", rating: 5, text: "Incredible attention to detail. Every piece tells a story. Looking forward to the next limited drop!", date: "Feb 20, 2026" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 border-t border-gray-100">
      <div className="text-center mb-16">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-crimson mb-2 block">Client Voices</span>
        <h2 className="text-4xl font-black uppercase tracking-tighter">Customer Reviews</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {reviews.map(r => (
          <div key={r.id} className="bg-gray-50 p-6 rounded-sm border border-transparent hover:border-crimson/10 transition-all group">
            <div className="flex gap-1 mb-4">
              {[...Array(r.rating)].map((_, i) => <span key={i} className="text-crimson text-xs">★</span>)}
              {[...Array(5 - r.rating)].map((_, i) => <span key={i} className="text-gray-200 text-xs">★</span>)}
            </div>
            <p className="text-[11px] font-medium leading-relaxed italic text-gray-600 mb-6 font-serif">"{r.text}"</p>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest pt-4 border-t border-gray-100">
              <span className="text-black">{r.name}</span>
              <span className="text-gray-300">{r.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LeaveReviewPage = () => {
  const [formData, setFormData] = useState({ name: '', rating: 5, review: '' });
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('hasDiscount', 'true');
    setSubmitted(true);
    // Toast notification handled by context - using window.__showToast for simplicity
    if (window.__showToast) window.__showToast('Thank you for your voice! Your 10% discount has been activated in your bag! 🎁✨', 'success', 'Reward Unlocked', 5000);
    setTimeout(() => navigate('/profile'), 2000);
  };

  return (
    <div className="max-w-md mx-auto my-20 px-4 text-center">
      <Helmet><title>Leave a Review | BrandshopingLTD</title></Helmet>
      {!submitted ? (
        <>
          <h2 className="text-4xl font-black uppercase mb-4 tracking-tighter">Share Your Experience</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-12">Leave a review to unlock your exclusive 10% OFF reward.</p>
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest block mb-2">Display Name</label>
              <input type="text" className="w-full border-b border-black py-3 outline-none focus:border-crimson" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest block mb-2">Rating</label>
              <select className="w-full border-b border-black py-3 outline-none focus:border-crimson bg-transparent" value={formData.rating} onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })}>
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars {n === 5 ? ' - Perfect' : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest block mb-2">Review</label>
              <textarea className="w-full border border-black p-4 outline-none focus:border-crimson h-32 resize-none text-sm font-medium" value={formData.review} onChange={e => setFormData({ ...formData, review: e.target.value })} required placeholder="Tell us how it feels..." />
            </div>
            <button type="submit" className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-crimson transition-colors">Submit & Reveal Reward</button>
          </form>
        </>
      ) : (
        <div className="py-20 animate-bounce">
          <h2 className="text-6xl font-black text-crimson mb-4">REWARD UNLOCKED</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Redirecting to your Shopping Bag...</p>
        </div>
      )}
    </div>
  );
};

// --- MAIN PAGES ---

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  const handleRestrictedClick = (e, path) => {
    if (!user) {
      e.preventDefault();
      navigate('/login');
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-2 border-deep-crimson border-t-transparent rounded-full animate-spin" />
      <span className="font-black uppercase tracking-[0.3em] text-[10px] text-deep-crimson animate-pulse">Curating Selection✨</span>
    </div>
  );

  return (
    <div className="animate-slide-up">
      <Helmet>
        <title>BrandshopingLTD | Exclusive Clothing & Designer Dresses✨</title>
        <meta name="description" content="Shop the latest exclusive clothing, designer dresses, and fashion accessories at BrandshopingLTD. Premium quality for the modern wardrobe." />
      </Helmet>
      <HeroCarousel />

      <main className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center mb-16 md:mb-24">
          <span className="text-deep-crimson font-black text-[8px] md:text-[10px] tracking-[0.5em] uppercase mb-4">The Selection ✨</span>
          <h2 className="text-4xl md:text-7xl font-black serif tracking-tight mb-8 leading-[0.8] italic">Editor's Pick</h2>
          <div className="w-16 md:w-20 h-1 bg-deep-crimson rounded-full" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-x-8 gap-y-12 md:gap-y-16">
          {products.slice(0, 8).map(product => (
            <ProductCard key={product.id} product={{ ...product, isNew: true }} />
          ))}
        </div>

        <div className="mt-24 md:mt-40 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <motion.div
            whileHover={{ y: -10 }}
            className="relative h-[500px] md:h-[700px] group overflow-hidden rounded-[2rem] md:rounded-[2.5rem] cursor-pointer shadow-2xl"
            onClick={(e) => handleRestrictedClick(e, '/collection/Clothing')}
          >
            <img src="/pictures/posts/luxury-silk-dress.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]" alt="" />
            <div className="absolute inset-0 bg-brand-black/40 group-hover:bg-brand-black/30 transition-colors flex flex-col justify-end p-8 md:p-12 text-white">
              <span className="font-bold tracking-[0.5em] text-[8px] md:text-[10px] uppercase mb-4">Exclusive Drop 🛍️</span>
              <h3 className="text-4xl md:text-5xl font-black serif italic mb-4 md:6 leading-none">Evening <br /> Elegance</h3>
              <p className="text-xs md:text-sm font-medium text-white/80 max-w-sm mb-8 md:mb-10 leading-relaxed">Discover our hand-picked selection of evening wear crafted from the finest premium silks.</p>
              <button className="bg-white text-brand-black px-10 md:px-12 py-4 md:py-5 rounded-full font-black text-[8px] md:text-[10px] uppercase tracking-widest w-fit hover:bg-deep-crimson hover:text-white transition-all shadow-2xl">Shop Edit ✨</button>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -10 }}
            className="relative h-[500px] md:h-[700px] group overflow-hidden rounded-[2rem] md:rounded-[2.5rem] cursor-pointer shadow-2xl md:mt-24"
            onClick={(e) => handleRestrictedClick(e, '/collection/Accessories')}
          >
            <img src="/pictures/posts/designer-wool-coat.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]" alt="" />
            <div className="absolute inset-0 bg-brand-black/40 group-hover:bg-brand-black/30 transition-colors flex flex-col justify-end p-8 md:p-12 text-white">
              <span className="font-bold tracking-[0.5em] text-[8px] md:text-[10px] uppercase mb-4">Modern Classic 🌿</span>
              <h3 className="text-4xl md:text-5xl font-black serif italic mb-4 md:mb-6 leading-none">Timeless <br /> Layers</h3>
              <p className="text-xs md:text-sm font-medium text-white/80 max-w-sm mb-8 md:mb-10 leading-relaxed">Explore luxury outerwear designed for both warmth and effortless everyday sophistication.</p>
              <button className="bg-white text-brand-black px-10 md:px-12 py-4 md:py-5 rounded-full font-black text-[8px] md:text-[10px] uppercase tracking-widest w-fit hover:bg-deep-crimson hover:text-white transition-all shadow-2xl">View Collection 🛍️</button>
            </div>
          </motion.div>
        </div>

        <section className="mt-40 border-t border-gray-100 pt-24">
          <div className="flex flex-wrap justify-between gap-12 text-center uppercase tracking-[0.4em] text-[8px] font-bold">
            <div className="flex flex-col items-center gap-4 flex-1 min-w-[200px]">
              <div className="w-12 h-12 bg-pink-accent rounded-2xl flex items-center justify-center text-deep-crimson">🌿</div>
              <div><p className="mb-2 text-deep-crimson">Quality First</p><p className="opacity-40">Luxury craftsmanship in every stitch</p></div>
            </div>
            <div className="flex flex-col items-center gap-4 flex-1 min-w-[200px]">
              <div className="w-12 h-12 bg-pink-accent rounded-2xl flex items-center justify-center text-deep-crimson">🔒</div>
              <div><p className="mb-2 text-deep-crimson">Secure Checkout</p><p className="opacity-40">100% Encrypted transactions</p></div>
            </div>
            <div className="flex flex-col items-center gap-4 flex-1 min-w-[200px]">
              <div className="w-12 h-12 bg-pink-accent rounded-2xl flex items-center justify-center text-deep-crimson">🌎</div>
              <div><p className="mb-2 text-deep-crimson">Global Access</p><p className="opacity-40">Express worldwide shipping</p></div>
            </div>
          </div>
        </section>
      </main>

      <ReviewSection />

      <Link
        to="/leave-review"
        onClick={(e) => handleRestrictedClick(e, '/leave-review')}
        className="fixed bottom-8 left-8 bg-brand-black text-white px-8 py-5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-deep-crimson transition-all z-50 flex items-center gap-3 active:scale-95 duration-500 group"
      >
        <span className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-colors">🎁</span>
        <span>Claim 10% OFF Reward</span>
      </Link>
    </div>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleForgot = async () => {
    if (!email) { if (window.__showToast) window.__showToast('Please enter your email address first.', 'warning', 'Email Required'); return; }
    const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (res.ok) { if (window.__showToast) window.__showToast('Password reset request sent to admin.', 'info', 'Request Sent'); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-slide-up">
      <div className="w-full max-w-md bg-white p-12 rounded-[2.5rem] soft-shadow border border-gray-100">
        <div className="text-center mb-12">
          <span className="text-deep-crimson font-black text-[10px] tracking-[0.5em] uppercase mb-4 block">Welcome Back ✨</span>
          <h2 className="text-5xl font-black serif italic tracking-tighter">Sign In</h2>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); login(email, password).then(s => s && navigate('/profile')); }} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-gray/60 block ml-1">Email Address</label>
            <input type="email" className="w-full bg-off-white border-none rounded-2xl p-4 outline-none focus:ring-2 ring-deep-crimson/20 transition-all font-medium text-sm" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-gray/60 block ml-1">Password</label>
            <input type="password" className="w-full bg-off-white border-none rounded-2xl p-4 outline-none focus:ring-2 ring-deep-crimson/20 transition-all font-medium text-sm" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="text-right">
            <button type="button" onClick={handleForgot} className="text-[10px] font-black uppercase text-brand-gray/40 hover:text-deep-crimson transition-colors">Forgot Essence?</button>
          </div>
          <button type="submit" className="w-full bg-brand-black text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-deep-crimson transition-all shadow-xl active:scale-[0.98]">Enter the Club 🛍️</button>
        </form>
        <p className="mt-12 text-center text-[10px] font-black uppercase tracking-widest text-brand-gray/40">
          New member? <Link to="/signup" className="text-deep-crimson hover:underline">Join the Elite 🕊️</Link>
        </p>
      </div>
    </div>
  );
};

const SignupPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { signup } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-slide-up">
      <div className="w-full max-w-md bg-white p-12 rounded-[2.5rem] soft-shadow border border-gray-100">
        <div className="text-center mb-12">
          <span className="text-deep-crimson font-black text-[10px] tracking-[0.5em] uppercase mb-4 block">New Identity ✨</span>
          <h2 className="text-5xl font-black serif italic tracking-tighter">Join the Club</h2>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); signup(formData.email, formData.password, formData.name).then(s => s && navigate('/profile')); }} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-gray/60 block ml-1">Full Name</label>
            <input type="text" className="w-full bg-off-white border-none rounded-2xl p-4 outline-none focus:ring-2 ring-deep-crimson/20 transition-all font-medium text-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-gray/60 block ml-1">Email Address</label>
            <input type="email" className="w-full bg-off-white border-none rounded-2xl p-4 outline-none focus:ring-2 ring-deep-crimson/20 transition-all font-medium text-sm" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-gray/60 block ml-1">Secure Password</label>
            <input type="password" className="w-full bg-off-white border-none rounded-2xl p-4 outline-none focus:ring-2 ring-deep-crimson/20 transition-all font-medium text-sm" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
          </div>
          <button type="submit" className="w-full bg-brand-black text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-deep-crimson transition-all shadow-xl active:scale-[0.98]">Create Account 🛍️</button>
        </form>
        <p className="mt-12 text-center text-[10px] font-black uppercase tracking-widest text-brand-gray/40">
          Already a member? <Link to="/login" className="text-deep-crimson hover:underline">Sign In 🕊️</Link>
        </p>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const { cart, removeFromCart, placeOrder } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', bio: '', address: '' });
  const [orderAddress, setOrderAddress] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
    else {
      setProfileForm({ name: user.name || '', bio: user.bio || '', address: user.address || '' });
      setOrderAddress(user.address || '');
    }
  }, [user]);

  if (!user) return null;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('userToken');
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(profileForm)
    });
    if (res.ok) {
      const data = await res.json();
      setUser({ ...user, ...data.user });
      setIsEditing(false);
      if (window.__showToast) window.__showToast('Your profile has been updated successfully!', 'success', 'Profile Updated ✨');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 animate-slide-up">
      <Helmet>
        <title>BrandshopingLTD | Your Essence - {user.name || user.username}✨</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <span className="text-deep-crimson font-black text-[10px] tracking-[0.5em] uppercase mb-4 block">Private Member ✨</span>
          <h2 className="text-4xl md:text-7xl font-black serif italic tracking-tight leading-none">Your Sanctuary</h2>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-brand-gray/40">
          <span className="w-12 h-[1px] bg-gray-200" />
          <span>Membership ID: #{user.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-1 space-y-12">
          <div className="bg-white p-10 rounded-[2.5rem] soft-shadow border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-accent/30 rounded-full -mr-16 -mt-16 blur-3xl" />

            <div className="relative z-10">
              <div className="w-20 h-20 bg-pink-accent rounded-[2rem] flex items-center justify-center text-deep-crimson mb-8 group-hover:scale-110 transition-transform duration-500">
                <UserIcon size={32} />
              </div>

              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-3xl font-black serif italic mb-2 tracking-tight">{user.name || 'Elite Member'}</h3>
                  <p className="text-[10px] font-black text-brand-gray/40 uppercase tracking-widest">{user.username}</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-[8px] font-black uppercase text-deep-crimson border border-deep-crimson/20 px-5 py-2 rounded-full hover:bg-deep-crimson hover:text-white transition-all shadow-sm"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-6 pt-6 border-t border-gray-50/50">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-brand-gray/40 ml-1">Full Name</label>
                    <input type="text" className="w-full bg-off-white/50 border-none rounded-xl p-3 text-xs outline-none focus:ring-2 ring-deep-crimson/10 font-medium" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-brand-gray/40 ml-1">Personal Bio</label>
                    <textarea className="w-full bg-off-white/50 border-none rounded-xl p-3 text-xs outline-none focus:ring-2 ring-deep-crimson/10 h-24 resize-none font-medium" value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-brand-gray/40 ml-1">Primary Address</label>
                    <input type="text" className="w-full bg-off-white/50 border-none rounded-xl p-3 text-xs outline-none focus:ring-2 ring-deep-crimson/10 font-medium" value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-brand-black text-white py-4 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-deep-crimson transition-all">Save Essence ✨</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-brand-gray/60 hover:text-brand-black transition-colors">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="pt-8 border-t border-gray-50/50 space-y-6">
                  <p className="text-sm text-brand-gray/70 leading-relaxed font-medium italic serif">
                    "{user.bio || 'Luxury enthusiast. Fashion explorer. Seeking the extraordinary in every stitch.'}"
                  </p>
                  {user.address && (
                    <div className="flex items-center gap-3 text-[10px] text-brand-gray/60 font-bold uppercase tracking-tight bg-off-white/50 p-4 rounded-2xl border border-gray-50">
                      <span className="text-deep-crimson text-sm">📍</span> <span>{user.address}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-brand-black text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-deep-crimson via-pink-accent to-deep-crimson opacity-50" />

            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
              <Bell className="text-deep-crimson" size={16} /> Curated Alerts ✨
            </h3>

            <div className="space-y-6 mb-12 pb-12 border-b border-white/5">
              {user.notifications && user.notifications.length > 0 ? user.notifications.map(n => (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={n.id} className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                  <p className="text-sm font-medium leading-relaxed opacity-90">{n.content}</p>
                  <p className="text-[8px] text-deep-crimson mt-3 font-black uppercase tracking-widest">{new Date(n.createdAt).toLocaleDateString()}</p>
                </motion.div>
              )) : (
                <p className="text-[9px] text-white/20 uppercase font-black tracking-widest italic py-4">No official alerts at this moment.</p>
              )}
            </div>

            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
              <MessageSquare className="text-deep-crimson" size={16} /> Personal Concierge
            </h3>
            <div className="space-y-6">
              {user.messages && user.messages.length > 0 ? user.messages.slice(0, 3).map(m => (
                <div key={m.id} className={`p-5 rounded-2xl border transition-all ${m.senderId === 0 ? 'bg-deep-crimson/10 border-deep-crimson/20' : 'bg-white/5 border-transparent opacity-60'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[8px] text-deep-crimson font-black uppercase tracking-widest">{m.senderId === 0 ? 'Signature Concierge' : 'You'}</span>
                    <span className="text-[7px] text-white/20 uppercase font-bold">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-80">{m.content}</p>
                </div>
              )) : (
                <p className="text-[9px] text-white/20 uppercase font-black tracking-widest italic py-4">Direct message history is empty.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center gap-4 mb-12">
            <h3 className="text-3xl font-black serif italic tracking-tight">Shopping Bag</h3>
            <div className="flex-1 h-[1px] bg-gray-100" />
            <span className="text-[10px] font-black uppercase tracking-widest text-deep-crimson bg-pink-accent px-4 py-2 rounded-full shadow-sm">{cart.length} Pieces</span>
          </div>

          <div className="space-y-10">
            {cart.map(item => (
              <motion.div layout key={item.cartId || item.id} className="flex gap-10 group items-center bg-white p-6 rounded-[2rem] border border-transparent hover:border-gray-100 transition-all hover:shadow-xl hover:shadow-black/[0.02]">
                <div className="relative w-32 h-40 overflow-hidden rounded-2xl shadow-lg">
                  <img src={item.imagePath.startsWith('http') ? item.imagePath : `${API_BASE_URL || ''}${item.imagePath}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <span className="text-[9px] font-black uppercase text-deep-crimson tracking-[0.3em] mb-2">{item.brand || 'Luxury Edit'} ✨</span>
                  <h4 className="font-black serif italic text-xl mb-4 group-hover:text-deep-crimson transition-colors">{item.name}</h4>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {item.selectedSize && <span className="text-[8px] font-black uppercase bg-off-white text-brand-gray/60 px-4 py-1.5 rounded-full border border-gray-100">Size: {item.selectedSize}</span>}
                    {item.selectedColor && <span className="text-[8px] font-black uppercase bg-off-white text-brand-gray/60 px-4 py-1.5 rounded-full border border-gray-100">Choice: {item.selectedColor}</span>}
                  </div>
                  <div className="flex items-baseline gap-4">
                    <p className="text-2xl font-black tracking-tighter">${item.price.toFixed(2)}</p>
                    <span className="text-[10px] font-bold text-brand-gray/30 uppercase">qty: {item.quantity}</span>
                  </div>
                </div>

                <button onClick={() => removeFromCart(item.cartId || item.id)} className="w-12 h-12 rounded-full bg-off-white text-brand-gray/20 hover:bg-deep-crimson hover:text-white hover:rotate-90 transition-all flex items-center justify-center shadow-inner">
                  <X size={20} />
                </button>
              </motion.div>
            ))}

            {cart.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-12 space-y-10">
                <div className="bg-brand-black text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-deep-crimson/20 rounded-full -mr-32 -mt-32 blur-3xl" />

                  <div className="relative z-10">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.5em] mb-10 flex items-center gap-4">
                      Delivery Sanctuary <span className="flex-1 h-[1px] bg-white/10" />
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-deep-crimson block ml-1">Destination Address 📍</label>
                        <input
                          type="text"
                          className="w-full bg-white/10 border border-white/10 p-5 rounded-2xl text-sm outline-none focus:bg-white/20 transition-all font-medium placeholder:text-white/20"
                          placeholder="Penthouse, Street, City Elite"
                          value={orderAddress}
                          onChange={e => setOrderAddress(e.target.value)}
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-deep-crimson block ml-1">Payment Signature 💳</label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'card', label: 'Credit Card' },
                            { id: 'paypal', label: 'PayPal 💖' },
                            { id: 'apple', label: 'Apple Pay' },
                            { id: 'bank', label: 'Transfer 🏛️' }
                          ].map(m => (
                            <button
                              key={m.id}
                              onClick={() => setPaymentMethod(m.id)}
                              className={`p-4 rounded-2xl border transition-all text-[9px] font-black uppercase tracking-widest ${paymentMethod === m.id ? 'bg-white text-brand-black border-white shadow-xl' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-pink-accent/20 p-12 rounded-[3rem] border border-pink-accent/30 flex flex-col md:flex-row justify-between items-center gap-10">
                  <div className="space-y-2 text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-deep-crimson mb-4">Final Essence Report 🛍️</p>
                    {localStorage.getItem('hasDiscount') === 'true' && (
                      <div className="flex items-center gap-3 text-deep-crimson font-black serif italic text-lg animate-pulse">
                        <span>🎁</span> 10% Member Reward Active
                      </div>
                    )}
                  </div>

                  <div className="text-center md:text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Grand Total</p>
                    {localStorage.getItem('hasDiscount') === 'true' ? (
                      <div className="space-y-1">
                        <p className="text-lg text-deep-crimson/30 line-through font-black serif italic">
                          ${cart.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}
                        </p>
                        <p className="text-6xl font-black serif italic tracking-tighter text-deep-crimson transform hover:scale-105 transition-transform">
                          ${(cart.reduce((sum, i) => sum + (i.price * i.quantity), 0) * 0.9).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-6xl font-black serif italic tracking-tighter text-brand-black transform hover:scale-105 transition-transform">
                        ${cart.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!orderAddress) { if (window.__showToast) window.__showToast('Please provide a delivery path', 'warning', 'Address Missing'); return; }
                    if (!paymentMethod) { if (window.__showToast) window.__showToast('Please select a payment signature', 'warning', 'Payment Required'); return; }
                    placeOrder(paymentMethod, orderAddress).then(() => {
                      if (window.__showToast) {
                        window.__showToast('Your order has been etched into our records! Concierge will reach out.', 'success', 'Order Confirmed 🛍️', 6000);
                      }
                    });
                  }}
                  className="w-full bg-brand-black text-white py-10 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-sm hover:bg-deep-crimson transition-all shadow-2xl active:scale-[0.98] duration-500 overflow-hidden group relative"
                >
                  <span className="relative z-10">Finalize Signature Drop {localStorage.getItem('hasDiscount') === 'true' && '- 10% Applied!'}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2s]" />
                </button>
              </motion.div>
            )}
            {cart.length === 0 && (
              <div className="bg-off-white py-32 rounded-[3rem] text-center border-2 border-dashed border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-gray/30 mb-8">Your sanctuary bag is void ✨</p>
                <Link to="/" className="inline-block bg-brand-black text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-deep-crimson transition-all shadow-xl">Explore Drops 🛍️</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- APP CORE ---
function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [appLoading, setAppLoading] = useState(true);
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  // Bridge toast to window for global access
  const { showToast } = useToast();
  useEffect(() => {
    window.__showToast = showToast;
    return () => { delete window.__showToast; };
  }, [showToast]);

  useEffect(() => {
    // Version check for debugging
    fetch(`${API_BASE_URL}/api/health`)
      .then(res => res.json())
      .then(d => console.log('%c[BACKEND VERSION]', 'color: #ff0055; font-weight: bold;', d.version))
      .catch(() => console.error('[BACKEND VERSION] Could not reach server'));

    // Artificial delay for premium feel
    const timer = setTimeout(() => setAppLoading(false), 2500);

    const token = localStorage.getItem('userToken');
    if (token) {
      fetch(`${API_BASE_URL}/api/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(async data => {
          if (data.user) {
            const nRes = await fetch(`${API_BASE_URL}/api/notifications`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (nRes.ok) {
              const nData = await nRes.json();
              setUser({ ...data.user, notifications: nData });
            } else {
              setUser({ ...data.user, notifications: [] });
            }
            setCart(data.user.cart || []);
          }
        });
    }
    return () => clearTimeout(timer);
  }, []);

  const signup = async (email, password, name) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('userToken', data.token);
        setUser(data.user);
        if (window.__showToast) window.__showToast(`Welcome, ${data.user.name}! Your account has been created.`, 'success', 'Account Created');
        return true;
      }
      else { if (window.__showToast) window.__showToast(data.message || 'Error creating account', 'error', 'Signup Failed'); }
    } catch (err) {
      if (window.__showToast) window.__showToast('Network error. Please try again.', 'error', 'Connection Error');
    }
    return false;
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('userToken', data.token);
        setUser(data.user);
        setCart(data.user.cart || []);
        if (window.__showToast) window.__showToast(`Welcome back, ${data.user.name}!`, 'success', 'Login Successful');
        return true;
      }
      else { if (window.__showToast) window.__showToast(data.message || 'Invalid email or password', 'error', 'Login Failed'); }
    } catch (err) {
      if (window.__showToast) window.__showToast('Network error. Please try again.', 'error', 'Connection Error');
    }
    return false;
  };

  const logout = () => { localStorage.removeItem('userToken'); setUser(null); setCart([]); };

  const addToCart = (product, selectedSize = null, selectedColor = null) => {
    const cartId = `${product.id}-${selectedSize || 'nosize'}-${selectedColor || 'nocolor'}`;
    const updated = [...cart];
    const idx = updated.findIndex(i => (i.cartId === cartId) || (i.id === product.id && !i.selectedSize && !i.selectedColor));

    if (idx > -1) {
      updated[idx].quantity += 1;
    } else {
      updated.push({ ...product, cartId, selectedSize, selectedColor, quantity: 1 });
    }

    setCart(updated);
    if (window.__showToast) window.__showToast(`${product.name}${selectedSize ? ` (${selectedSize})` : ''} added to your shopping bag!`, 'success', 'Added to Bag 🛍️');
    if (user) syncCart(updated);
  };

  const removeFromCart = (cartId) => {
    const updated = cart.filter(i => (i.cartId || i.id) !== cartId);
    setCart(updated);
    if (user) syncCart(updated);
  };

  const syncCart = (newCart) => {
    const token = localStorage.getItem('userToken');
    fetch(`${API_BASE_URL}/api/cart`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ cart: newCart })
    });
  };

  const placeOrder = async (payMethod, address) => {
    const token = localStorage.getItem('userToken');
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ paymentMethod: payMethod, cart, total, address })
    });
    if (res.ok) { setCart([]); syncCart([]); return true; }
    return false;
  };

  const [activePolicy, setActivePolicy] = useState(null);

  return (
    <HelmetProvider>
      <AuthContext.Provider value={{ user, login, logout, signup, setUser }}>
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, placeOrder }}>
          <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-crimson selection:text-white">
            <AnimatePresence>
              {appLoading && <LoadingScreen />}
            </AnimatePresence>
            {!isAdminPage && <PromoBar />}
            {!isAdminPage && <Navbar />}
            {!isAdminPage && <Marquee text="NEW SEASON ARRIVALS • SHOP THE LATEST TRENDS • LUXURY ESSENTIALS • PREMIUM QUALITY GUARANTEED •" bg="bg-crimson" speed={30} />}
            <div className="pt-0">
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/collection/:category" element={<CollectionPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/leave-review" element={<LeaveReviewPage />} />
                </Routes>
              </AnimatePresence>
            </div>
            {!isAdminPage && <Footer onOpenPolicy={setActivePolicy} />}
            {activePolicy && <InfoModal type={activePolicy} onClose={() => setActivePolicy(null)} />}
            {!isAdminPage && <LiveChat />}
          </div>
        </CartContext.Provider>
      </AuthContext.Provider>
    </HelmetProvider>
  );
}

const AppWrapper = () => (
  <ToastProvider>
    <Router>
      <App />
    </Router>
  </ToastProvider>
);

export default AppWrapper;
