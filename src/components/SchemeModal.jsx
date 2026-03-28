import { useEffect, useState } from "react";
import Button from "./Button";
import { usePost } from "../hooks/usePost";
import { useToast } from "../contexts/ToastContext";
import { useGet } from "../hooks/useGet";


export const SchemeModal = ({
  showModal,
  handleModal,
  editData,
  refreshTable,
    merchant, 
  
}) => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("tab1");
  const [percentage, setPercentage] = useState(18);
  const [name, setName] = useState("");
  const [payin, setPayin] = useState({ type: "percent", amount: "" });
  const [payout, setPayout] = useState({
    below700: { type: "flat", amount: "" },
    above700: { type: "percent", amount: "" },
  });
  const [rollingPayin, setRollingPayin] = useState({
    type: "percent",
    amount: "",
    amountStr: "",
  });
  const [rollingFixed, setRollingFixed] = useState({
    type: "flat",
    amount: "",
    amountStr: "",
  });
  const [selectedRolling, setSelectedRolling] = useState("payin");

  const { execute: createScheme, loading: creating } =
    usePost("/create-scheme");
  const { execute: updateScheme, loading: updating } = usePost(
    editData ? `/update-scheme/${editData.id}` : ""
  );

  // const { data: merchantScheme } =
  // useGet(merchant ? `/show-scheme/${merchant.id}` : null);

  // get merchant full data using merchant.id
const { data: merchantDetails } = useGet(
  showModal && merchant?.id
    ? `/show-merchant/${merchant.id}`
    : null
);
const schemeId = merchantDetails?.data?.scheme_id;
const { data: merchantScheme } = useGet(
  showModal && schemeId
    ? `/show-scheme/${schemeId}`
    : null
);

const schemeData = editData || merchantScheme?.data || null;  

  // Initialize modal state when it opens
