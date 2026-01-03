const express = require('express'); // ✅ Fixed: 'const' instead of 'Const'
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); 
require('dotenv').config(); 

const app = express();
app.use(express.json({ limit: '10mb' })); // বড় ইমেজ আপলোডের জন্য
app.use(cors());

// --- 1. Database Connection ---
const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch(err => console.log("❌ DB Connection Error:", err));


// --- 2. Database Models (Schemas) ---

// User Model
const UserSchema = new mongoose.Schema({ username: String, pass: String });
const UserModel = mongoose.model("users", UserSchema);

// Admin Profile Model
const AdminSchema = new mongoose.Schema({
    name: { type: String, default: 'Mehedi Hasan' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    role: { type: String, default: 'Admin' }
}, { timestamps: true });
const AdminModel = mongoose.model("Admin", AdminSchema);

// Product Model
const ProductSchema = new mongoose.Schema({
    name: String,
    category: String,
    price: Number,
    stock: Number,
    unit: String,
    alertQty: String,
    date: { type: Date, default: Date.now }
});
const ProductModel = mongoose.model("products", ProductSchema);

// Customer Model
const CustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobile: String,
    address: String,
    date: { type: Date, default: Date.now }
}, { collection: 'customers' });
const CustomerModel = mongoose.model("Customer", CustomerSchema);

// Invoice Model
const InvoiceSchema = new mongoose.Schema({
    invoiceNo: { type: String, required: true },
    date: { type: Date, default: Date.now },
    customer: {
        name: String,
        mobile: String,
        address: String
    },
    items: [
        {
            _id: String,
            name: String,
            unit: String,
            price: Number,
            qty: Number,
            feet: String,        
            calcBy: String,      
            description: String, 
            total: Number
        }
    ],
    payment: {
        subTotal: Number,
        discount: Number,
        grandTotal: Number,
        paid: Number,
        due: Number,
        method: String,
        history: [
            {
                date: { type: Date, default: Date.now },
                amount: Number,
                method: String,
                remark: String
            }
        ]
    }
}, { timestamps: true });

const InvoiceModel = mongoose.model("Invoice", InvoiceSchema);

// Quotation Model
const QuotationSchema = new mongoose.Schema({
    quotationNo: { type: String, required: true },
    date: { type: Date, default: Date.now },
    customer: {
        name: String,
        mobile: String,
        address: String
    },
    items: [
        {
            _id: String, 
            name: String,
            unit: String,
            price: Number,
            qty: Number,
            feet: String,        
            calcBy: String,      
            description: String, 
            total: Number
        }
    ],
    payment: {
        subTotal: Number,
        discount: Number,
        grandTotal: Number,
        paid: Number,
        due: Number
    }
}, { timestamps: true });

const QuotationModel = mongoose.model("Quotation", QuotationSchema);


// --- 3. API ROUTES (Updated with /api prefix) ---

// Login API
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username: username });
    if(user && user.pass === password) {
        res.json("Success");
    } else {
        res.json("Wrong password");
    }
});

// Admin Profile APIs
app.get('/api/admin-profile', async (req, res) => {
    try {
        let admin = await AdminModel.findOne();
        if (!admin) {
            admin = await AdminModel.create({
                name: 'Mehedi Hasan',
                email: '',
                phone: '',
                avatar: '',
                role: 'Admin'
            });
        }
        res.json(admin);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get admin profile' });
    }
});

app.put('/api/admin-profile', async (req, res) => {
    try {
        const { name, email, phone, avatar } = req.body;
        let admin = await AdminModel.findOne();
        
        if (!admin) {
            admin = await AdminModel.create({
                name: name || 'Mehedi Hasan',
                email: email || '',
                phone: phone || '',
                avatar: avatar || '',
                role: 'Admin'
            });
        } else {
            admin.name = name || admin.name;
            admin.email = email || admin.email;
            admin.phone = phone || admin.phone;
            if (avatar !== undefined) admin.avatar = avatar;
            await admin.save();
        }
        res.json(admin);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

app.put('/api/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        // ডিফল্ট admin ইউজার খোঁজা হচ্ছে, প্রয়োজনে আপনার ডাটাবেসের ইউজারনেম অনুযায়ী এটি চেঞ্জ করতে পারেন
        const user = await UserModel.findOne(); 
        
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        if (user.pass !== currentPassword) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        
        user.pass = newPassword;
        await user.save();
        
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Product APIs
app.post('/api/add-product', async (req, res) => {
    try {
        const newProduct = await ProductModel.create(req.body);
        res.json({ status: "Success", data: newProduct });
    } catch (err) {
        res.status(500).json({ status: "Error", error: err.message });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await ProductModel.find().sort({ date: -1 });
        res.json(products);
    } catch (err) {
        res.json({ error: err.message });
    }
});

app.put('/api/update-product/:id', async (req, res) => {
    try {
        const updatedProduct = await ProductModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ status: "Success", data: updatedProduct });
    } catch (err) {
        res.json({ status: "Error", error: err.message });
    }
});

app.delete('/api/delete-product/:id', async (req, res) => {
    try {
        await ProductModel.findByIdAndDelete(req.params.id);
        res.json({ status: "Success" });
    } catch (err) {
        res.json({ status: "Error", error: err.message });
    }
});

// Customer APIs
app.post('/api/add-customer', async (req, res) => {
    try {
        const newCustomer = await CustomerModel.create(req.body);
        res.json({ status: "Success", data: newCustomer });
    } catch (err) {
        res.status(500).json({ status: "Error", error: err.message });
    }
});

app.get('/api/customers', async (req, res) => {
    try {
        const customers = await CustomerModel.find().sort({ date: -1 });
        res.json(customers);
    } catch (err) {
        res.json({ error: err.message });
    }
});

app.put('/api/update-customer/:id', async (req, res) => {
    try {
        const updated = await CustomerModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ status: "Success", data: updated });
    } catch (err) { res.json({ status: "Error", error: err.message }); }
});

