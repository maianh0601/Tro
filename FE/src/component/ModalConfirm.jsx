import { useDispatch, useSelector } from "react-redux";
import { closeConfirmModal } from "../Store/filterConfirmModal";
import { axiosInstance } from "../../Axios";
import { toast } from "react-toastify";

function ModalConFirm({ id, reload }) {
  const dispatch = useDispatch();
  const { modalType, idModal, isOpen } = useSelector(
    (state) => state.confirmModal
  );
  const handleDelete = async (id) => {
    const res = await axiosInstance.delete(`/map/deleteMap/${id}`);
    if (res.data.message) {
      toast.success("Xóa map thành công");
    }
  };
  const handleDeleteRepair = async (ids) => {
    await axiosInstance.delete(`/sua_chua/Delete/${ids}`);
  };

  const handleConfirm = async () => {
    console.log("idModal", idModal);
    if (modalType === "delete") {
      await handleDelete(idModal);
    }
    if (modalType === "Repair") {
      await handleDeleteRepair(idModal);
    }
    reload();
    dispatch(closeConfirmModal());
  };

  return (
    <div>
      {isOpen && idModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-medium">
              {modalType === "delete" || "Repair"
                ? "Bạn có chắc chắn muốn xóa?"
                : "Bạn có muốn lưu này?"}
            </p>
            <div className="flex justify-center gap-5 mt-4">
              <button
                className="text-lg text-red-500 rounded-lg px-4 py-2"
                onClick={handleConfirm}
              >
                {modalType === "delete" || "Repair" ? "Xóa" : "Lưu"}
              </button>
              <button
                className="text-lg border border-gray-500 rounded-lg px-4 py-2 ml-2"
                onClick={() => dispatch(closeConfirmModal())}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModalConFirm;
