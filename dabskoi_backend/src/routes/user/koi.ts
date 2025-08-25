import express from "express";
import { UserKoiController } from "../../controllers/user/UserKoiController";
import { useValidate } from "../../middleware/use-validate";
import { BidSchema } from "../../validators/AuctionValidator";

const koiController = new UserKoiController();
const koiRouter = express.Router();

koiRouter.get("/sells", koiController.sells);
koiRouter.get("/negos", koiController.negos);
koiRouter.get("/auctions", koiController.auctions);

koiRouter.get("/sells/:id", koiController.detailSell);
koiRouter.get("/negos/:id", koiController.detailNego);
koiRouter.get("/auctions/:id", koiController.detailAuction);

koiRouter.post(
  "/auctions/bid",
  useValidate({ body: BidSchema }),
  koiController.placeBid
);

export default koiRouter;
