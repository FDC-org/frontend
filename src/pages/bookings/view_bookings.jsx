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
} from "react-icons/md";
import "./view_bookings.css";

const ViewBookings = () => {
  const navigate = useNavigate();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

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
        booking.destination?.toLowerCase().includes(searchTerm),
    );

    setFilteredBookings(filtered);
  };

  const handleRefresh = () => {
    setSearchQuery("");
    fetchBookings(date);
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
            placeholder="Search by AWB, sender, receiver, or destination..."
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
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="view-bookings__empty">
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
                      <td>{booking.pcs}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

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
