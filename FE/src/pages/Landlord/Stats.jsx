import { useState } from "react";
import YeuThichStats from "./Stats/YeuThichStats";
import DanhGiaStats from "./Stats/DanhGiaStats";
import DienNangStats from "./Stats/DienNangStats";

function Stats() {
  const [activeTab, setActiveTab] = useState("yeuthich");

  const tabs = [
    { id: "yeuthich", label: "Yêu Thích", icon: "❤️" },
    { id: "danhgia", label: "Đánh Giá", icon: "⭐" },
    { id: "diennang", label: "Điện Năng", icon: "⚡" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Thống Kê Phòng Trọ
        </h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-2">
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === "yeuthich" && <YeuThichStats />}
          {activeTab === "danhgia" && <DanhGiaStats />}
          {activeTab === "diennang" && <DienNangStats />}
        </div>
      </div>
    </div>
  );
}

export default Stats;

