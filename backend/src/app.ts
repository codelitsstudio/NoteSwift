import Express from "express";
import mongoose from "mongoose";
import cors from "cors"
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { MainRoutes } from "routes/index.route";
import userRoutes from './routes/userRoutes';
import courseRoutes from './routes/courseRoutes';
import adminRoutes from './routes/adminRoutes';
import { DatabaseSeeder } from './services/DatabaseSeeder';
import { DatabaseMaintenanceService } from './services/DatabaseMaintenanceService';
import { MaintenanceScheduler, gracefulShutdown } from './middlewares/maintenanceMiddleware';

const app = Express();

//CONSANTS
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";


// CONNECTIONS
mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log("✔️ Connected to MongoDB");
        
        // Initialize database on startup
        await initializeDatabase();
        
        INIT();
    })
    .catch(err => {
        console.error("❌ Failed to connect to MongoDB:", err);
        process.exit(1); // Exit if connection fails
    });

/**
 * Initialize database with seeding and maintenance
 */
async function initializeDatabase() {
    try {
        console.log('🚀 Initializing database...');
        
        // Perform health check
        const healthCheck = await DatabaseMaintenanceService.performHealthCheck();
        console.log(`📊 Database health: ${healthCheck.overall.toUpperCase()}`);
        
        // Perform maintenance if needed
        if (healthCheck.overall !== 'healthy') {
            console.log('🔧 Performing database maintenance...');
            await DatabaseMaintenanceService.performMaintenance();
        }
        
        // Seed database with essential data
        await DatabaseSeeder.seedDatabase();
        
        // Validate database integrity
        await DatabaseSeeder.validateDatabase();
        
        console.log('✅ Database initialization completed successfully');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        // Don't exit here - let the app start but log the error
        console.log('⚠️ App will continue but some features may not work properly');
    }
}




//Middlewares
app.use(cookieParser());
// Increase payload limit for image uploads
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
    origin: "*",
    credentials: true
}))

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`🔍 Incoming request: ${req.method} ${req.url} from ${req.ip}`);
    next();
});

//api
app.get("/", (req, res) => {
    console.log('🏠 Root endpoint hit from:', req.ip);
    res.json({ message: "Backend root is working!", port: PORT });
});

app.get("/api/test", (req, res) => {
    console.log('🧪 Test endpoint hit from:', req.ip);
    res.json({ message: "API test endpoint working!", timestamp: new Date().toISOString() });
});

console.log('🔧 Mounting main routes at /api...');
app.use("/api", MainRoutes)
console.log('🔧 Main routes mounted successfully');

app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);

async function INIT() {
    app.listen(Number(PORT), '0.0.0.0', () => {
        console.log("Listening on port " + PORT + " on all interfaces....")
        console.log('🔍 Server accessible at:');
        console.log('  - Local: http://localhost:5000/');
        console.log('  - Network: http://192.168.1.172:5000/');
        console.log('🔍 API endpoints:');
        console.log('  - http://192.168.1.172:5000/api/ping');
        console.log('  - http://192.168.1.172:5000/api/student/user/me');
        
        // Start periodic maintenance
        MaintenanceScheduler.startPeriodicMaintenance();
        
        // Setup graceful shutdown
        gracefulShutdown();
        
        console.log("🚀 NoteSwift Backend is ready!");
    })
}