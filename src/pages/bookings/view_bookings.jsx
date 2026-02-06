import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../components/axios";
import { Spinner } from "../../components/spinner/spinner";
import Toast from "../../components/toast/toast";
import {
  MdCalendarToday,
  MdSearch,
  MdFileDownload,
  MdRefresh,
  MdList,
  MdClose,
} from "react-icons/md";
import { FaBoxes } from "react-icons/fa";
import "./view_bookings.css";

const ViewBookings = () => {
  const navigate = useNavigate();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [childPiecesModal, setChildPiecesModal] = useState(null);
  const [loadingChildPieces, setLoadingChildPieces] = useState(false);

  // Child Pieces Modal
  const [showChildModal, setShowChildModal] = useState(false);
  const [selectedChildPieces, setSelectedChildPieces] = useState([]);
  const [selectedAwb, setSelectedAwb] = useState("");

  useEffect(() => {
    fetchBookings(date);
  }, [date]);

  useEffect(() => {
    filterBookings(searchQuery);
  }, [searchQuery, bookings]);

  const fetchBookings = async (selectedDate) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`booking/${selectedDate}`);

      if (res.data.status === "success") {
        setBookings(res.data.data || []);
        setFilteredBookings(res.data.data || []);
      } else {
        setBookings([]);
        setFilteredBookings([]);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setToast({
        message: "Failed to load bookings",
        type: "error",
      });
      setBookings([]);
      setFilteredBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = (query) => {
    if (!query.trim()) {
      setFilteredBookings(bookings);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = bookings.filter(
      (booking) =>
        booking.awbno?.toLowerCase().includes(searchTerm) ||
        booking.sender?.toLowerCase().includes(searchTerm) ||
        booking.receiver?.toLowerCase().includes(searchTerm) ||
        booking.destination?.toLowerCase().includes(searchTerm) ||
        booking.child_pieces?.some((child) =>
          child.toLowerCase().includes(searchTerm),
        ),
    );

    setFilteredBookings(filtered);
  };

  const handleRefresh = () => {
    setSearchQuery("");
    fetchBookings(date);
  };

  const handleShowChildPieces = async (awbno, childPieces) => {
    setChildPiecesModal({ awbno, childPieces });
  };

  const handleTrackChildPiece = (childNo) => {
    setChildPiecesModal(null);
    navigate(`/track/${childNo}`);
  };

  // const handleShowChildPieces = (booking) => {
  //   setSelectedAwb(booking.awbno);
  //   setSelectedChildPieces(booking.child_pieces || []);
  //   setShowChildModal(true);
  // };

  const handleTrackChild = (childNo) => {
    setShowChildModal(false);
    navigate(`/track/${childNo}`);
  };

  const handleExport = () => {
    if (filteredBookings.length === 0) {
      setToast({
        message: "No data to export",
        type: "error",
      });
      return;
    }

    // Convert to CSV
    const headers = [
      "Sl",
      "AWB No",
      "Date",
      "Sender",
      "Receiver",
      "Destination",
      "Type",
      "Weight",
      "Pieces",
      "Child Pieces",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredBookings.map((b, idx) =>
        [
          idx + 1,
          b.awbno,
          b.date,
          b.sender,
          b.receiver,
          b.destination,
          b.doc_type,
          b.wt,
          b.pcs,
          (b.child_pieces || []).join("; "),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bookings-${date}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    setToast({
      message: "Export successful",
      type: "success",
    });
  };

  const handleRowClick = (awbno) => {
    navigate(`/track/${awbno}`);
  };

  return (
    <div className="view-bookings">
      <div className="view-bookings__container">
        <header className="view-bookings__header">
          <div>
            <h1 className="view-bookings__title">View Bookings</h1>
            <p className="view-bookings__subtitle">
              {filteredBookings.length} booking
              {filteredBookings.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="view-bookings__actions">
            <div className="view-bookings__date-picker">
              <MdCalendarToday className="view-bookings__date-icon" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="view-bookings__date-input"
              />
            </div>

            <button
              className="view-bookings__action-btn view-bookings__action-btn--refresh"
              onClick={handleRefresh}
              title="Refresh"
            >
              <MdRefresh />
            </button>

            <button
              className="view-bookings__action-btn view-bookings__action-btn--export"
              onClick={handleExport}
              disabled={filteredBookings.length === 0}
              title="Export to CSV"
            >
              <MdFileDownload />
              <span className="view-bookings__action-text">Export</span>
            </button>
          </div>
        </header>

        <div className="view-bookings__search">
          <MdSearch className="view-bookings__search-icon" />
          <input
            type="search"
            placeholder="Search by AWB, sender, receiver, destination, or child piece..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="view-bookings__search-input"
          />
        </div>

        <div className="view-bookings__table-wrapper">
          {loading ? (
            <div className="view-bookings__loading">
              <Spinner size="lg" />
              <p>Loading bookings...</p>
            </div>
          ) : (
            <table className="view-bookings__table">
              <thead>
                <tr>
                  <th>Sl</th>
                  <th>AWB Number</th>
                  <th>Date</th>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Destination</th>
                  <th>Type</th>
                  <th>Weight</th>
                  <th>Pieces</th>
                  <th>Child Pieces</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="view-bookings__empty">
                      <div className="view-bookings__empty-state">
                        <svg
                          width="64"
                          height="64"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p>No bookings found</p>
                        <span>
                          Try selecting a different date or adjusting your
                          search
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking, index) => (
                    <tr
                      key={booking.awbno || index}
                      onClick={() => handleRowClick(booking.awbno)}
                      className="view-bookings__row"
                    >
                      <td>{index + 1}</td>
                      <td className="view-bookings__awb">{booking.awbno}</td>
                      <td>{booking.date}</td>
                      <td>{booking.sender}</td>
                      <td>{booking.receiver}</td>
                      <td>{booking.destination}</td>
                      <td>
                        <span
                          className={`view-bookings__badge view-bookings__badge--${booking.doc_type?.toLowerCase()}`}
                        >
                          {booking.doc_type?.toUpperCase()}
                        </span>
                      </td>
                      <td>{booking.wt} kg</td>
                      <td>
                        {booking.pcs}
                        {booking.has_children && (
                          <span className="pieces-indicator"> (Multi)</span>
                        )}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {booking.has_children ? (
                          <button
                            className="view-bookings__child-btn"
                            onClick={() =>
                              handleShowChildPieces(
                                booking.awbno,
                                booking.child_pieces,
                              )
                            }
                            title="View child pieces"
                          >
                            <FaBoxes />
                            {booking.child_pieces?.length || 0}
                          </button>
                        ) : (
                          <span className="view-bookings__no-child">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Child Pieces Modal */}
      {childPiecesModal && (
        <div
          className="child-modal-overlay"
          onClick={() => setChildPiecesModal(null)}
        >
          <div className="child-modal" onClick={(e) => e.stopPropagation()}>
            <div className="child-modal-header">
              <div className="child-modal-title">
                <FaBoxes />
                <div>
                  <h3>Child Pieces</h3>
                  <p>Parent AWB: {childPiecesModal.awbno}</p>
                </div>
              </div>
              <button
                className="child-modal-close"
                onClick={() => setChildPiecesModal(null)}
              >
                <MdClose />
              </button>
            </div>

            <div className="child-modal-body">
              {!childPiecesModal.childPieces ||
              childPiecesModal.childPieces.length === 0 ? (
                <div className="child-modal-empty">
                  <FaBoxes />
                  <p>No child pieces found</p>
                </div>
              ) : (
                <div className="child-pieces-grid">
                  {childPiecesModal.childPieces.map((childNo, index) => (
                    <div key={index} className="child-piece-card">
                      <div className="child-piece-number">
                        <FaBoxes />
                        <span>{childNo}</span>
                      </div>
                      <button
                        className="child-piece-track-btn"
                        onClick={() => handleTrackChildPiece(childNo)}
                      >
                        Track
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onclose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ViewBookings;
