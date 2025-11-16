import { Request, Response } from "express";
import { SuaChuaService } from "../services/SuaChuaService";

const suaChuaService = new SuaChuaService(); // Singleton instance

export const createSuaChua = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { user }: any = req;
    const data = req.body;
    const suaChua = await suaChuaService.CreateSuachua(user, data);
    return res.status(200).json({ suaChua });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSuaChua = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const suaChua = await suaChuaService.UpdateSuachua(id, data);
    return res.status(200).json({ suaChua });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteSuaChua = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    await suaChuaService.DeleteSuachua(id);
    return res.status(200).json({ message: "Delete successfully!!!" });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getAllSuaChua = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const data = await suaChuaService.GetAllSuachua();
    return res.status(200).json({ data });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const UpdateStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const suaChua = await suaChuaService.UpdateStatus(id, status);
    return res.status(200).json({ suaChua });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const GetSuaChuaById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { user }: any = req;
    const suaChua = await suaChuaService.GetSuachuaById(user.id);
    return res.status(200).json({ suaChua });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
