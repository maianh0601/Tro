import { useState, useEffect } from "react";
import CitySelector from "./CitySelector";
import CardRoom from "../CardRoom";
import { usePhongTro } from "../../Context/PhongTroContext";

function Category() {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [products, setProducts] = useState([]);
  const { phongTro } = usePhongTro();

  useEffect(() => {
    if (!selectedCategoryId || phongTro.length === 0) return;
    const filteredProducts = phongTro.filter(
      (product) => product.ma_danh_muc === selectedCategoryId
    );
    setProducts(filteredProducts);
  }, [selectedCategoryId, phongTro]);

  return (
    <div className="mt-[40px]">
      <div className="items-end">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[#23274A] font-bold text-2xl">Mục lục</p>
            <CitySelector onSelectCity={setSelectedCategoryId} />
          </div>
          <div className="w-[117px] h-[4px] bg-[#FEBB02] mt-8"></div>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="mt-8 min-h-[200px]">
        <div className="max-w-full mt-[33px] grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
          {products.length > 0 ? (
            products.slice(0, 5).map((product, index) => (
              <div key={index}>
                <CardRoom
                  id={product.ma_phong}
                  price={product.gia_tien}
                  title={product.ten_phong_tro}
                  img={product.anh_phong}
                  number={product.so_luong_nguoi}
                  dien_tich={product.dien_tich}
                  address={product.mapDetail?.address}
                  district={product.mapDetail?.district}
                  province={product.mapDetail?.province}
                  ward={product.mapDetail?.ward}
                />
              </div>
            ))
          ) : (
            <p className="text-3xl font-bold text-center w-full mx-auto">
              Không có phòng trọ nào.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Category;
