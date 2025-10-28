import { Router } from "express";
import { authenticateTeacher } from "../../middlewares/teacher.middleware";
import JsonResponse from "@student/lib/Response";

const router = Router();

// Get current teacher profile
router.get("/me", authenticateTeacher, async (req, res) => {
    const jsonResponse = new JsonResponse(res);

    try {
        const teacher = res.locals.teacher;

        if (!teacher) {
            return jsonResponse.notAuthorized("Teacher not found");
        }

        // Return teacher profile data
        jsonResponse.success({
            teacher: {
                _id: teacher._id,
                fullName: teacher.fullName,
                email: teacher.email,
                phone: teacher.phone,
                profilePhoto: teacher.profilePhoto,
                verificationDocuments: teacher.verificationDocuments,
                assignedCourses: teacher.assignedCourses || [],
                isVerified: teacher.isVerified,
                registrationStatus: teacher.registrationStatus || 'pending',
                onboardingStep: teacher.onboardingStep || 'completed', // Default to completed if not set
                createdAt: teacher.createdAt,
                updatedAt: teacher.updatedAt
            }
        });
    } catch (error) {
        console.error("Error fetching teacher profile:", error);
        jsonResponse.serverError("Failed to fetch teacher profile");
    }
});

export { router as TeacherAuthRoutes };