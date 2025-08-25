import express from "express";
import { AdminKoiController } from "../../controllers/admin/AdminKoiController";
import { useValidate } from "../../middleware/use-validate";
import { CreateAuctionSchema } from "../../validators/AuctionValidator";
import { CreateNegoSchema } from "../../validators/NegoValidator";
import { CreateSellSchema } from "../../validators/SellValidator";

const koiController = new AdminKoiController();
const koiRouter = express.Router();

koiRouter.get("/sells", koiController.sells);
koiRouter.get("/negos", koiController.negos);
koiRouter.get("/auctions", koiController.auctions);

koiRouter.get("/sells/:id", koiController.detailSell);
koiRouter.get("/negos/:id", koiController.detailNego);
koiRouter.get("/auctions/:id", koiController.detailAuction);

koiRouter.post(
  "/sells",
  useValidate({ body: CreateSellSchema }),
  koiController.createSell
);
koiRouter.post(
  "/negos",
  useValidate({ body: CreateNegoSchema }),
  koiController.createNego
);
koiRouter.post(
  "/auctions",
  useValidate({ body: CreateAuctionSchema }),
  koiController.createAuction
);

koiRouter.delete("/sells/:id", koiController.deleteSell);
koiRouter.delete("/negos/:id", koiController.deleteNego);
koiRouter.delete("/auctions/:id", koiController.deleteAuction);

export default koiRouter;
