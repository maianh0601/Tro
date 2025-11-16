import ProductShowcase from "../../component/ProductShowcase";
import useApiManagerAdmin from "../../hook/useApiManagerAdmin";

const ProductList = () => {
  const { data: phongtro } = useApiManagerAdmin("phongTro");
  return (
    <div className="w-full">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6  lg:px-[150px] mt-10 mb-20">
        <ProductShowcase
          desc="Tất cả phòng trọ"
          data={phongtro}
          slide={false}
        />
      </div>
    </div>
  );
};

export default ProductList;
