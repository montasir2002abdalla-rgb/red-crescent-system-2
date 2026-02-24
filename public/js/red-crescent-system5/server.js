require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-in-production';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('❌ خطأ في فتح قاعدة البيانات:', err.message);
    } else {
        console.log('✅ تم الاتصال بقاعدة بيانات SQLite.');
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        // جدول المستخدمين
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employeeId TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'volunteer',
            status TEXT DEFAULT 'pending',
            approved INTEGER DEFAULT 0,
            qualifications TEXT,
            motivation TEXT,
            joinDate TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // جدول التبرعات
        db.run(`CREATE TABLE IF NOT EXISTS donations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            donorId INTEGER,
            donorName TEXT NOT NULL,
            amount REAL,
            paymentMethod TEXT,
            transactionId TEXT,
            status TEXT DEFAULT 'pending',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(donorId) REFERENCES users(id)
        )`);

        // جدول المستفيدين
        db.run(`CREATE TABLE IF NOT EXISTS beneficiaries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER UNIQUE,
            name TEXT NOT NULL,
            idNumber TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            address TEXT,
            familyMembers INTEGER,
            healthStatus TEXT,
            registeredBy INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(userId) REFERENCES users(id),
            FOREIGN KEY(registeredBy) REFERENCES users(id)
        )`);

        // جدول السجلات الصحية
        db.run(`CREATE TABLE IF NOT EXISTS health_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            beneficiaryId INTEGER,
            recordDate TEXT,
            diagnosis TEXT,
            treatment TEXT,
            notes TEXT,
            createdBy INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(beneficiaryId) REFERENCES beneficiaries(id),
            FOREIGN KEY(createdBy) REFERENCES users(id)
        )`);

        // جدول طلبات المساعدة
        db.run(`CREATE TABLE IF NOT EXISTS assistance_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            beneficiaryId INTEGER,
            requestType TEXT,
            description TEXT,
            status TEXT DEFAULT 'pending',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(beneficiaryId) REFERENCES beneficiaries(id)
        )`);

        // جدول المخزون
        db.run(`CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            itemName TEXT NOT NULL,
            category TEXT,
            subCategory TEXT,
            quantity INTEGER,
            unit TEXT,
            expiryDate TEXT,
            minStock INTEGER DEFAULT 0,
            lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // جدول المعاملات المالية (إيرادات ومصروفات)
        db.run(`CREATE TABLE IF NOT EXISTS financial_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            donationId INTEGER,
            amount REAL,
            type TEXT, -- 'income' or 'expense'
            description TEXT,
            createdBy INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(donationId) REFERENCES donations(id),
            FOREIGN KEY(createdBy) REFERENCES users(id)
        )`);

        // جدول فرق الطوارئ
        db.run(`CREATE TABLE IF NOT EXISTS emergency_teams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            teamName TEXT,
            leaderId INTEGER,
            members TEXT,
            status TEXT DEFAULT 'active',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(leaderId) REFERENCES users(id)
        )`);

        // جدول الشكاوى والتنبيهات
        db.run(`CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            userRole TEXT,
            message TEXT,
            type TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);

        // جدول العمليات اللوجستية
        db.run(`CREATE TABLE IF NOT EXISTS logistics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            requestId INTEGER,
            fromLocation TEXT,
            toLocation TEXT,
            status TEXT DEFAULT 'pending',
            assignedTo INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(requestId) REFERENCES assistance_requests(id),
            FOREIGN KEY(assignedTo) REFERENCES users(id)
        )`);

        // إنشاء مستخدمين افتراضيين
        const hashedPasswordAdmin = bcrypt.hashSync('admin123', 10);
        const hashedPasswordKeeper = bcrypt.hashSync('keeper123', 10);

        // مدير النظام
        db.get(`SELECT * FROM users WHERE employeeId = ?`, ['ADMIN001'], (err, row) => {
            if (!row) {
                db.run(`INSERT INTO users (employeeId, name, email, phone, password, role, status, approved, joinDate) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    ['ADMIN001', 'مدير النظام', 'admin@redcrescent.org', '0912345678', hashedPasswordAdmin, 'manager', 'active', 1, new Date().toISOString().split('T')[0]]
                );
                console.log('👤 تم إنشاء مستخدم مدير افتراضي: ADMIN001 / admin123');
            }
        });

        // أمين مخزن
        db.get(`SELECT * FROM users WHERE employeeId = ?`, ['KEEPER001'], (err, row) => {
            if (!row) {
                db.run(`INSERT INTO users (employeeId, name, email, phone, password, role, status, approved, joinDate) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    ['KEEPER001', 'أمين المخزن', 'keeper@redcrescent.org', '0912345679', hashedPasswordKeeper, 'inventory_keeper', 'active', 1, new Date().toISOString().split('T')[0]]
                );
                console.log('👤 تم إنشاء مستخدم أمين مخزن افتراضي: KEEPER001 / keeper123');
            }
        });

        // إضافة بعض بيانات المخزون الافتراضية
        db.get(`SELECT COUNT(*) as count FROM inventory`, [], (err, row) => {
            if (row.count === 0) {
                const items = [
                    ['مواد غذائية متنوعة', 'food', null, 500, 'كيس', null, 100],
                    ['بطاطين', 'shelter', null, 200, 'قطعة', null, 50],
                    ['أدوية أساسية', 'medical', 'medicine', 150, 'علبة', '2025-12-31', 30],
                    ['مطهرات', 'medical', 'disinfectant', 300, 'زجاجة', '2024-06-30', 50]
                ];
                items.forEach(item => {
                    db.run(`INSERT INTO inventory (itemName, category, subCategory, quantity, unit, expiryDate, minStock) VALUES (?, ?, ?, ?, ?, ?, ?)`, item);
                });
                console.log('📦 تم إضافة بيانات مخزون افتراضية.');
            }
        });
    });
}

