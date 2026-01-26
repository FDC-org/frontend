import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../components/axios";
import { format } from "date-fns";
import "./track.css";

const Track = () => {
  const { awbno } = useParams(); // 👈 get awb from URL
  const navigate = useNavigate();

  const [awb, setAwb] = useState(awbno || "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showImage, setShowImage] = useState(null);

  // 🔹 Auto load when page opens with /track/:awbno
  useEffect(() => {
    if (awbno && /^\d{10}$/.test(awbno)) {
      setAwb(awbno);
      loadTracking(awbno);
    }
  }, [awbno]);

  // 🔹 Main API Call
  const loadTracking = async (awbNumber) => {
    try {
      setLoading(true);
      setError("");
      setData(null);

      const res = await axiosInstance.get(`track/${awbNumber}`);

      if (
        res.data.error === "invalid token" ||
        res.data.error === "token expired"
      ) {
        navigate("/login");
        return;
      }

      if (res.data.status === "success") {
        setData(res.data);
      } else {
        setError("No tracking data found");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load tracking");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Manual Track Button
  const handleTrack = () => {
    if (awb.length !== 10 || !/^\d+$/.test(awb)) {
      alert("AWB must be 10 digits");
      return;
    }

    // change URL and auto reload
    navigate(`/track/${awb}`);
    loadTracking(awb);
  };

  const booking = data?.booking;
  const tracking = data?.tracking_data || [];
  const delivery = data?.delivery_data || [];

  return (
    <div className="track_con">
      {/* 🔍 Search Bar */}
      <div className="search_bar">
        <input
          type="text"
          maxLength={10}
          placeholder="AWB Number"
          value={awb}
          onChange={(e) => setAwb(e.target.value.replace(/\D/g, ""))}
        />
        <button onClick={handleTrack} disabled={loading}>
          {loading ? "Tracking..." : "Track"}
        </button>
      </div>

      {/* 🔄 Body */}
      {loading ? (
        <div className="loader">Loading...</div>
      ) : error ? (
        <div className="error_msg">{error}</div>
      ) : data ? (
        <div className="details">
          {/* AWB Header */}
          <div className="card center">
            <h3>AWB NO : {awb}</h3>
          </div>

          {/* 📦 Booking Details */}
          {booking !== "none" && (
            <div className="card">
              <h4>Booking Details</h4>
              <hr />
              <Row label="Booked Hub" value={booking.booked_hub} />
              <Row label="Destination" value={booking.destination} />
              <Row
                label="Booking Date"
                value={
                  booking.date
                    ? format(new Date(booking.date), "dd-MM-yyyy")
                    : "-"
                }
              />
              <Row label="Pieces" value={booking.pcs} />
              <Row label="Weight" value={`${booking.wt} kg`} />
              <Row label="Receiver" value={booking.recname} />
            </div>
          )}

          {/* 🚚 Tracking Timeline */}
          <div className="card">
            <h4>Tracking Events</h4>
            <hr />

            {tracking.length === 0 ? (
              <p>No tracking updates</p>
            ) : (
              tracking.map((e, index) => (
                <div className="tracking_item" key={index}>
                  <div className="dot"></div>

                  <div className="track_content">
                    <b>{e.event}</b>
                    <p>Location: {e.location}</p>
                    {e.tohub && <p>To: {e.tohub}</p>}
                    <small>
                      {format(new Date(e.date), "dd-MM-yyyy hh:mm a")}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 📬 Delivery Section */}
          {delivery.length > 0 && (
            <div className="card">
              <h4>Delivery Status</h4>
              <hr />

              {delivery.map((d, index) => {
                const status = d.status;

                return (
                  <div key={index}>
                    {status === "ofd" && (
                      <b className="status ofd">🚚 Out For Delivery</b>
                    )}

                    {status === "delivered" && (
                      <>
                        <b className="status delivered">✅ Delivered</b>

                        <Row
                          label="Delivery Date"
                          value={
                            d.deliverydate
                              ? format(new Date(d.deliverydate), "dd-MM-yyyy")
                              : "-"
                          }
                        />

                        {d.deliveryimage && (
                          <div className="image_box">
                            <img
                              src={d.deliveryimage}
                              alt="POD"
                              onClick={() => setShowImage(d.deliveryimage)}
                            />
                          </div>
                        )}
                      </>
                    )}

                    {(status === "undelivered" || status === "rto") && (
                      <>
                        <b className="status failed">
                          ❌ {status.toUpperCase()}
                        </b>
                        <Row
                          label="Reason"
                          value={d.deliveryreason || "Reason not available"}
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <p className="hint">Enter AWB number to track shipment</p>
      )}

      {/* 🖼️ Full Screen Image */}
      {showImage && (
        <div className="image_modal" onClick={() => setShowImage(null)}>
          <img src={showImage} alt="Full POD" />
        </div>
      )}
    </div>
  );
};

export default Track;

/* Helper */
const Row = ({ label, value }) => (
  <div className="row">
    <span>{label}</span>
    <b>{value || "-"}</b>
  </div>
);
