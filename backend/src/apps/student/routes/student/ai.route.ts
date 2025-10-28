import { Router } from "express";
import { AIController } from "../../controllers/aiController";
import { ChatHistoryController } from "../../controllers/ChatHistoryController";
import { authenticateStudent } from "../../middlewares/student.middleware";

const router = Router();

// AI Chat endpoint - requires authentication
router.post("/chat", authenticateStudent, AIController.chat);

// Chat History endpoints
router.post("/history", authenticateStudent, ChatHistoryController.saveChat);
router.get("/history", authenticateStudent, ChatHistoryController.getChatHistory);
router.get("/history/:chatId", authenticateStudent, ChatHistoryController.getChat);
router.delete("/history/:chatId", authenticateStudent, ChatHistoryController.deleteChat);

export { router as AIRoutes };