// دوال المساعدة
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'غير مصرح به' });
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'توكن غير صالح' });
        req.user = user;
        next();
    });
};

const requireManager = (req, res, next) => {
    if (req.user.role !== 'manager') {
        return res.status(403).json({ error: 'يتطلب صلاحية مدير' });
    }
    next();
};

const requireInventoryAccess = (req, res, next) => {
    if (req.user.role !== 'manager' && req.user.role !== 'inventory_keeper') {
        return res.status(403).json({ error: 'غير مصرح بالوصول إلى المخزون' });
    }
    next();
};

// ========================
// API Routes
// ========================

// تسجيل الدخول
app.post('/api/auth/login', (req, res) => {
    const { employeeId, password } = req.body;
    db.get(`SELECT * FROM users WHERE employeeId = ?`, [employeeId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'الرقم الوظيفي أو كلمة المرور غير صحيحة' });
        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'الرقم الوظيفي أو كلمة المرور غير صحيحة' });
        if (user.status !== 'active') {
            return res.status(403).json({ error: 'الحساب غير مفعل بعد، يرجى انتظار الموافقة' });
        }
        const token = jwt.sign(
            { id: user.id, employeeId: user.employeeId, name: user.name, role: user.role, approved: user.approved },
            SECRET_KEY,
            { expiresIn: '24h' }
        );
        res.json({
            token,
            user: {
                id: user.id,
                employeeId: user.employeeId,
                name: user.name,
                role: user.role,
                approved: user.approved
            }
        });
    });
});

