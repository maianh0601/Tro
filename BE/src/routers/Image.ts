import { Router } from "express";
import {
  createImage,
  deleteAllImages,
  deleteImageById,
  getAllImages,
  updateImage,
} from "../controllers/ImagePhong";
import { accessTokenAdmin } from "../middlewares/admin.middleware";
import { authorize } from "../middlewares/authorize.middleware";

const routeImage = Router();
routeImage.post(
  "/create",
  accessTokenAdmin,
  authorize("67b1dfa48631e4849450bbbc"),
  createImage
);
routeImage.post(
  "/update/:id",
  accessTokenAdmin,
  authorize("67b1dfa48631e4849450bbbd"),
  updateImage
);
routeImage.get(
  "/getAll",
  accessTokenAdmin,
  authorize("67b1dfa48631e4849450bbbf"),
  getAllImages
);
routeImage.delete(
  "/delete/all",
  accessTokenAdmin,
  authorize("67d8d6e5b2276a21455150e2"),
  deleteAllImages
);
routeImage.delete(
  "/delete/:id",
  accessTokenAdmin,
  authorize("67b1dfa48631e4849450bbbe"),
  deleteImageById
);

export default routeImage;
