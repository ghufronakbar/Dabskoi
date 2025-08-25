import express from "express";
import { AdminChatController } from "../../controllers/admin/AdminChatController";
import { useValidate } from "../../middleware/use-validate";
import {
  AdminReplyNegoRequestSchema,
  AdminSendMessageSchema,
} from "../../validators/ChatValidator";

const chatController = new AdminChatController();
const chatRouter = express.Router();

chatRouter.get("/", chatController.getChats);
chatRouter.get("/:id", chatController.getChatByUser);
chatRouter.post(
  "/",
  useValidate({ body: AdminSendMessageSchema }),
  chatController.sendMessage
);
chatRouter.post(
  "/nego",
  useValidate({ body: AdminReplyNegoRequestSchema }),
  chatController.replyNegoRequest
);

export default chatRouter;