// تسجيل مستخدم جديد
app.post('/api/register', (req, res) => {
    const { employeeId, name, email, phone, password, role, qualifications, motivation, familySize, city, donorType } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const joinDate = new Date().toISOString().split('T')[0];
    let approved = 0;
    let status = 'pending';
    if (role === 'donor' || role === 'beneficiary') {
        approved = 1;
        status = 'active';
    }
    db.run(`INSERT INTO users (employeeId, name, email, phone, password, role, status, approved, qualifications, motivation, joinDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [employeeId, name, email, phone, hashedPassword, role, status, approved, qualifications, motivation, joinDate],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'الرقم الوظيفي أو البريد الإلكتروني موجود مسبقاً' });
                }
                return res.status(500).json({ error: err.message });
            }
            if (role === 'beneficiary') {
                db.run(`INSERT INTO beneficiaries (userId, name, idNumber, phone, familyMembers) VALUES (?, ?, ?, ?, ?)`,
                    [this.lastID, name, employeeId, phone, familySize || 1], (err2) => {
                        if (err2) console.error(err2);
                    });
            }
            res.status(201).json({ id: this.lastID, message: 'تم تقديم الطلب بنجاح' });
        }
    );
});

// إدارة المستخدمين (للمدير)
app.get('/api/users/pending', authenticateToken, requireManager, (req, res) => {
    db.all(`SELECT * FROM users WHERE status = 'pending'`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/users/active', authenticateToken, requireManager, (req, res) => {
    db.all(`SELECT * FROM users WHERE status = 'active'`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/users/approve/:id', authenticateToken, requireManager, (req, res) => {
    const userId = req.params.id;
    db.run(`UPDATE users SET status = 'active', approved = 1 WHERE id = ?`, [userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'تمت الموافقة على المستخدم' });
    });
});

app.post('/api/users/reject/:id', authenticateToken, requireManager, (req, res) => {
    const userId = req.params.id;
    db.run(`DELETE FROM users WHERE id = ?`, [userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'تم رفض الطلب وحذفه' });
    });
});

// المخزون
app.get('/api/inventory', authenticateToken, requireInventoryAccess, (req, res) => {
    db.all(`SELECT * FROM inventory ORDER BY lastUpdated DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/inventory', authenticateToken, requireInventoryAccess, (req, res) => {
    const { itemName, category, subCategory, quantity, unit, expiryDate, minStock } = req.body;
    db.run(`INSERT INTO inventory (itemName, category, subCategory, quantity, unit, expiryDate, minStock, lastUpdated)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [itemName, category, subCategory, quantity, unit, expiryDate, minStock],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, message: 'تمت الإضافة' });
        }
    );
});

app.put('/api/inventory/:id', authenticateToken, requireInventoryAccess, (req, res) => {
    const { quantity } = req.body;
    const id = req.params.id;
    db.run(`UPDATE inventory SET quantity = ?, lastUpdated = CURRENT_TIMESTAMP WHERE id = ?`, [quantity, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'تم التحديث' });
    });
});

app.delete('/api/inventory/:id', authenticateToken, requireManager, (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM inventory WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'تم الحذف' });
    });
});

// التبرعات
app.post('/api/donations', authenticateToken, (req, res) => {
    const { amount, paymentMethod, transactionId } = req.body;
    const donorId = req.user.id;
    const donorName = req.user.name;
    db.run(`INSERT INTO donations (donorId, donorName, amount, paymentMethod, transactionId, status)
            VALUES (?, ?, ?, ?, ?, ?)`,
        [donorId, donorName, amount, paymentMethod, transactionId, 'pending'],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            db.run(`INSERT INTO financial_transactions (donationId, amount, type, description, createdBy)
                    VALUES (?, ?, ?, ?, ?)`,
                [this.lastID, amount, 'income', 'تبرع مالي', donorId],
                (err2) => { if (err2) console.error(err2); }
            );
            res.status(201).json({ id: this.lastID, message: 'تم تسجيل التبرع بنجاح' });
        }
    );
});

app.get('/api/donations', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;
    let query = `SELECT * FROM donations ORDER BY createdAt DESC`;
    let params = [];
    if (role === 'donor') {
        query = `SELECT * FROM donations WHERE donorId = ? ORDER BY createdAt DESC`;
        params = [userId];
    }
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// المصروفات (للمدير فقط)
app.post('/api/expenses', authenticateToken, requireManager, (req, res) => {
    const { amount, description } = req.body;
    const createdBy = req.user.id;
    db.run(`INSERT INTO financial_transactions (amount, type, description, createdBy)
            VALUES (?, ?, ?, ?)`,
        [amount, 'expense', description, createdBy],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, message: 'تم تسجيل الصرف' });
        }
    );
});

// المعاملات المالية
app.get('/api/financial-transactions', authenticateToken, requireInventoryAccess, (req, res) => {
    db.all(`SELECT ft.*, d.donorName FROM financial_transactions ft
            LEFT JOIN donations d ON ft.donationId = d.id
            ORDER BY ft.createdAt DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// المستفيدين
app.get('/api/beneficiaries', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM beneficiaries ORDER BY createdAt DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/beneficiaries', authenticateToken, (req, res) => {
    const { name, idNumber, phone, address, familyMembers, healthStatus } = req.body;
    const registeredBy = req.user.id;
    db.run(`INSERT INTO beneficiaries (name, idNumber, phone, address, familyMembers, healthStatus, registeredBy)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, idNumber, phone, address, familyMembers, healthStatus, registeredBy],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'رقم الهوية موجود مسبقاً' });
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, message: 'تم تسجيل المستفيد بنجاح' });
        }
    );
});

app.put('/api/beneficiaries/:id', authenticateToken, (req, res) => {
    const { name, phone, address, familyMembers, healthStatus } = req.body;
    const id = req.params.id;
    db.run(`UPDATE beneficiaries SET name=?, phone=?, address=?, familyMembers=?, healthStatus=? WHERE id=?`,
        [name, phone, address, familyMembers, healthStatus, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'تم التحديث' });
        });
});

app.delete('/api/beneficiaries/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM beneficiaries WHERE id=?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'تم الحذف' });
    });
});

// طلبات المساعدة
app.get('/api/assistance-requests', authenticateToken, (req, res) => {
    db.all(`SELECT ar.*, b.name as beneficiaryName FROM assistance_requests ar
            JOIN beneficiaries b ON ar.beneficiaryId = b.id
            ORDER BY ar.createdAt DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/assistance-requests', authenticateToken, (req, res) => {
    const { beneficiaryId, requestType, description } = req.body;
    db.run(`INSERT INTO assistance_requests (beneficiaryId, requestType, description, status)
            VALUES (?, ?, ?, ?)`,
        [beneficiaryId, requestType, description, 'pending'],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, message: 'تم تقديم الطلب' });
        }
    );
});

app.put('/api/assistance-requests/:id', authenticateToken, (req, res) => {
    const { status } = req.body;
    db.run(`UPDATE assistance_requests SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'تم التحديث' });
    });
});

app.delete('/api/assistance-requests/:id', authenticateToken, requireManager, (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM assistance_requests WHERE id=?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'تم الحذف' });
    });
});

// فرق الطوارئ
app.get('/api/emergency-teams', authenticateToken, requireManager, (req, res) => {
    db.all(`SELECT et.*, u.name as leaderName FROM emergency_teams et
            LEFT JOIN users u ON et.leaderId = u.id`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/emergency-teams', authenticateToken, requireManager, (req, res) => {
    const { teamName, leaderId, members } = req.body;
    db.run(`INSERT INTO emergency_teams (teamName, leaderId, members) VALUES (?, ?, ?)`,
        [teamName, leaderId, JSON.stringify(members)],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        }
    );
});

app.put('/api/emergency-teams/:id', authenticateToken, requireManager, (req, res) => {
    const { status } = req.body;
    db.run(`UPDATE emergency_teams SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'تم التحديث' });
    });
});

