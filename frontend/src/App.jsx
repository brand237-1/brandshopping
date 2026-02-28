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
  <Marquee text="FREE SHIPPING ON ORDERS OVER $200 • EXCLUSIVE DESIGNER PIECES • LIMITED DROPS WEEKLY • BRANDSHOPINGLTD SIGNATURE •" />
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
  const items = ['New Arrivals', 'Clothing', 'Shoes', 'Accessories', 'Home & Gift', 'Gift Cards'];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="BrandshopingLTD" className="h-10 w-auto" />
            <span className="text-xl font-black tracking-tighter uppercase hidden xl:block">BrandshopingLTD</span>
          </Link>
          <div className="hidden md:flex gap-4">
            {items.map(item => (
              <Link key={item} to={`/collection/${item}`} className="text-[10px] font-black uppercase tracking-tight hover:text-crimson transition-colors whitespace-nowrap">{item}</Link>
            ))}
          </div>
        </div>

        <SearchBar />

        <div className="flex items-center gap-4 flex-shrink-0">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-1 hover:text-crimson transition-colors">
                <UserIcon className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase hidden lg:block">{user.username}</span>
              </Link>
              <button onClick={logout} className="hover:text-crimson transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/admin/login" className="bg-black text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest hover:bg-crimson transition-colors">VIP</Link>
              <Link to="/login" className="text-[10px] font-black uppercase tracking-widest hover:text-crimson">Login</Link>
              <span className="text-gray-300">|</span>
              <Link to="/signup" className="text-[10px] font-black uppercase tracking-widest hover:text-crimson">Join</Link>
            </div>
          )}
          <Link to="/profile" className="relative cursor-pointer group">
            <ShoppingBag className="w-5 h-5 group-hover:text-crimson" />
            <span className="absolute -top-2 -right-2 bg-crimson text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </Link>
        </div>
      </div>
      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 w-full bg-white shadow-xl p-6 md:hidden z-50 flex flex-col gap-4"
          >
            {items.map(item => (
              <Link key={item} to={`/collection/${item}`} className="text-lg font-bold uppercase" onClick={() => setIsOpen(false)}>{item}</Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const HeroCarousel = () => {
  const images = [
    "/pictures/posts/luxury-silk-dress.png",
    "/pictures/posts/designer-wool-coat.png",
    "/pictures/posts/luxury-accessories-set.png"
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(s => (s + 1) % images.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[600px] w-full overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={images[current]}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.6, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase mb-6"
        >
          Signature Style
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl font-medium tracking-wide mb-8 opacity-80"
        >
          Discover our new Spring/Summer collection curated for elegance.
        </motion.p>
        <Link
          to="/collection/New Arrivals"
          onClick={(e) => {
            if (!user) {
              e.preventDefault();
              navigate('/login');
            }
          }}
          className="bg-crimson text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:shadow-[0_0_20px_rgba(208,0,0,0.5)] transition-all"
        >
          Shop Now
        </Link>
      </div>
      <button onClick={() => setCurrent(s => (s - 1 + images.length) % images.length)} className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-full border border-white/30 text-white hover:bg-white/10 transition-colors">
        <ChevronLeft size={32} />
      </button>
      <button onClick={() => setCurrent(s => (s + 1) % images.length)} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-full border border-white/30 text-white hover:bg-white/10 transition-colors">
        <ChevronRight size={32} />
      </button>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const imagePath = product.imagePath || '';
  const imgUrl = imagePath.startsWith('http') ? imagePath : `${API_BASE_URL || ''}${imagePath}`;

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": imgUrl,
    "description": product.description,
    "brand": { "@type": "Brand", "name": product.brand || 'BrandshoppingLTD' },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": product.price,
      "priceValidUntil": "2026-12-31",
      "availability": "https://schema.org/InStock"
    }
  };

  const sizes = product.sizes ? JSON.parse(product.sizes) : [];

  return (
    <div
      className="group relative flex flex-col cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        if (!user) {
          navigate('/login');
        } else {
          navigate(`/product/${product.id}`);
        }
      }}
    >
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      <Link to={`/product/${product.id}`} className="relative aspect-[3/4] bg-gray-100 overflow-hidden rounded-sm block">
        <img
          src={imgUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800"; }}
        />
        <button className="absolute top-4 right-4 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <Heart size={18} className="text-gray-900" />
        </button>
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="absolute inset-x-0 bottom-0 p-6 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center text-center"
            >
              <div className="flex gap-2 mb-4">
                {sizes.slice(0, 4).map(s => (
                  <span key={s} className="w-8 h-8 rounded-full border border-gray-100 text-[8px] font-black flex items-center justify-center bg-gray-50">{s}</span>
                ))}
                {sizes.length > 4 && <span className="text-[8px] font-black text-gray-400">+{sizes.length - 4} More</span>}
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-crimson">Select Essence & Size</p>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>
      <div className="mt-4 text-center">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1 font-bold">{product.brand || 'Luxury Store'}</p>
        <Link to={`/product/${product.id}`} className="text-xs font-black uppercase tracking-tight group-hover:text-crimson transition-colors block">{product.name}</Link>
        <div className="flex items-center justify-center gap-2 mt-1">
          <p className="text-sm font-bold text-crimson">${product.price.toFixed(2)}</p>
          {product.oldPrice && <p className="text-[10px] text-gray-300 line-through font-bold">${product.oldPrice.toFixed(2)}</p>}
        </div>
      </div>
    </div>
  );
};

// --- CHAT WIDGET ---
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
    <div className="max-w-7xl mx-auto px-4 py-20">
      <Helmet>
        <title>{product.name} | BrandshopingLTD</title>
        <meta name="description" content={product.description} />
      </Helmet>
      <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-12 hover:text-crimson transition-colors">
        <ChevronLeft size={14} /> Back to Catalog
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-6">
          <div className="relative group overflow-hidden bg-gray-50 rounded-sm aspect-[4/5]">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={activeImage}
                alt={product.name}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: "circOut" }}
                className="w-full h-full object-cover rounded shadow-2xl"
              />
            </AnimatePresence>
          </div>
          {hasGallery && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {gallery.map((img, idx) => {
                const url = img.startsWith('http') ? img : `${API_BASE_URL || ''}${img}`;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveImage(url)}
                    className={`relative w-24 h-24 rounded-sm overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === url ? 'border-crimson' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={url} className="w-full h-full object-cover" alt={`${product.name} variation ${idx}`} />
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-crimson mb-4">{product.brand || 'Luxury Signature'}</span>
          <h1 className="text-6xl font-black uppercase tracking-tighter mb-6 leading-[0.9]">{product.name}</h1>
          <div className="flex items-end gap-6 mb-10">
            <p className="text-4xl font-bold tracking-tighter">${product.price.toFixed(2)}</p>
            {product.oldPrice && <p className="text-xl text-gray-300 line-through font-bold pb-1">${product.oldPrice.toFixed(2)}</p>}
          </div>
          <p className="text-gray-500 text-sm leading-relaxed mb-12 font-medium max-w-lg italic">
            "{product.description || 'A timeless masterpiece crafted with precision and elegance for the modern individual.'}"
          </p>
          <div className="space-y-10 mb-12 max-w-md">
            {sizes.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex justify-between">
                  Select Size <span>{selectedSize ? `(${selectedSize})` : '(Required)'}</span>
                </h4>
                <div className="flex flex-wrap gap-3">
                  {sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[48px] h-12 rounded-sm border-2 flex items-center justify-center text-[10px] font-black uppercase tracking-tighter transition-all ${selectedSize === s ? 'border-black bg-black text-white' : 'border-gray-100 bg-white hover:border-black'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex justify-between">
                  Select Color <span>{selectedColor ? `(${selectedColor})` : '(Required)'}</span>
                </h4>
                <div className="flex flex-wrap gap-3">
                  {colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 h-12 rounded-sm border-2 flex items-center justify-center text-[10px] font-black uppercase tracking-tighter transition-all ${selectedColor === c ? 'border-black bg-black text-white' : 'border-gray-100 bg-white hover:border-black'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleAdd}
              className="w-full bg-black text-white py-6 font-black uppercase tracking-[0.2em] text-xs hover:bg-crimson transition-all active:scale-[0.98] duration-300 shadow-xl"
            >
              Add to Bag {!selectedSize && !selectedColor ? '— Select Essence' : ''}
            </button>
          </div>
          <div className="space-y-4 pt-10 border-t border-gray-100">
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">The Promise</h4>
            <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <div className="flex items-center gap-2"><span>✨</span> Premium Craftsmanship</div>
              <div className="flex items-center gap-2"><span>🌍</span> Sustainable Luxury</div>
              <div className="flex items-center gap-2"><span>🛡️</span> 2-Year Warranty</div>
              <div className="flex items-center gap-2"><span>📦</span> Priority Express</div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-40 border-t border-gray-100 pt-20">
        <h3 className="text-3xl font-black uppercase tracking-tighter mb-12">The Philosophy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          <p className="text-sm text-gray-500 leading-relaxed font-medium italic">
            Every piece at BrandshopingLTD is more than just fabric—it's an identity. Hand-selected for those who dare to stand out, this items represents the pinnacle of modern luxury aesthetics.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed font-medium italic">
            Sustainability is stitched into every seam. We partner with local manufacturers to ensure that your style doesn't come at the cost of the planet or people.
          </p>
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Helmet>
        <title>BrandshopingLTD | Exclusive Clothing & Designer Dresses</title>
        <meta name="description" content="Shop the latest exclusive clothing, designer dresses, and fashion accessories at BrandshopingLTD. Premium quality for the modern wardrobe." />
      </Helmet>
      <HeroCarousel />
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-crimson mb-2 block">Curated Selection</span>
            <h2 className="text-4xl font-black uppercase tracking-tighter">Featured Collection</h2>
          </div>
          <Link
            to="/collection/Clothing"
            onClick={(e) => handleRestrictedClick(e, '/collection/Clothing')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group border-b border-black pb-1"
          >
            Shop All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="animate-pulse flex flex-col gap-4">
                <div className="aspect-[3/4] bg-gray-100 rounded-sm"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4 self-center"></div>
                <div className="h-3 bg-gray-100 rounded w-1/4 self-center"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 gap-y-16">
            {products.length > 0 ? products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />) : <p className="col-span-full text-center py-20 text-gray-400 uppercase font-black tracking-widest text-[10px]">Curating your next favorite piece...</p>}
          </div>
        )}
      </div>

      <section className="bg-gray-50 py-20 mt-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center uppercase tracking-widest text-[10px] font-black">
          <div><p className="mb-2 text-crimson">Quality Guarantee</p><p className="text-gray-400">Exquisite craftsmanship in every stitch</p></div>
          <div><p className="mb-2 text-crimson">Secure Payment</p><p className="text-gray-400">100% Encrypted transactions</p></div>
          <div><p className="mb-2 text-crimson">Global Delivery</p><p className="text-gray-400">Express worldwide shipping</p></div>
        </div>
      </section>

      <ReviewSection />

      <Link
        to="/leave-review"
        onClick={(e) => handleRestrictedClick(e, '/leave-review')}
        className="fixed bottom-8 left-8 bg-black text-white px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-crimson transition-colors z-50 flex items-center gap-3 active:scale-95 duration-300"
      >
        <span className="bg-white/20 p-1.5 rounded-full">🎁</span> Get 10% Off
      </Link>
    </motion.div>
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
    if (res.ok) { if (window.__showToast) window.__showToast('Password reset request sent to admin. Please check your email for instructions.', 'info', 'Request Sent'); }
    else { if (window.__showToast) window.__showToast('Failed to send password reset request.', 'error', 'Request Failed'); }
  };

  return (
    <div className="max-w-md mx-auto my-20 px-4">
      <h2 className="text-4xl font-black uppercase mb-8 tracking-tighter">Sign In</h2>
      <form onSubmit={(e) => { e.preventDefault(); login(email, password).then(s => s && navigate('/profile')); }} className="space-y-6">
        <input type="email" placeholder="Email Address" className="w-full border-b border-black py-3 outline-none focus:border-crimson" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="w-full border-b border-black py-3 outline-none focus:border-crimson" value={password} onChange={e => setPassword(e.target.value)} required />
        <div className="text-right">
          <button type="button" onClick={handleForgot} className="text-[10px] font-black uppercase text-gray-400 hover:text-black">Forgot Password?</button>
        </div>
        <button type="submit" className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-crimson transition-colors">Sign In</button>
      </form>
      <p className="mt-8 text-[10px] font-black uppercase tracking-widest">New member? <Link to="/signup" className="text-crimson">Join Us</Link></p>
    </div>
  );
};

const SignupPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { signup } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto my-20 px-4">
      <h2 className="text-4xl font-black uppercase mb-8 tracking-tighter">Join the Club</h2>
      <form onSubmit={(e) => { e.preventDefault(); signup(formData.email, formData.password, formData.name).then(s => s && navigate('/profile')); }} className="space-y-6">
        <input type="text" placeholder="Full Name" className="w-full border-b border-black py-3 outline-none focus:border-crimson" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
        <input type="email" placeholder="Email Address" className="w-full border-b border-black py-3 outline-none focus:border-crimson" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
        <input type="password" placeholder="Password" className="w-full border-b border-black py-3 outline-none focus:border-crimson" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
        <button type="submit" className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-crimson transition-colors">Create Account</button>
      </form>
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
    <div className="max-w-7xl mx-auto px-4 py-20">
      <Helmet>
        <title>BrandshopingLTD | Your Profile - {user.username}</title>
      </Helmet>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <UserIcon className="w-12 h-12 mb-6 text-crimson" />
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-black uppercase mb-1">{user.name}</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{user.username}</p>
              </div>
              {!isEditing && <button onClick={() => setIsEditing(true)} className="text-[8px] font-black uppercase text-crimson border border-crimson/20 px-3 py-1 rounded-full hover:bg-crimson hover:text-white transition-all">Edit</button>}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4 border-t border-gray-50">
                <input type="text" placeholder="Full Name" className="w-full text-[10px] border-b border-gray-100 py-2 outline-none focus:border-crimson" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                <textarea placeholder="Tell us about yourself (Bio)" className="w-full text-[10px] border border-gray-100 p-2 outline-none focus:border-crimson h-20 resize-none" value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} />
                <input type="text" placeholder="Default Address" className="w-full text-[10px] border-b border-gray-100 py-2 outline-none focus:border-crimson" value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-black text-white py-2 text-[8px] font-black uppercase tracking-widest">Save Changes</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-gray-400">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="pt-4 border-t border-gray-50">
                <p className="text-xs text-gray-500 italic mb-4">"{user.bio || 'Luxury enthusiast. Fashion explorer.'}"</p>
                {user.address && (
                  <div className="flex items-start gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                    <span>📍</span> <span>{user.address}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="bg-black text-white p-8 rounded-2xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Bell className="text-crimson" size={16} /> Official Alerts
            </h3>
            <div className="space-y-4 mb-8 pb-8 border-b border-white/10">
              {user.notifications && user.notifications.length > 0 ? user.notifications.map(n => (
                <div key={n.id} className="bg-crimson/10 p-4 rounded-xl border border-crimson/20">
                  <p className="text-xs leading-relaxed font-bold">{n.content}</p>
                  <p className="text-[8px] text-gray-500 mt-2 font-black uppercase">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
              )) : <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">No official alerts.</p>}
            </div>

            <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <MessageSquare className="text-crimson" size={16} /> Support Messages
            </h3>
            <div className="space-y-4">
              {user.messages && user.messages.length > 0 ? user.messages.map(m => (
                <div key={m.id} className={`p-4 rounded-xl border ${m.senderId === 0 ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent opacity-60'}`}>
                  <p className="text-[8px] text-crimson font-black uppercase mb-1">{m.senderId === 0 ? 'Admin' : 'You'}</p>
                  <p className="text-xs leading-relaxed">{m.content}</p>
                  <p className="text-[8px] text-gray-500 mt-2 font-bold uppercase">{new Date(m.createdAt).toLocaleDateString()}</p>
                </div>
              )) : <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">No support history.</p>}
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <h3 className="text-2xl font-black uppercase mb-8 flex items-center gap-3"><ShoppingBag className="text-crimson" /> Shopping Bag</h3>
          <div className="space-y-6">
            {cart.map(item => (
              <div key={item.id} className="flex gap-6 border-b border-gray-100 pb-6 items-center">
                <img src={item.imagePath.startsWith('http') ? item.imagePath : `${API_BASE_URL || ''}${item.imagePath}`} className="w-20 h-24 object-cover rounded" alt="" />
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase text-gray-400">{item.brand}</p>
                  <h4 className="font-bold text-sm uppercase">{item.name}</h4>
                  <div className="flex gap-2 mt-1">
                    {item.selectedSize && <span className="text-[8px] font-black uppercase bg-gray-100 px-2 py-0.5 rounded-full">Size: {item.selectedSize}</span>}
                    {item.selectedColor && <span className="text-[8px] font-black uppercase bg-gray-100 px-2 py-0.5 rounded-full">Color: {item.selectedColor}</span>}
                  </div>
                  <p className="text-sm font-bold mt-2">${item.price.toFixed(2)} x {item.quantity}</p>
                </div>
                <button onClick={() => removeFromCart(item.cartId || item.id)} className="text-gray-300 hover:text-red-500"><X size={20} /></button>
              </div>
            ))}
            {cart.length > 0 && (
              <div className="pt-8 space-y-6 animate-fade-in">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">Delivery & Payment</h4>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-2">Delivery Address (REQUIRED)</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-gray-200 p-3 rounded-xl text-xs outline-none focus:border-crimson"
                        placeholder="Street, City, Zip Code"
                        value={orderAddress}
                        onChange={e => setOrderAddress(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {[
                        { id: 'card', icon: <CreditCard size={18} />, label: 'Credit Card' },
                        { id: 'paypal', icon: <Globe size={18} />, label: 'PayPal' },
                        { id: 'applepay', icon: <Smartphone size={18} />, label: 'Apple Pay' },
                        { id: 'googlepay', icon: <Wallet size={18} />, label: 'Google Pay' },
                        { id: 'bank', icon: <Building2 size={18} />, label: 'Bank Transfer' },
                        { id: 'cod', icon: <Banknote size={18} />, label: 'Cash on Delivery' }
                      ].map(m => (
                        <button
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id)}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${paymentMethod === m.id ? 'border-crimson bg-white shadow-sm' : 'border-transparent bg-white hover:border-gray-200'}`}
                        >
                          <span className={paymentMethod === m.id ? 'text-crimson' : 'text-gray-400'}>{m.icon}</span>
                          <span className="text-[10px] font-black uppercase">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-end border-t border-gray-100 pt-6">
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-black uppercase tracking-widest">Bag Total</p>
                    {localStorage.getItem('hasDiscount') === 'true' && (
                      <span className="text-[10px] font-black uppercase text-crimson italic">10% Reviewer Discount Applied 🎁</span>
                    )}
                  </div>
                  <div className="text-right">
                    {localStorage.getItem('hasDiscount') === 'true' ? (
                      <>
                        <p className="text-xs text-gray-300 line-through font-bold">${cart.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}</p>
                        <p className="text-3xl font-black underline decoration-crimson">${(cart.reduce((sum, i) => sum + (i.price * i.quantity), 0) * 0.9).toFixed(2)}</p>
                      </>
                    ) : (
                      <p className="text-3xl font-black underline decoration-crimson">${cart.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!orderAddress) { if (window.__showToast) window.__showToast('Please provide a delivery address', 'warning', 'Missing Address'); return; }
                    if (!paymentMethod) { if (window.__showToast) window.__showToast('Please select a payment method', 'warning', 'Payment Required'); return; }
                    placeOrder(paymentMethod, orderAddress).then(() => {
                      if (window.__showToast) {
                        window.__showToast('Order placed successfully! Our admin will review your order shortly.', 'success', 'Order Confirmed 🛍️', 6000);
                        setTimeout(() => window.__showToast('Check your Support Messages in profile for confirmation within 1 hour.', 'info', 'Next Steps', 5000), 2000);
                      }
                    });
                  }}
                  className="w-full bg-black text-white py-5 font-black uppercase tracking-widest hover:bg-crimson transition-all"
                >
                  Complete Order {localStorage.getItem('hasDiscount') === 'true' && '- 10% Applied!'}
                </button>
              </div>
            )}
            {cart.length === 0 && <p className="text-center py-20 text-gray-400 uppercase font-black tracking-widest text-[10px]">Your bag is empty</p>}
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
