const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Verificar variables de entorno
console.log('🔧 Variables de entorno:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Configurado' : 'No configurado');
console.log('PORT:', process.env.PORT || 3000);

// Conectar a MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/roci-points';
console.log('🗄️ Conectando a MongoDB:', mongoURI.includes('mongodb+srv') ? 'Atlas' : 'Local');

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
    console.log('✅ Conectado a MongoDB');
});

// Esquemas de MongoDB
const memberSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    score: { type: Number, default: 0 }
});

const historySchema = new mongoose.Schema({
    memberId: { type: String, required: true },
    memberName: { type: String, required: true },
    points: { type: Number, required: true },
    type: { type: String, enum: ['add', 'subtract'], required: true },
    comment: { type: String, default: '' },
    assignedBy: { type: String, required: true },
    assignedByColor: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    timeString: { type: String, required: true }
});

const settingsSchema = new mongoose.Schema({
    defaultAddPoints: { type: Number, default: 1 },
    defaultSubtractPoints: { type: Number, default: 1 },
    autoSave: { type: Boolean, default: true },
    showNotifications: { type: Boolean, default: true }
});

const Member = mongoose.model('Member', memberSchema);
const History = mongoose.model('History', historySchema);
const Settings = mongoose.model('Settings', settingsSchema);

// Inicializar datos por defecto
async function initializeDefaultData() {
    try {
        // Verificar si ya existen miembros
        const memberCount = await Member.countDocuments();
        if (memberCount === 0) {
            const defaultMembers = [
                { id: 'rocio', name: 'Rocío', score: 0 },
                { id: 'javiera', name: 'Javiera', score: 0 },
                { id: 'juan-felipe', name: 'Juan Felipe', score: 0 },
                { id: 'daniel', name: 'Daniel', score: 0 },
                { id: 'alvaro', name: 'Alvaro', score: 0 }
            ];
            await Member.insertMany(defaultMembers);
            console.log('✅ Miembros por defecto creados');
        }

        // Verificar si ya existen configuraciones
        const settingsCount = await Settings.countDocuments();
        if (settingsCount === 0) {
            await Settings.create({
                defaultAddPoints: 1,
                defaultSubtractPoints: 1,
                autoSave: true,
                showNotifications: true
            });
            console.log('✅ Configuración por defecto creada');
        }
    } catch (error) {
        console.error('Error al inicializar datos:', error);
    }
}

// Rutas API
app.get('/api/members', async (req, res) => {
    try {
        const members = await Member.find().sort({ score: -1 });
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener miembros' });
    }
});

app.get('/api/history', async (req, res) => {
    try {
        const history = await History.find().sort({ timestamp: -1 }).limit(100);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener historial' });
    }
});

app.get('/api/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({
                defaultAddPoints: 1,
                defaultSubtractPoints: 1,
                autoSave: true,
                showNotifications: true
            });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener configuración' });
    }
});

app.post('/api/members/:id/points', async (req, res) => {
    try {
        const { id } = req.params;
        const { points, type, comment, assignedBy, assignedByColor } = req.body;
        
        console.log('🔍 Debug - Servidor recibió:', { assignedBy, assignedByColor });

        const member = await Member.findOne({ id });
        if (!member) {
            return res.status(404).json({ error: 'Miembro no encontrado' });
        }

        // Actualizar puntuación
        if (type === 'add') {
            member.score += points;
        } else {
            member.score -= points;
        }
        await member.save();

        // Agregar al historial
        const historyEntry = new History({
            memberId: id,
            memberName: member.name,
            points: points,
            type: type,
            comment: comment || '',
            assignedBy: assignedBy || 'Anónimo',
            assignedByColor: assignedByColor || '#95a5a6',
            timestamp: new Date(),
            timeString: new Date().toLocaleTimeString()
        });
        await historyEntry.save();

        res.json({ success: true, member, historyEntry });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar puntos' });
    }
});

app.put('/api/members/reset', async (req, res) => {
    try {
        await Member.updateMany({}, { score: 0 });
        res.json({ success: true, message: 'Puntuaciones reiniciadas' });
    } catch (error) {
        res.status(500).json({ error: 'Error al reiniciar puntuaciones' });
    }
});

app.put('/api/settings', async (req, res) => {
    try {
        const { defaultAddPoints, defaultSubtractPoints, autoSave, showNotifications } = req.body;
        let settings = await Settings.findOne();
        
        if (!settings) {
            settings = new Settings();
        }
        
        settings.defaultAddPoints = defaultAddPoints;
        settings.defaultSubtractPoints = defaultSubtractPoints;
        settings.autoSave = autoSave;
        settings.showNotifications = showNotifications;
        
        await settings.save();
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar configuración' });
    }
});

app.delete('/api/history', async (req, res) => {
    try {
        await History.deleteMany({});
        res.json({ success: true, message: 'Historial limpiado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al limpiar historial' });
    }
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Inicializar datos y arrancar servidor
initializeDefaultData().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor RociPoints ejecutándose en puerto ${PORT}`);
        console.log(`📊 API disponible en http://localhost:${PORT}/api`);
        console.log(`🌐 Aplicación web en http://localhost:${PORT}`);
    });
}); 