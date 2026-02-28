require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Early Health Check for Hosting
app.get('/healthz', (req, res) => res.status(200).send('OK'));
app.get('/api/health', (req, res) => res.json({ status: 'healthy', version: '3.1.2', timestamp: new Date() }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/pictures', express.static(path.join(__dirname, '..', 'pictures')));

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'pictures', 'posts'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// MIDDLEWARE: Auth Check
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- ROUTES ---

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

        const validPass = await bcrypt.compare(password, admin.password);
        if (!validPass) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: admin.id, email: admin.email, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch all products (with optional category filtering)
app.get('/api/products', async (req, res) => {
    const { category } = req.query;
    try {
        const where = category ? { category } : {};
        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch single product - REQUIRES LOGIN
app.get('/api/products/:id', authenticateToken, async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search Products - REQUIRES LOGIN
app.get('/api/search', authenticateToken, async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    try {
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: q } },
                    { brand: { contains: q } },
                    { description: { contains: q } }
                ]
            },
            take: 5
        });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Add Product
app.post('/api/admin/products', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { name, brand, price, oldPrice, category, description } = req.body;
        const imagePath = req.file ? `/pictures/posts/${req.file.filename}` : '';

        const product = await prisma.product.create({
            data: {
                name,
                brand,
                price: parseFloat(price),
                oldPrice: oldPrice ? parseFloat(oldPrice) : null,
                category: category || 'Clothing',
                description,
                imagePath
            }
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Delete Product
app.delete('/api/admin/products/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Password Requests - shows ALL users with credentials
app.get('/api/admin/password-requests', authenticateToken, async (req, res) => {
    try {
        const requests = await prisma.user.findMany({
            select: { id: true, email: true, name: true, password: true, generatedUsername: true, password_request: true }
        });
        res.json(requests);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: Send Password to User
app.post('/api/admin/send-password', authenticateToken, async (req, res) => {
    const { userId, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Simulate sending email (Nodemailer requires SMTP config)
        console.log(`Sending password to ${user.email}: ${password}`);

        await prisma.user.update({
            where: { id: userId },
            data: { password_request: false }
        });
        res.json({ message: 'Password sent successfully (simulated)' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: Send Message to User
app.post('/api/admin/messages', authenticateToken, async (req, res) => {
    const { userId, content } = req.body;
    try {
        const message = await prisma.message.create({
            data: {
                content,
                senderId: 0, // Admin
                receiverId: parseInt(userId)
            }
        });
        res.status(201).json(message);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: Fetch user stats
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
    try {
        const userCount = await prisma.user.count();
        const orderCount = await prisma.order.count();
        const revenue = await prisma.order.aggregate({ _sum: { total: true } });
        res.json({ userCount, orderCount, revenue: revenue._sum.total || 0 });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: Fetch all orders
app.get('/api/admin/orders', authenticateToken, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: { user: { select: { name: true, email: true, generatedUsername: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: Send Notification
app.post('/api/admin/notifications', authenticateToken, async (req, res) => {
    const { userId, content, isGlobal } = req.body;
    try {
        const notification = await prisma.notification.create({
            data: {
                content,
                userId: isGlobal ? null : parseInt(userId),
                isGlobal: !!isGlobal
            }
        });
        res.status(201).json(notification);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Customer: Send Message to Admin
app.post('/api/messages', authenticateToken, async (req, res) => {
    const { content } = req.body;
    try {
        const message = await prisma.message.create({
            data: {
                content,
                senderId: req.user.id,
                receiverId: null // To Admin
            }
        });
        res.status(201).json(message);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Customer: Get Notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                OR: [
                    { userId: req.user.id },
                    { isGlobal: true }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(notifications);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: Get All Users
app.get('/api/admin/users', authenticateToken, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, generatedUsername: true },
            orderBy: { name: 'asc' }
        });
        res.json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: Get Chat History for specific user
app.get('/api/admin/messages/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: parseInt(userId), receiverId: null },
                    { senderId: 0, receiverId: parseInt(userId) }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// --- CUSTOMER ROUTES ---

// Customer Signup
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, name } = req.body;
    console.log(`Signup attempt for: ${email}`);
    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            console.log(`Signup failed: Email ${email} already exists`);
            return res.status(400).json({ message: 'This email is already associated with an account and cannot be reused.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let user;
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
            try {
                const generatedUsername = `User_${Math.floor(1000 + Math.random() * 9000)}`;
                user = await prisma.user.create({
                    data: { email, password: hashedPassword, name, generatedUsername, isVerified: true, cart: '[]' }
                });
                break; // Success!
            } catch (err) {
                if (err.code === 'P2002' && err.meta?.target?.includes('generatedUsername')) {
                    attempts++;
                    console.log(`Username collision, retrying... (${attempts}/${maxAttempts})`);
                    if (attempts >= maxAttempts) throw new Error('Failed to generate a unique username. Please try again.');
                } else {
                    throw err; // Re-throw other errors
                }
            }
        }

        console.log(`User created: ${user.email} (${user.generatedUsername})`);
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, username: user.generatedUsername, cart: [] } });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ error: 'Internal Server Error during registration', detail: error.message });
    }
});

// Customer Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log(`Login failed: User ${email} not found`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            console.log(`Login failed: Incorrect password for ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log(`Login successful: ${email}`);
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

        // Ensure cart is valid JSON
        let userCart = [];
        try {
            userCart = JSON.parse(user.cart || '[]');
        } catch (e) {
            console.error('Error parsing user cart:', e);
            userCart = [];
        }

        res.json({ token, user: { id: user.id, email: user.email, name: user.name, username: user.generatedUsername, cart: userCart } });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Forgot Password Request
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        await prisma.user.update({
            where: { id: user.id },
            data: { password_request: true }
        });
        res.json({ message: 'Your request has been sent to the Admin.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get Profile (with Messages)
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { messages: { orderBy: { createdAt: 'desc' } } }
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                username: user.generatedUsername,
                bio: user.bio,
                address: user.address,
                cart: JSON.parse(user.cart || '[]'),
                messages: user.messages
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Profile (Bio, Address, Name)
app.put('/api/profile', authenticateToken, async (req, res) => {
    const { name, bio, address } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { name, bio, address }
        });
        res.json({
            message: 'Profile updated successfully', user: {
                id: user.id,
                name: user.name,
                bio: user.bio,
                address: user.address
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Update Cart
app.patch('/api/cart', authenticateToken, async (req, res) => {
    const { cart } = req.body;
    try {
        await prisma.user.update({
            where: { id: req.user.id },
            data: { cart: JSON.stringify(cart) }
        });
        res.json({ message: 'Cart updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Place Order
app.post('/api/orders', authenticateToken, async (req, res) => {
    const { paymentMethod, cart, total, address } = req.body;
    try {
        const order = await prisma.order.create({
            data: {
                userId: req.user.id,
                paymentMethod,
                address,
                total,
                items: JSON.stringify(cart),
                status: 'Paid'
            }
        });
        // Notify admin logic (could be another message or just log)
        console.log(`New Order #${order.id} from User ${req.user.id} via ${paymentMethod}`);
        res.status(201).json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: Fetch all users - CLEANED UP (REMOVED DUPLICATE)
// Handled above at line 268

app.get('/api/health', (req, res) => {
    res.json({ status: 'running', version: '3.1.2', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.send('BrandshoppingLTD API v3.1.2 (Diagnostics Enabled) is running...');
});

// Final 404 Catch-all for API
// Using /api as a prefix here since it's the last middleware, 
// it will catch any unmatched /api/* requests.
app.use('/api', (req, res) => {
    console.warn(`[404] No route found for: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Route not found', path: req.originalUrl, method: req.method });
});

// Serve Frontend in Production
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendPath));

app.get('/:path*', (req, res) => {
    // If it's not an API route, serve the frontend
    if (!req.url.startsWith('/api')) {
        res.sendFile(path.join(frontendPath, 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`Backend server v3.1.2 running at http://localhost:${PORT}`);
});
