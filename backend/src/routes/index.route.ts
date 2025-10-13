import { Router } from "express";
import { StudentAuthRoute } from "./student/auth.route";
import { StudentLearnRoutes } from "./student/learn.route";
import { authenticateStudent } from "../middlewares/student.middleware";
import { StudentUserRoutes } from "./student/user.route";
import { AdminAuthRoutes } from "./admin/auth.route";
import { AdminRoutes } from "./admin/index";
import courseRoutes from "./courseRoutes";
import notificationRoutes from "./notificationRoutes";
import mongoose from "mongoose";

const router = Router();

// Temporary route to fix database index issue
router.get("/fix-db", async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const studentsCollection = db!.collection('students');
        
        // Try to drop the phone_number_1 index
        try {
            await studentsCollection.dropIndex('phone_number_1');
            console.log('✅ Successfully dropped phone_number_1 index');
        } catch (error: any) {
            console.log('Index may not exist:', error.message);
        }
        
        // List remaining indexes
        const indexes = await studentsCollection.listIndexes().toArray();
        console.log('Remaining indexes:');
        indexes.forEach(idx => console.log(`  - ${idx.name}`));
        
        res.json({ success: true, message: 'Database index fixed', indexes });
    } catch (error: any) {
        res.json({ success: false, error: error.message });
    }
});

//student
console.log('🔧 Registering student routes...');

// Test endpoint for connectivity
router.get("/ping", (req, res) => {
    console.log('🏓 PING endpoint hit from:', req.ip);
    res.json({ message: "Backend is reachable!", timestamp: new Date().toISOString() });
});

console.log('🔧 Ping route registered at /ping');

router.use("/student/auth", StudentAuthRoute);
router.use("/student/learn", StudentLearnRoutes);
router.use("/student/user", authenticateStudent, StudentUserRoutes);

// Course routes
router.use("/courses", courseRoutes);

// Notification routes
router.use("/notifications", notificationRoutes);

//admin
router.use("/admin", AdminRoutes);

export { router as MainRoutes };