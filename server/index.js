const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); 
require('dotenv').config(); 

const app = express();
app.use(express.json({ limit: '10mb' })); // বড় ইমেজ আপলোডের জন্য limit বাড়ানো হয়েছে
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

// ✅ Admin Profile Model (নতুন যুক্ত করা হয়েছে)
const AdminSchema = new mongoose.Schema({
    name: { type: String, default: 'Mehedi Hasan' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' }, // Base64 ইমেজ স্টোর হবে
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


// --- 3. API ROUTES ---

// Login API
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username: username });
    if(user && user.pass === password) {
        res.json("Success");
    } else {
        res.json("Wrong password");
    }
});


// =============================================
// ✅ ADMIN PROFILE APIs (নতুন যুক্ত করা হয়েছে)
// =============================================

// Get Admin Profile
app.get('/admin-profile', async (req, res) => {
    try {
        let admin = await AdminModel.findOne();
        
        // যদি কোনো Admin ডাটা না থাকে, তাহলে ডিফল্ট তৈরি করবে
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
        console.error("Admin Profile Get Error:", error);
        res.status(500).json({ error: 'Failed to get admin profile' });
    }
});

// Update Admin Profile
app.put('/admin-profile', async (req, res) => {
    try {
        const { name, email, phone, avatar } = req.body;
        
        let admin = await AdminModel.findOne();
        
        if (!admin) {
            // Admin না থাকলে নতুন তৈরি হবে
            admin = await AdminModel.create({
                name: name || 'Mehedi Hasan',
                email: email || '',
                phone: phone || '',
                avatar: avatar || '',
                role: 'Admin'
            });
        } else {
            // আপডেট করবে
            admin.name = name || admin.name;
            admin.email = email || admin.email;
            admin.phone = phone || admin.phone;
            if (avatar !== undefined) {
                admin.avatar = avatar;
            }
            await admin.save();
        }
        
        res.json(admin);
    } catch (error) {
        console.error("Admin Profile Update Error:", error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Change Password
app.put('/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // User খুঁজে বের করা (ডিফল্ট admin ইউজার)
        const user = await UserModel.findOne({ username: 'admin' });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Current Password চেক করা
        if (user.pass !== currentPassword) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        
        // নতুন পাসওয়ার্ড সেট করা
        user.pass = newPassword;
        await user.save();
        
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});


// --- Product APIs ---

app.post('/add-product', async (req, res) => {
    try {
        const newProduct = await ProductModel.create(req.body);
        res.json({ status: "Success", data: newProduct });
    } catch (err) {
        res.status(500).json({ status: "Error", error: err.message });
    }
});

app.get('/products', async (req, res) => {
    try {
        const products = await ProductModel.find().sort({ date: -1 });
        res.json(products);
    } catch (err) {
        res.json({ error: err.message });
    }
});

app.put('/update-product/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = await ProductModel.findByIdAndUpdate(id, req.body, { new: true });
        res.json({ status: "Success", data: updatedProduct });
    } catch (err) {
        res.json({ status: "Error", error: err.message });
    }
});

app.delete('/delete-product/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await ProductModel.findByIdAndDelete(id);
        res.json({ status: "Success" });
    } catch (err) {
        res.json({ status: "Error", error: err.message });
    }
});

// --- Customer APIs ---

app.post('/add-customer', async (req, res) => {
    try {
        const newCustomer = await CustomerModel.create(req.body);
        res.json({ status: "Success", data: newCustomer });
    } catch (err) {
        res.status(500).json({ status: "Error", error: err.message });
    }
});

app.get('/customers', async (req, res) => {
    try {
        const customers = await CustomerModel.find().sort({ date: -1 });
        res.json(customers);
    } catch (err) {
        res.json({ error: err.message });
    }
});

app.put('/update-customer/:id', async (req, res) => {
    try {
        const updated = await CustomerModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ status: "Success", data: updated });
    } catch (err) { res.json({ status: "Error", error: err.message }); }
});

app.delete('/delete-customer/:id', async (req, res) => {
    try {
        await CustomerModel.findByIdAndDelete(req.params.id);
        res.json({ status: "Success" });
    } catch (err) { res.json({ status: "Error", error: err.message }); }
});


// --- 4. INVOICE API ---

app.post('/create-invoice', async (req, res) => {
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
            payment: {
                ...payment,
                history: initialHistory 
            }
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
        console.error("Invoice Create Error:", err);
        res.status(500).json({ status: "Error", error: err.message });
    }
});

app.put('/update-invoice/:id', async (req, res) => {
    try {
        const { customer, items, payment } = req.body;
        
        const existingInvoice = await InvoiceModel.findById(req.params.id);
        
        let updatedHistory = payment.history;

        if (!updatedHistory && existingInvoice) {
             updatedHistory = existingInvoice.payment.history;
        }

        const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
            req.params.id,
            { 
                customer, 
                items, 
                payment: {
                    ...payment,
                    history: updatedHistory
                } 
            },
            { new: true }
        );
        res.json({ status: "Success", data: updatedInvoice });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ status: "Error", error: err.message });
    }
});

app.get('/invoices', async (req, res) => {
    try {
        const invoices = await InvoiceModel.find().sort({ createdAt: -1 });
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ status: 'Error', error: err.message });
    }
});

app.get('/due-invoices', async (req, res) => {
    try {
        const dues = await InvoiceModel.find({ "payment.due": { $gt: 0 } }).sort({ createdAt: -1 });
        res.json(dues);
    } catch (err) {
        res.status(500).json({ status: 'Error', error: err.message });
    }
});

app.delete('/delete-invoice/:id', async (req, res) => {
    try {
        await InvoiceModel.findByIdAndDelete(req.params.id);
        res.json({ status: 'Success' });
    } catch (err) {
        res.status(500).json({ status: 'Error', error: err.message });
    }
});


// --- 5. QUOTATION API ---

app.post('/create-quotation', async (req, res) => {
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
        console.error("Quotation Create Error:", err);
        res.status(500).json({ status: "Error", error: err.message });
    }
});

app.put('/update-quotation/:id', async (req, res) => {
    try {
        const { customer, items, payment } = req.body;
        
        const updatedQuotation = await QuotationModel.findByIdAndUpdate(
            req.params.id,
            { customer, items, payment },
            { new: true }
        );
        
        res.json({ status: "Success", data: updatedQuotation });
    } catch (err) {
        console.error("Quotation Update Error:", err);
        res.status(500).json({ status: "Error", error: err.message });
    }
});

app.get('/quotations', async (req, res) => {
    try {
        const quotations = await QuotationModel.find().sort({ createdAt: -1 });
        res.json(quotations);
    } catch (err) {
        res.status(500).json({ status: 'Error', error: err.message });
    }
});

app.delete('/delete-quotation/:id', async (req, res) => {
    try {
        await QuotationModel.findByIdAndDelete(req.params.id);
        res.json({ status: 'Success' });
    } catch (err) {
        res.status(500).json({ status: 'Error', error: err.message });
    }
});


// --- 6. Server Frontend (For Render) ---
app.use(express.static(path.join(__dirname, '../dist')));

app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});


// --- 7. Server Start ---
const port = process.env.PORT || 3001; 
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});