// اللوجستيات
app.get('/api/logistics', authenticateToken, (req, res) => {
    db.all(`SELECT l.*, u.name as assignedName, ar.description as requestDesc
            FROM logistics l
            LEFT JOIN users u ON l.assignedTo = u.id
            LEFT JOIN assistance_requests ar ON l.requestId = ar.id
            ORDER BY l.createdAt DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/logistics', authenticateToken, (req, res) => {
    const { requestId, fromLocation, toLocation, assignedTo } = req.body;
    db.run(`INSERT INTO logistics (requestId, fromLocation, toLocation, assignedTo, status)
            VALUES (?, ?, ?, ?, ?)`,
        [requestId, fromLocation, toLocation, assignedTo, 'pending'],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        }
    );
});

app.put('/api/logistics/:id', authenticateToken, (req, res) => {
    const { status } = req.body;
    db.run(`UPDATE logistics SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'تم التحديث' });
    });
});

// السجلات الصحية
app.get('/api/health-records/:beneficiaryId', authenticateToken, (req, res) => {
    db.all(`SELECT hr.*, u.name as createdByName FROM health_records hr
            LEFT JOIN users u ON hr.createdBy = u.id
            WHERE hr.beneficiaryId = ?
            ORDER BY hr.recordDate DESC`, [req.params.beneficiaryId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/health-records', authenticateToken, (req, res) => {
    const { beneficiaryId, recordDate, diagnosis, treatment, notes } = req.body;
    const createdBy = req.user.id;
    db.run(`INSERT INTO health_records (beneficiaryId, recordDate, diagnosis, treatment, notes, createdBy)
            VALUES (?, ?, ?, ?, ?, ?)`,
        [beneficiaryId, recordDate, diagnosis, treatment, notes, createdBy],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        }
    );
});

app.put('/api/health-records/:id', authenticateToken, (req, res) => {
    const { recordDate, diagnosis, treatment, notes } = req.body;
    const id = req.params.id;
    db.run(`UPDATE health_records SET recordDate=?, diagnosis=?, treatment=?, notes=? WHERE id=?`,
        [recordDate, diagnosis, treatment, notes, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'تم التحديث' });
        });
});

