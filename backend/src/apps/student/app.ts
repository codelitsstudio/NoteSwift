import Express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { MainRoutes } from "./routes/index.route";
import userRoutes from './routes/userRoutes';
import courseRoutes from './routes/courseRoutes';
import adminRoutes from './routes/adminRoutes';
import downloadsRouter from './routes/downloads';
import { DatabaseSeeder } from './services/DatabaseSeeder';
import { DatabaseMaintenanceService } from './services/DatabaseMaintenanceService';
import { MaintenanceScheduler, gracefulShutdown } from './middlewares/maintenanceMiddleware';

const app = Express();

//CONSANTS
const PORT = process.env.PORT || 5000;


// CONNECTIONS - Database connection now handled in main index.ts
initializeDatabase();

// Setup routes after database initialization
setupRoutes();


/**
 * Initialize database with seeding and maintenance
 */
async function initializeDatabase() {
    try {
        // console.log('🚀 Initializing database...');

        // Perform health check
        const healthCheck = await DatabaseMaintenanceService.performHealthCheck();
        // console.log(`📊 Database health: ${healthCheck.overall.toUpperCase()}`);

        // Perform maintenance if needed
        if (healthCheck.overall !== 'healthy') {
            // console.log('🔧 Performing database maintenance...');
            await DatabaseMaintenanceService.performMaintenance();
        }

        // Seed database with essential data
        await DatabaseSeeder.seedDatabase();

        // Validate database integrity
        await DatabaseSeeder.validateDatabase();

        // console.log('✅ Database initialization completed successfully');

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        // Don't exit here - let the app start but log the error
        // console.log('⚠️ App will continue but some features may not work properly');
    }
}

/**
 * Setup routes for the student app
 */
function setupRoutes() {
    //Middlewares
    app.use(cookieParser());
    // Increase payload limit for image uploads
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

    // Add request logging middleware
    // app.use((req, res, next) => {
    //     console.log(`🔍 Incoming request: ${req.method} ${req.url} from ${req.ip}`);
    //     next();
    // });

    //api
    app.get("/", (req, res) => {
        // console.log('🏠 Root endpoint hit from:', req.ip);
        res.json({ message: "Backend root is working!", port: PORT });
    });

    app.get("/test", (req, res) => {
        // console.log('🧪 Test endpoint hit from:', req.ip);
        res.json({ message: "API test endpoint working!", timestamp: new Date().toISOString() });
    });

    // console.log('🔧 Mounting main routes at /...');
    app.use("/", MainRoutes)
    // console.log('🔧 Main routes mounted successfully');

    app.use('/users', userRoutes);
    app.use('/courses', courseRoutes);
    // app.use('/api/admin', adminRoutes); // Removed - admin routes are handled by the admin app
    app.use('/api/downloads', downloadsRouter);
}

// Remove the INIT function and app.listen() call
// The main index.ts will handle server startup

export default app;