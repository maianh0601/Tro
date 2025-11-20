import HinhAnhPhongModel from "../models/HinhAnhPhongModel";

export const normalizeImageList = (
  input?: string | string[]
): string[] => {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return input.map((item) => item?.trim()).filter(Boolean) as string[];
  }

  return input
    .split(",")
    .map((item) => item.trim())
    .filter((item) => !!item);
};

export const syncRoomImages = async (
  ma_phong: string,
  images: string[]
) => {
  await HinhAnhPhongModel.deleteMany({ ma_phong });

  if (!images.length) {
    return;
  }

  const documents = images.map((image_url) => ({
    ma_phong,
    image_url,
  }));

  await HinhAnhPhongModel.insertMany(documents);
};

