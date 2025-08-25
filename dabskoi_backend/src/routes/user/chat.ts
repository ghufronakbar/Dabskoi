import express from "express";
import { UserChatController } from "../../controllers/user/UserChatController";
import { useValidate } from "../../middleware/use-validate";
import {
  UserMakeNegoRequestSchema,
  UserReferProductSchema,
  UserSendMessageSchema,
} from "../../validators/ChatValidator";

const chatController = new UserChatController();
const chatRouter = express.Router();

chatRouter.get("/", chatController.getChatByUser);

chatRouter.post(
  "/",
  useValidate({ body: UserSendMessageSchema }),
  chatController.sendMessage
);
chatRouter.post(
  "/nego",
  useValidate({ body: UserMakeNegoRequestSchema }),
  chatController.makeNegoRequest
);
chatRouter.post(
  "/refer",
  useValidate({ body: UserReferProductSchema }),
  chatController.referProduct
);

export default chatRouter;
