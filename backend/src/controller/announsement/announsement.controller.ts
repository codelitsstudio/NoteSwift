import { Controller } from "types/controller";
import { Announcement } from "@shared/api/admin/announcement";
import { Announcement as AnnouncementModel } from "models/announcement.model";
import JsonResponse from "lib/Response";

export const postAnnouncement: Controller = async (req, res) => {
  const jsonReesponse = new JsonResponse(res);
  try {
    const { subject, message }: Announcement.Req = req.body;

    if (!subject || !message) {
      return jsonReesponse.clientError("Subject and message are required.");
    }

    const announcement = new AnnouncementModel({
      subject,
      message,
    });

    await announcement.save();

    return jsonReesponse.success(announcement);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      return jsonReesponse.serverError(error.message);
    }
    return jsonReesponse.serverError();
  }
};

export const updateAnnouncement: Controller = async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const id: string = req.params.id;

    const { subject, message }: Partial<Announcement.Req> = req.body;
    // console.log(req.body);

    const existAnnounement = await AnnouncementModel.findById(id);

    if (!id) {
      return jsonResponse.clientError("Announcement id required to update.");
    }

    if (!existAnnounement) {
      return jsonResponse.notFound("Announcement is not found by id");
    }

    const updateData: Partial<Announcement.Req> = {};

    if (subject) updateData.subject = subject;
    if (message) updateData.message = message;

    if (Object.keys(updateData).length === 0) {
      return jsonResponse.clientError("No fields provided for update.");
    }

    const updatedAnnouncement = await AnnouncementModel.findByIdAndUpdate(
      id,

      {
        $set: updateData,
      },
      {
        new: true,
      }
    );

    if (!updatedAnnouncement) {
      return jsonResponse.clientError("Announcement not found.");
    }

    console.log("updated:", updatedAnnouncement);
    return jsonResponse.success(updatedAnnouncement);
  } catch (error) {
    console.log(error);
    jsonResponse.serverError();
  }
};

export const deleteAnnouncement: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);

    try {
        const id = req.query.id as string | undefined;

        if(!id) {
            return jsonResponse.clientError("Announcement id is required to delete.");
        }

        const announcementExist = await AnnouncementModel.findById(id);

        if(!announcementExist) {
            return jsonResponse.notFound("Announcement not found.");
        }

        await AnnouncementModel.findByIdAndDelete(id);

        return jsonResponse.success();
    } catch (error) {
        console.log(error);
        jsonResponse.serverError();
    }
}

export const getAnnouncement: Controller = async (req, res) => {
    const jsonResponse = new JsonResponse(res);

    try {
        const announcements = await AnnouncementModel.find();
        return jsonResponse.success(announcements);
    } catch (error) {
        console.log(error);
        jsonResponse.serverError()
    }
}