useEffect(() => {
  if (!showModal) return;

  if (schemeData) {
    setName(schemeData.name || "");

    setPayin({
      type: schemeData.payin_commision_type,
      amount: schemeData.payin_commision_amount,
    });

    setPayout({
      below700: {
        type: schemeData.payout_commision_type_below,
        amount: schemeData.payout_commision_amount_below,
      },
      above700: {
        type: schemeData.payout_commision_type_above,
        amount: schemeData.payout_commision_amount_above,
      },
    });

    setRollingPayin({
      type: schemeData.rolling_payin_type || "percent",
      amount: schemeData.rolling_payin_amount || 0,
      amountStr: String(schemeData.rolling_payin_amount || ""),
    });

    setRollingFixed({
      type: schemeData.rolling_fixed_type || "percent",
      amount: schemeData.rolling_fixed_amount || 0,
      amountStr: String(schemeData.rolling_fixed_amount || ""),
    });

    setSelectedRolling(
      schemeData.rolling_payin_amount > 0 ? "payin" : "fixed"
    );

    setPercentage(schemeData.gst_amount || 18);
  } else {
    // reset form
    setName("");
    setPayin({ type: "percent", amount: "" });
    setPayout({
      below700: { type: "flat", amount: "" },
      above700: { type: "percent", amount: "" },
    });
    setRollingPayin({ type: "percent", amount: "", amountStr: "" });
    setRollingFixed({ type: "percent", amount: "", amountStr: "" });
    setSelectedRolling("payin");
    setPercentage(18);
  }
}, [showModal, schemeData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.info("Please enter scheme name");
      return;
    }
    const isEmptyValue = (val) =>
      val === "" || val === null || val === undefined || isNaN(val);

      if (isEmptyValue(payin.amount)) {
      toast.info("Please enter Payin commission amount");
      setActiveTab("tab1");
      return;
    }

        
      // PAYOUT validation
      if (
        isEmptyValue(payout.below700.amount) ||
        isEmptyValue(payout.above700.amount)
      ) {
        toast.info("Please enter Payout commission amounts");
        setActiveTab("tab2");
        return;
      }


      // ROLLING validation
        if (
          selectedRolling === "payin" &&
          isEmptyValue(rollingPayin.amountStr)
        ) {
          toast.info("Please enter Rolling Payin amount");
          setActiveTab("tab3");
          return;
        }


        if (
          selectedRolling === "fixed" &&
          isEmptyValue(rollingFixed.amountStr)
        ) {
          toast.info("Please enter Rolling Fixed amount");
          setActiveTab("tab3");
          return;
        }


      // GST validation
        if (isEmptyValue(percentage)) {
          toast.info("Please enter GST percentage");
          setActiveTab("tab4");
          return;
        }
 
    const payload = {
      name: name,
      payin_commision_type: payin.type,
      payin_commision_amount: parseFloat(payin.amount) || 0,
      payout_commision_type_below: payout.below700.type,
      payout_commision_amount_below: parseFloat(payout.below700.amount) || 0,
      payout_commision_type_above: payout.above700.type,
      payout_commision_amount_above: parseFloat(payout.above700.amount) || 0,
      rolling_payin_amount:
        selectedRolling === "payin"
          ? parseFloat(rollingPayin.amountStr) || 0
          : 0,
      rolling_payin_type:
        selectedRolling === "payin" ? rollingPayin.type : null,
      rolling_fixed_amount:
        selectedRolling === "fixed"
          ? parseFloat(rollingFixed.amountStr) || 0
          : 0,
      rolling_fixed_type:
        selectedRolling === "fixed" ? rollingFixed.type : null,
      gst_amount: parseFloat(percentage) || 18,
      gst_type: "percent",
    };

    try {
      if (schemeData ) {
        await updateScheme(payload);
        toast.success("Scheme updated successfully!");
      } else {
        // console.log("Payload of Scheme: ", payload);
        await createScheme(payload);
        toast.success("Scheme created successfully!");
      }
      refreshTable();
      handleModal();
    } catch (err) {
      console.error("Error saving scheme:", err);
      toast.error(err.message || "Something went wrong");
    }
  };

  if (!showModal) return null;

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
        // onClick={handleModal}
      ></div>

      <div
        className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50 bg-white border rounded-lg w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-white font-medium rounded-t-lg px-5 py-3 flex justify-between items-center"
        style={{ background: "linear-gradient(275deg, #062f70ff, #0d3dc4ff)" }}>
          <h3 className="text-lg font-semibold">
            {schemeData  ? "Edit Scheme" : "Add New Scheme"}
          </h3>
          <Button
            onClick={handleModal}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-red-500 font-bold text-lg shadow-md hover:bg-red-500 hover:text-white transition"
          >
            <i className="fa-solid fa-xmark fa-lg"></i>
          </Button>
        </div>

        <form className="p-5" onSubmit={handleSubmit}>
          {/* Scheme Name */}
          <div className="mb-5">
            <label className="block mb-1 text-sm font-medium">
              Scheme Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter Scheme Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-2">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
              {["tab1", "tab2", "tab3", "tab4"].map((tab, idx) => {
                const tabInfo = ["Payin", "Payout", "Rolling Amount", "GST"];
                const icons = [
                  "fa-money-bill-transfer",
                  "fa-credit-card",
                  "fa-rotate",
                  "fa-percent",
                ];
                return (
                  <li
                    key={tab}
                    className={`me-2 hover:text-blue-900 ${
                      activeTab === tab ? "text-blue-500" : "text-gray-500"
                    }`}
                  >
                    <Button
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className="inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:border-blue-900 group"
                    >
                      <i className={`fa-solid ${icons[idx]} me-2`}></i>
                      {tabInfo[idx]}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Table */}
          <div className="relative">
            <table className="text-sm text-left text-gray-500 w-full">
              <thead className="text-md text-white uppercase "
              style={{ background: "linear-gradient(275deg, #062f70ff, #0d3dc4ff)" }}>
                <tr>
                  <th className="px-6 py-3">Operator</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Amount/Percentage</th>
                </tr>
              </thead>
              <tbody>
                {/* Payin */}
                {activeTab === "tab1" && (
                  <tr className="border-b border-gray-500">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      Payin Commission Slab
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={payin.type}
                        onChange={(e) =>
                          setPayin({ ...payin, type: e.target.value })
                        }
                      >
                        <option value="flat">Flat</option>
                        <option value="percent">Percent</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={payin.amount}
                        onChange={(e) =>
                          setPayin({ ...payin, amount: e.target.value })
                        }
                        className="w-full border rounded-lg p-2 text-sm"
                      />
                    </td>
                  </tr>
                )}

                {/* Payout */}
                {activeTab === "tab2" && (
                  <>
                    <tr className="border-b border-gray-500">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        Payout Below 700
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={payout.below700.type}
                          onChange={(e) =>
                            setPayout({
                              ...payout,
                              below700: {
                                ...payout.below700,
                                type: e.target.value,
                              },
                            })
                          }
                        >
                          <option value="flat">Flat</option>
                          <option value="percent">Percent</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={payout.below700.amount}
                          onChange={(e) =>
                            setPayout({
                              ...payout,
                              below700: {
                                ...payout.below700,
                                amount: e.target.value,
                              },
                            })
                          }
                          className="w-full border rounded-lg p-2 text-sm"
                        />
                      </td>
                    </tr>

                    <tr className="border-b border-gray-500 bg-blue-100">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        Payout Above 700
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={payout.above700.type}
                          onChange={(e) =>
                            setPayout({
                              ...payout,
                              above700: {
                                ...payout.above700,
                                type: e.target.value,
                              },
                            })
                          }
                        >
                          <option value="flat">Flat</option>
                          <option value="percent">Percent</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={payout.above700.amount}
                          onChange={(e) =>
                            setPayout({
                              ...payout,
                              above700: {
                                ...payout.above700,
                                amount: e.target.value,
                              },
                            })
                          }
                          className="w-full border rounded-lg p-2 text-sm"
                        />
                      </td>
                    </tr>
                  </>
                )}

                {/* Rolling */}
                {activeTab === "tab3" && (
                  <>
                    {/* Rolling Payin */}
                    <tr className="border-b border-gray-500">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="rollingOption"
                            value="payin"
                            checked={selectedRolling === "payin"}
                            onChange={() => setSelectedRolling("payin")}
                          />
                          <span>Rolling Payin Amount</span>
                        </label>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={rollingPayin.type}
                          onChange={(e) =>
                            setRollingPayin((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }))
                          }
                          disabled={selectedRolling !== "payin"}
                        >
                          <option value="flat">Flat</option>
                          <option value="percent">Percent</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={
                            selectedRolling === "payin"
                              ? rollingPayin.amountStr
                              : ""
                          }
                          onChange={(e) =>
                            setRollingPayin((prev) => ({
                              ...prev,
                              amountStr: e.target.value,
                              amount: parseFloat(e.target.value) || 0,
                            }))
                          }
                          disabled={selectedRolling !== "payin"}
                          className="w-full border rounded-lg p-2 text-sm"
                        />
                      </td>
                    </tr>

                    {/* Rolling Fixed */}
                    <tr className="border-b border-gray-500">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="rollingOption"
                            value="fixed"
                            checked={selectedRolling === "fixed"}
                            onChange={() => setSelectedRolling("fixed")}
                          />
                          <span>Rolling Fixed Amount</span>
                        </label>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={rollingFixed.type}
                          onChange={(e) =>
                            setRollingFixed((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }))
                          }
                          disabled={selectedRolling !== "fixed"}
                        >
                          <option value="flat">Flat</option>
                          <option value="percent">Percent</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={
                            selectedRolling === "fixed"
                              ? rollingFixed.amountStr
                              : ""
                          }
                          onChange={(e) =>
                            setRollingFixed((prev) => ({
                              ...prev,
                              amountStr: e.target.value,
                              amount: parseFloat(e.target.value) || 0,
                            }))
                          }
                          disabled={selectedRolling !== "fixed"}
                          className="w-full border rounded-lg p-2 text-sm"
                        />
                      </td>
                    </tr>
                  </>
                )}

                {/* GST */}
                {activeTab === "tab4" && (
                  <tr className="border-b border-gray-500">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      Goods and Service Tax
                    </td>
                    <td className="px-6 py-4">
                      <select value="percent" disabled>
                        <option value="percent">Percent</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={percentage}
                        onChange={(e) => setPercentage(e.target.value)}
                        className="w-full border rounded-lg p-2 text-sm"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-right">
            <Button
              type="submit"
              disabled={creating || updating}
              className="cursor-pointer text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg"
            >
              {editData ? "Update" : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};
