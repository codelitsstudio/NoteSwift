import { Router } from "express";
import {
  getAuditLogs,
  getEntityAuditLogs,
  getAuditLogStats,
  cleanupOldLogs
} from "controller/admin/auditLog.controller";

const router = Router();

router.route("/").get(getAuditLogs);

router.route("/entity/:entityType/:entityId").get(getEntityAuditLogs);

router.route("/stats").get(getAuditLogStats);

router.route("/cleanup").delete(cleanupOldLogs);

export default router;
