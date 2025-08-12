import { Teacher as TeacherModel } from "models/teacher/teacher.model";
import JsonResponse from "lib/Response";
import { Controller } from "types/controller";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import  { Teacher } from "@shared/api/teacher/Teacher"

const secret = process.env.SESSION_SECRET as string;

const expiresIn = 60 * 60 * 24 * 14 * 1000;
const options = { maxAge: expiresIn, httpOnly: false };

export const signupTeacher: Controller = async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const {
      full_name,
      email,
      password,
      profile_pic,
      phone_number,
      designation,
      grades_taught,
      years_of_experience,
    }: Teacher.Req = req.body;

    if (
      !full_name ||
      !email ||
      !password ||
      !phone_number ||
      !designation ||
      !grades_taught ||
      !Array.isArray(grades_taught)
    ) {
      return jsonResponse.clientError("Missing required fields.");
    }

    const existingTeacher = await TeacherModel.findOne({
      $or: [{ email }, { phone_number }],
    });

    if (existingTeacher) {
      return jsonResponse.clientError("Email or phone number already exists.");
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newTeacher = new TeacherModel({
      full_name,
      email,
      password: hashedPassword,
      profile_pic: profile_pic || null,
      phone_number,
      designation,
      grades_taught,
      years_of_experience: years_of_experience || 0,
    });

    await newTeacher.save();

   
    const { password: _, ...safeData } = newTeacher.toObject();

    return jsonResponse.success("Teacher registered successfully", safeData);
  } catch (error) {
    console.error(error);
    return jsonResponse.serverError("Something went wrong during signup.");
  }
};

export const login: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);

   try {
    const { email, password } = req.body;

    const teachetExist = await TeacherModel.findOne({email: email});

    if(!teachetExist) {
      return jsonResponse.clientError("Teacher not exist by the email.");
    }

    const isPasswordMatch = await bcrypt.compare(password, teachetExist.password);

    if(!isPasswordMatch) {
      return jsonResponse.notAuthorized("Please provie the correct password.");
    }

     const token = jwt.sign({ teacher_id: teachetExist._id.toString() }, secret, {
                expiresIn: "10d"
            });
    
    res.cookie("session", token, options);
    

    const teacher = await TeacherModel.findById({_id: teachetExist._id}).select("-password");

    return jsonResponse.success("Login in successfully.", teacher);
   } catch (error) {
    console.error(error);
    return jsonResponse.serverError();
   }
}


export const logout: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);

   try {

    const teacher = res.locals.teacher;
    console.log(teacher);

    if(!teacher || !teacher._id) {
      return jsonResponse.notAuthorized("Please login first.");
    }

     res.clearCookie("session");

     return jsonResponse.success("Logout successfully.");
    
   } catch (error) {
    console.error(error);
    return jsonResponse.serverError();
   }
}

export const teacherDetails: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);

   try {
    const teacher = res.locals.teacher;
    console.log(teacher);

    if(!teacher || !teacher._id) {
      return jsonResponse.notAuthorized("Please login first.");
    }

    const teacherE = await TeacherModel.findById({_id: teacher._id}).select("-password");

    if(!teacherE) {
      return jsonResponse.notAuthorized("You are not authorized for this.");
    }

    return jsonResponse.success("Teacher details retrieved successfully.", teacherE);
    
   } catch (error) {
    console.error(error);
    return jsonResponse.serverError();
   }
}

export const boilerplate: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);

   try {
    
   } catch (error) {
    console.error(error);
    return jsonResponse.serverError();
   }
}