app.delete('/api/delete-customer/:id', async (req, res) => {
    try {
        await CustomerModel.findByIdAndDelete(req.params.id);
        res.json({ status: "Success" });
    } catch (err) { res.json({ status: "Error", error: err.message }); }
});

// Invoice APIs
app.post('/api/create-invoice', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { customer, items, payment } = req.body;
        const count = await InvoiceModel.countDocuments();
        const invoiceNo = "INV-" + (1000 + count + 1);

        const initialHistory = [];
        if (payment.paid > 0) {
            initialHistory.push({
                date: new Date(),
                amount: payment.paid,
                method: payment.method || 'Cash',
                remark: 'Initial Payment'
            });
        }

        const newInvoice = new InvoiceModel({
            invoiceNo: invoiceNo,
            customer: customer,
            items: items,
            payment: { ...payment, history: initialHistory }
        });

        await newInvoice.save({ session });

        for (const item of items) {
            if (item._id) {
                await ProductModel.updateOne(
                    { _id: item._id },
                    { $inc: { stock: -item.qty } } 
                ).session(session);
            }
        }

        await session.commitTransaction();
        session.endSession();
        res.json({ status: "Success", data: newInvoice });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ status: "Error", error: err.message });
    }
});

app.put('/api/update-invoice/:id', async (req, res) => {
    try {
        const { customer, items, payment } = req.body;
        const existingInvoice = await InvoiceModel.findById(req.params.id);
        let updatedHistory = payment.history || (existingInvoice ? existingInvoice.payment.history : []);

        const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
            req.params.id,
            { customer, items, payment: { ...payment, history: updatedHistory } },
            { new: true }
        );
        res.json({ status: "Success", data: updatedInvoice });
    } catch (err) {
        res.status(500).json({ status: "Error", error: err.message });
    }
});

app.get('/api/invoices', async (req, res) => {
    try {
        const invoices = await InvoiceModel.find().sort({ createdAt: -1 });
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ status: 'Error', error: err.message });
    }
});

app.get('/api/due-invoices', async (req, res) => {
    try {
        const dues = await InvoiceModel.find({ "payment.due": { $gt: 0 } }).sort({ createdAt: -1 });
        res.json(dues);
    } catch (err) {
        res.status(500).json({ status: 'Error', error: err.message });
    }
});

app.delete('/api/delete-invoice/:id', async (req, res) => {
    try {
        await InvoiceModel.findByIdAndDelete(req.params.id);
        res.json({ status: 'Success' });
    } catch (err) {
        res.status(500).json({ status: 'Error', error: err.message });
    }
});

// Quotation APIs
app.post('/api/create-quotation', async (req, res) => {
    try {
        const { customer, items, payment } = req.body;
        const count = await QuotationModel.countDocuments();
        const quotationNo = "QT-" + (1000 + count + 1);

        const newQuotation = new QuotationModel({
            quotationNo: quotationNo,
            customer: customer,
            items: items,
            payment: payment
        });

        await newQuotation.save();
        res.json({ status: "Success", data: newQuotation });
    } catch (err) {
        res.status(500).json({ status: "Error", error: err.message });
    }
});

app.put('/api/update-quotation/:id', async (req, res) => {
    try {
        const updatedQuotation = await QuotationModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ status: "Success", data: updatedQuotation });
    } catch (err) {
        res.status(500).json({ status: "Error", error: err.message });
    }
});

app.get('/api/quotations', async (req, res) => {
    try {
        const quotations = await QuotationModel.find().sort({ createdAt: -1 });
        res.json(quotations);
    } catch (err) {
        res.status(500).json({ status: 'Error', error: err.message });
    }
});

app.delete('/api/delete-quotation/:id', async (req, res) => {
    try {
        await QuotationModel.findByIdAndDelete(req.params.id);
        res.json({ status: 'Success' });
    } catch (err) {
        res.status(500).json({ status: 'Error', error: err.message });
    }
});


// --- 6. Server Frontend (For Render) ---
app.use(express.static(path.join(__dirname, '../dist')));

// ✅ WILDCARD ROUTE (Must be at the very end)
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});


// --- 7. Server Start ---
const port = process.env.PORT || 3001; 
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});
