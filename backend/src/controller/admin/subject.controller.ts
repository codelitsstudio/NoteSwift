
import JsonResponse from "lib/Response";
import { Controller } from "types/controller";
import { Subject } from "@shared/api/admin/subject";
import { Subject as SubjectModel } from "models/admins/Subject.model";
import { Admin } from "models/admins/Admin.model";

export const createSubject: Controller = async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {



    const { subject_name }: Subject.Req = req.body;

    if (!subject_name) {
      return jsonResponse.clientError("Subject required to add.");
    }

    const subject = await SubjectModel.create({
      subject_name,
    });

    return jsonResponse.success(subject, "Subject created successfully.");
  } catch (error) {
    console.log(error);
    jsonResponse.serverError();
  }
};

export const updateSubject: Controller = async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {

    const id = req.params.id as string;
    const { subject_name }: Subject.Req = req.body;

    if (!id) {
      return jsonResponse.clientError("Subject id is required for update.");
    }

    if (!subject_name) {
      return jsonResponse.clientError("Subject name is required for PUT update.");
    }

    const subjectExist = await SubjectModel.findById(id);

    if (!subjectExist) {
      return jsonResponse.notFound("Subject not found by the provided id.");
    }

    
    subjectExist.subject_name = subject_name;

    const updatedSubject = await subjectExist.save();

    return jsonResponse.success(updatedSubject, "Subject updated successfully.");
  } catch (error) {
    console.error(error);
    jsonResponse.serverError();
  }
};

export const all: Controller = async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {

    const subjects = await SubjectModel.find();

    return jsonResponse.success(subjects, "Subject retrieved successfully.");
  } catch (error) {
    console.error(error);
    jsonResponse.serverError();
  }
};

export const getById: Controller = async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
   


    const id = req.params.id as string;

    if (!id) {
      return jsonResponse.clientError("Subject id is required for update.");
    }

    // need to improvied possibly aggregate with other model to get all specifi details link to subject
    const subjectExist = await SubjectModel.findById(id);

    if (!subjectExist) {
      return jsonResponse.notFound("Subject not found by the provided id.");
    }

    return jsonResponse.success(subjectExist, "Subject retrieved successfully.");
  } catch (error) {
    console.error(error);
    jsonResponse.serverError();
  }
};

export const deleteSubject: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);

    try {


        const id = req.query.id as string;

         if (!id) {
      return jsonResponse.clientError("Subject id is required for update.");
    }

    const subjectExist = await SubjectModel.findById(id);

    if (!subjectExist) {
      return jsonResponse.notFound("Subject not found by the provided id.");
    }

    await SubjectModel.findByIdAndDelete(id);

    return jsonResponse.success("Subject deleted successfully.");
    } catch (error) {
        console.log(error);
        jsonResponse.serverError();
    }
}



