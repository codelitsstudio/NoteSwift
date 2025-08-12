import { Student } from "models/students/Student.model";
import { Admin } from "models/admins/Admin.model";
import JsonResponse from "lib/Response";
import { Controller } from "types/controller";
import { json } from "express";

export const getAllStudnet: Controller = async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {

    const students = await Student.find();
return jsonResponse.success(students, "Data retrieve successfully.");

  } catch (error) {
    console.error(error);
    return jsonResponse.serverError();
  }
};

export const getStudentsById: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);

   try {
    const id = req.params.id;

    if(!id) {
        return jsonResponse.clientError("student is reuqied to retrieve the students.");
    }

    const student = await Student.findById(id);

    if(!student) {
        return jsonResponse.notFound("Student is not found by the given id.");
    }

    console.log(student);

    return jsonResponse.success(student,"Student retrieve successfully.")
   } catch (error) {
    console.error(error);
    return jsonResponse.serverError();
   }
}
