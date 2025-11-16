import { Router } from "express";
import {
  storeThietBi,
  updateThietBi,
  getData,
  deleteAll,
  deleteById,
} from "../controllers/thietBi";
import { authorize } from "../middlewares/authorize.middleware";
import { accessTokenAdmin } from "../middlewares/admin.middleware";

const router = Router();

router.post(
  "/create",
  accessTokenAdmin,
  authorize("67b1dfa48631e4849450bbd0"),
  storeThietBi
);
router.post(
  "/update/:id",
  accessTokenAdmin,
  authorize("67b1dfa48631e4849450bbd1"),
  updateThietBi
);
router.get(
  "/getAll",
  accessTokenAdmin,
  authorize("67b1dfa48631e4849450bbcf"),
  getData
);
router.delete(
  "/delete/all",
  accessTokenAdmin,
  authorize("67b1dfa48631e4849450bbd3"),
  deleteAll
);
router.delete(
  "/delete/:id",
  accessTokenAdmin,
  authorize("67b1dfa48631e4849450bbd2"),
  deleteById
);

export default router;
