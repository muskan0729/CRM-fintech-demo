import { useEffect, useState } from "react";
import Button from "../components/Button";
import Table from "../components/Table";
import Logo from "../images/logo.png";
import Placeholder from "../images/placeholder.jpeg";
import { useNavigate } from "react-router-dom";
import { useGet } from "../hooks/useGet";
import { usePost } from "../hooks/usePost";
import { useToast } from "../contexts/ToastContext";

export const ViewComplain = () => {
  const [errors, setErrors] = useState();
  const [showModal, setShowModal] = useState(false);
  // const [showViewMessageModal, setShowViewMessageModal] = useState(false);
  // const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [ticketData, setTicketData] = useState([]);
  const [editData, setEditData] = useState(null);

  const toast = useToast();
  const navigate = useNavigate();

  const { execute: executeTicket, loading: creating } =
    usePost("/store-ticket");

  const { data, loading, error, refetch } = useGet("/get-tickets");

  const { execute: updateTicket, loading: updating } = usePost(
    editData ? `/update-ticket/${editData.id}` : ""
  );

  const [ticketFormData, setTicketFormData] = useState({
    user_id: "",
    subject: "",
    description: "",
    attachment: "",
    assigned_to: "",
  });

  const statusOptions = ["Open", "In Progress", "Resolved", "Closed"];
  const priorityOptions = ["High", "Medium", "Low"];

  const formatForUI = (str) => {
    if (!str) return "N/A";
    return str
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  /* ===================== DATA MAPPING (FULL SAFE) ===================== */
  useEffect(() => {
    if (!data?.data) return;

    const formattedData = data.data.map((item) => {
      const d = new Date(item.created_at);

      const formattedDate = d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      });

      const formattedTime = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return {
        ...item,

        /* ===== RAW DATA ===== */
        id: item.id,
        ticket_id: item.ticket_id ?? "N/A",
        user_id: item.user_id,
        created_at: item.created_at, // 🔥 RAW DATE (DO NOT TOUCH)

        /* ===== DISPLAY ===== */
        user_name: item.user?.name ?? "N/A",
        subject: item.subject ?? "N/A",
        description: item.description ?? "N/A",
        status: formatForUI(item.status),
        priority: formatForUI(item.priority),
        assigned_to: item.assigned_to ?? "N/A",

        created_at_ui: (
          <div className="flex flex-col w-32 text-center">
            <span className="text-sm font-medium">{formattedDate}</span>
            <span className="text-sm text-gray-500 mt-1">{formattedTime}</span>
          </div>
        ),

        action: (
          <Button
            onClick={() => handleEdit(item)}
            className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-md"
          >
            Edit
          </Button>
        ),
      };
    });

    setTicketData(formattedData);
  }, [data]);

  /* ===================== EDIT / RAISE HANDLING ===================== */
  useEffect(() => {
    if (showModal) {
      if (editData) {
        setTicketFormData({
          user_id: editData.user_id || "",
          subject: editData.subject || "",
          description: editData.description || "",
          attachment: "",
          assigned_to: editData.assigned_to || "",
        });
      } else {
        setTicketFormData({
          user_id: "",
          subject: "",
          description: "",
          attachment: "",
          assigned_to: "",
        });
      }
    }
  }, [showModal, editData]);

  const handleEdit = (ticket) => {
    setEditData(ticket);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setTicketFormData({
      ...ticketFormData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...ticketFormData };

      const res = editData
        ? await updateTicket(payload)
        : await executeTicket(payload);

      toast.success(
        editData
          ? "Complaint updated successfully!"
          : "Complaint raised successfully!"
      );

      if (res) {
        setShowModal(false);
        setEditData(null);
        setTicketFormData({
          user_id: "",
          subject: "",
          description: "",
          attachment: "",
          assigned_to: "",
        });
        refetch();
        navigate("/view-complain");
      }
    } catch (err) {
      toast.error(
        Object.values(err?.errors || { error: ["Something went wrong"] })[0][0]
      );
    }
  };

  /* ===================== TABLE COLUMNS ===================== */
  const complainColumns = [
    { header: "Complain Id", accessor: "ticket_id" },
    { header: "Name", accessor: "user_name" },
    { header: "Subject", accessor: "subject" },
    { header: "Description", accessor: "description" },
    { header: "Status", accessor: "status" },
    { header: "Priority", accessor: "priority" },
    // { header: "Send Message", accessor: "send" },
    // { header: "View Message", accessor: "view" },
    { header: "Issue Image", accessor: "image" },
    // { header: "Assigned To", accessor: "assigned_to" },
    { header: "Created At", accessor: "created_at_ui" },
    { header: "Action", accessor: "action" },
  ];

  /* ===================== TABLE UI OVERRIDES ===================== */
  const complainsWithModifications = ticketData.map((row) => ({
    ...row,

    description: (
      <div className="whitespace-normal break-words w-96">
        {row.description}
      </div>
    ),

    status: (
      <select
        className="p-2 text-sm border rounded-lg bg-gray-50"
        value={row.status}
        onChange={(e) => {
          const newStatus = e.target.value;
          setTicketData((prev) =>
            prev.map((item) =>
              item.ticket_id === row.ticket_id
                ? { ...item, status: newStatus }
                : item
            )
          );
        }}
      >
        {statusOptions.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    ),

    priority: (
      <select
        className="p-2 text-sm border rounded-lg bg-gray-50"
        value={row.priority}
        onChange={(e) => {
          const newPriority = e.target.value;
          setTicketData((prev) =>
            prev.map((item) =>
              item.ticket_id === row.ticket_id
                ? { ...item, priority: newPriority }
                : item
            )
          );
        }}
      >
        {priorityOptions.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    ),

    // send: (
    //   <Button
    //     onClick={() => setShowSendMessageModal(true)}
    //     className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md"
    //   >
    //     Send Message
    //   </Button>
    // ),

    // view: (
    //   <Button
    //     onClick={() => setShowViewMessageModal(true)}
    //     className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md"
    //   >
    //     View Message
    //   </Button>
    // ),

    image: (
      <Button onClick={() => setShowImageModal(true)}>
        <img src={Logo || Placeholder} alt="" />
      </Button>
    ),

    // assigned_to: row.assigned_to,
  }));

  /* ===================== RENDER ===================== */
  return (
    <>
      <div className="w-full flex justify-center py-8">
        <div className="w-full px-4">
          <div
            className="flex justify-between items-center rounded-lg p-4 shadow-md"
            style={{
              background: "linear-gradient(275deg,#062f70ff,#0d3dc4ff)",
            }}
          >
            <h4 className="font-bold text-white text-lg">View Complain</h4>
            <Button
              onClick={() => {
                setEditData(null);
                setShowModal(true);
              }}
              className="bg-white text-sky-800 px-4 py-2 rounded-lg shadow-md"
            >
              Raise Complain
            </Button>
          </div>

          <Table
            columns={complainColumns}
            data={complainsWithModifications}
            showStatusFilter={false}
            showExport={false}
            endPoint="/delete-ticket"
            setData={setTicketData}
          />
        </div>
      </div>

      {/* ===================== MODAL: ADD / EDIT ===================== */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-3 bg-blue-600 text-white rounded-t-lg">
              <h4>{editData ? "Edit Complaint" : "Register Complaint"}</h4>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input
                type="text"
                name="user_id"
                value={ticketFormData.user_id}
                onChange={handleChange}
                placeholder="User ID"
                className="w-full border p-2 rounded"
                required
              />

              <input
                type="text"
                name="subject"
                value={ticketFormData.subject}
                onChange={handleChange}
                placeholder="Subject"
                className="w-full border p-2 rounded"
                required
              />

              <textarea
                name="description"
                value={ticketFormData.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full border p-2 rounded"
                rows={4}
                required
              />

              {/* <input type="file" name="attachment" onChange={handleChange} /> */}
              <input
                    type="file"
                    name="attachment"
                    onChange={handleChange}
                    className="block w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {editData ? "Update" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* {showViewMessageModal && ( */}
      {/*   <div */}
      {/*     className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 overflow-y-scroll" */}
      {/*     onClick={() => setShowViewMessageModal(false)} */}
      {/*   > */}
      {/*     <div */}
      {/*       className="bg-white border rounded-lg shadow-lg max-w-3xl w-full mx-2 p-6 transform transition-all scale-100" */}
      {/*       onClick={(e) => e.stopPropagation()} */}
      {/*     > */}
      {/*       <div */}
      {/*         className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700  */}
      {/*               font-medium rounded-t-lg text-sm px-5 py-3 flex justify-between items-center" */}
      {/*       > */}
      {/*         <h4 className="font-bold text-white text-lg py-2"> */}
      {/*           View Message */}
      {/*         </h4> */}
      {/*         <Button */}
      {/*           onClick={() => setShowViewMessageModal(false)} */}
      {/*           className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-red-500 font-bold text-lg shadow-md hover:bg-red-500 hover:text-white transition" */}
      {/*         > */}
      {/*           <i class="fa-solid fa-xmark fa-lg"></i> */}
      {/*         </Button> */}
      {/*       </div> */}

      {/*       <div class="flex justify-end mt-3"> */}
      {/*         <div class="block relative max-w-xs bg-blue-500 text-white p-3 px-4 rounded-2xl rounded-br-none shadow-md"> */}
      {/*           <p class="text-lg leading-relaxed">Chat 1</p> */}
      {/*           <p class="text-xs leading-relaxed text-gray-200"> */}
      {/*             {new Date().toLocaleString()} */}
      {/*           </p> */}
      {/*           <span class="absolute right-[-3px] bottom-0 w-2 h-2 bg-blue-500 rotate-45 rounded-sm"></span> */}
      {/*         </div> */}
      {/*       </div> */}

      {/*       <div class="flex justify-end mt-3"> */}
      {/*         <div class="block relative max-w-xs bg-blue-500 text-white p-3 px-4 rounded-2xl rounded-br-none shadow-md"> */}
      {/*           <p class="text-lg leading-relaxed">Chat 2</p> */}
      {/*           <p class="text-xs leading-relaxed text-gray-200"> */}
      {/*             {new Date().toLocaleString()} */}
      {/*           </p> */}
      {/*           <span class="absolute right-[-3px] bottom-0 w-2 h-2 bg-blue-500 rotate-45 rounded-sm"></span> */}
      {/*         </div> */}
      {/*       </div> */}
      {/*     </div> */}
      {/*   </div> */}
      {/* )} */}

      {/* {showSendMessageModal && ( */}
      {/*   // ... send message modal content would be here if it existed */}
      {/* )} */}

      {showImageModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="bg-white border rounded-lg shadow-lg max-w-3xl w-full mx-2 p-6 transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 
                    font-medium rounded-t-lg text-sm px-5 py-3 flex justify-between items-center"
            >
              <h4 className="font-bold text-white text-lg py-2">
                Image of Issue
              </h4>
              <Button
                onClick={() => setShowImageModal(false)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-red-500 font-bold text-lg shadow-md hover:bg-red-500 hover:text-white transition"
              >
                <i class="fa-solid fa-xmark fa-lg"></i>
              </Button>
            </div>

            <img src={Logo ? Logo : Placeholder} alt="" />
          </div>
        </div>
      )}
    </>
  );
};