app.delete('/api/health-records/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM health_records WHERE id=?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'تم الحذف' });
    });
});

// الشكاوى والتنبيهات
app.get('/api/complaints', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;
    let query = `SELECT * FROM complaints ORDER BY createdAt DESC`;
    let params = [];
    if (role !== 'manager') {
        query = `SELECT * FROM complaints WHERE userId = ? ORDER BY createdAt DESC`;
        params = [userId];
    }
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/complaints', authenticateToken, (req, res) => {
    const { message, type } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    // السماح فقط للمانحين والمستفيدين بإرسال الشكاوى والتنبيهات
    if (userRole !== 'donor' && userRole !== 'beneficiary') {
        return res.status(403).json({ error: 'غير مسموح لك بإرسال شكاوى أو تنبيهات' });
    }
    db.run(`INSERT INTO complaints (userId, userRole, message, type) VALUES (?, ?, ?, ?)`,
        [userId, userRole, message, type],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        }
    );
});

// الإحصائيات
app.get('/api/stats', authenticateToken, (req, res) => {
    const role = req.user.role;
    let stats = {};
    const queries = {
        beneficiaries: `SELECT COUNT(*) as count FROM beneficiaries`,
        donations: `SELECT COUNT(*) as count FROM donations`,
        inventoryItems: `SELECT COUNT(*) as count FROM inventory`,
        totalIncome: `SELECT SUM(amount) as total FROM financial_transactions WHERE type='income'`,
        totalExpenses: `SELECT SUM(amount) as total FROM financial_transactions WHERE type='expense'`,
        pendingRequests: `SELECT COUNT(*) as count FROM assistance_requests WHERE status='pending'`,
        pendingUsers: role === 'manager' ? `SELECT COUNT(*) as count FROM users WHERE status='pending'` : null,
        lowStock: (role === 'manager' || role === 'inventory_keeper') ? `SELECT COUNT(*) as count FROM inventory WHERE quantity <= minStock` : null,
        activeTeams: role === 'manager' ? `SELECT COUNT(*) as count FROM emergency_teams WHERE status='active'` : null
    };
    db.serialize(() => {
        db.get(queries.beneficiaries, [], (err, row) => { stats.beneficiaries = row?.count || 0; });
        db.get(queries.donations, [], (err, row) => { stats.donations = row?.count || 0; });
        db.get(queries.inventoryItems, [], (err, row) => { stats.inventoryItems = row?.count || 0; });
        db.get(queries.totalIncome, [], (err, row) => { stats.totalIncome = row?.total || 0; });
        db.get(queries.totalExpenses, [], (err, row) => { stats.totalExpenses = row?.total || 0; });
        stats.totalFunds = stats.totalIncome - stats.totalExpenses;
        db.get(queries.pendingRequests, [], (err, row) => { stats.pendingRequests = row?.count || 0; });
        if (queries.pendingUsers) {
            db.get(queries.pendingUsers, [], (err, row) => { stats.pendingUsers = row?.count || 0; });
        }
        if (queries.lowStock) {
            db.get(queries.lowStock, [], (err, row) => { stats.lowStock = row?.count || 0; });
        }
        if (queries.activeTeams) {
            db.get(queries.activeTeams, [], (err, row) => { stats.activeTeams = row?.count || 0; });
        }
        setTimeout(() => res.json(stats), 100);
    });
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`🚀 الخادم يعمل على http://localhost:${PORT}`);
});