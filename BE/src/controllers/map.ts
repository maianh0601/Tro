import { Request, Response } from "express";
import MapService from "../services/Map";

const mapServiceInstance = new MapService();
export const CreateMap = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    await mapServiceInstance.CreateMap(data);
    
    res.status(200).json({
      message: "Create successfully!!!",
    });
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};
export const UpdateMap = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const formData = req.body;
    await mapServiceInstance.UpdateMap(id, formData);
    res.status(200).json({
      message: "Update successfully!!!",
      id: id,
      data: formData,
    });
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const DeleteMap = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await mapServiceInstance.DeleteMap(id);
    res.status(200).json({
      message: "Delete successfully!!!",
    });
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const GetAllMap = async (req: Request, res: Response) => {
  try {
    const data = await mapServiceInstance.GetAllMap();
    res.status(200).json({
      message: "GetAll successfully!!!",
      data: data,
    });
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};
