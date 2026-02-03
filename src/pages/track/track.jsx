import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../components/axios";
import { format } from "date-fns";
import {
  Search,
  Package,
  MapPin,
  Calendar,
  Weight,
  User,
  CheckCircle,
  XCircle,
  Truck,
  Clock,
  Navigation,
  X,
} from "lucide-react";
import "./track.css";

const Track = () => {
  const { awbno } = useParams();
  const navigate = useNavigate();

  const [awb, setAwb] = useState(awbno || "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showImage, setShowImage] = useState(null);

  useEffect(() => {
    if (awbno && /^\d{10}$/.test(awbno)) {
      setAwb(awbno);
      loadTracking(awbno);
    }
  }, [awbno]);

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

  const handleTrack = () => {
    if (awb.length !== 10 || !/^\d+$/.test(awb)) {
      setError("AWB must be 10 digits");
      return;
    }

    navigate(`/track/${awb}`);
    loadTracking(awb);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleTrack();
    }
  };

  const booking = data?.booking;
  const tracking = data?.tracking_data || [];
  const delivery = data?.delivery_data || [];

  return (
    <div className="track-container">
      {/* Hero Search Section */}
      <div className="track-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <Package className="hero-icon" />
            Track Your Shipment
          </h1>
          <p className="hero-subtitle">
            Enter your 10-digit AWB number to get real-time updates
          </p>

          <div className="search-wrapper">
            <div className="search-input-group">
              <Search className="search-icon" />
              <input
                type="text"
                maxLength={10}
                placeholder="Enter AWB Number (10 digits)"
                value={awb}
                onChange={(e) => setAwb(e.target.value.replace(/\D/g, ""))}
                onKeyPress={handleKeyPress}
                className="search-input"
              />
              {awb && (
                <button
                  className="clear-btn"
                  onClick={() => setAwb("")}
                  aria-label="Clear"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <button
              onClick={handleTrack}
              disabled={loading || awb.length !== 10}
              className="track-btn"
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Tracking...
                </>
              ) : (
                <>
                  <Navigation size={18} />
                  Track
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="track-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Fetching tracking information...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <XCircle className="error-icon" />
            <h3>Unable to Track</h3>
            <p>{error}</p>
          </div>
        ) : data ? (
          <div className="tracking-results">
            {/* Status Badge */}
            <div className="awb-header">
              <div className="awb-badge">
                <Package size={20} />
                <span>AWB: {awb}</span>
              </div>
              {delivery.length > 0 && (
                <StatusBadge status={delivery[0].status} />
              )}
            </div>

            {/* Booking Details Card */}
            {booking !== "none" && (
              <div className="info-card">
                <div className="card-header">
                  <h3>Shipment Details</h3>
                </div>
                <div className="card-body">
                  <div className="info-grid">
                    <InfoItem
                      icon={<MapPin size={18} />}
                      label="Origin"
                      value={booking.booked_hub}
                    />
                    <InfoItem
                      icon={<Navigation size={18} />}
                      label="Destination"
                      value={booking.destination}
                    />
                    <InfoItem
                      icon={<Calendar size={18} />}
                      label="Booking Date"
                      value={
                        booking.date
                          ? format(new Date(booking.date), "dd MMM yyyy")
                          : "-"
                      }
                    />
                    <InfoItem
                      icon={<Package size={18} />}
                      label="Pieces"
                      value={booking.pcs}
                    />
                    <InfoItem
                      icon={<Weight size={18} />}
                      label="Weight"
                      value={`${booking.wt} kg`}
                    />
                    <InfoItem
                      icon={<User size={18} />}
                      label="Receiver"
                      value={booking.recname}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tracking Timeline */}
            <div className="info-card">
              <div className="card-header">
                <h3>Tracking Timeline</h3>
                <span className="event-count">{tracking.length} events</span>
              </div>
              <div className="card-body">
                {tracking.length === 0 ? (
                  <div className="empty-state">
                    <Clock size={48} />
                    <p>No tracking updates available yet</p>
                  </div>
                ) : (
                  <div className="timeline">
                    {tracking.map((event, index) => (
                      <div
                        className={`timeline-item ${
                          index === 0 ? "active" : ""
                        }`}
                        key={index}
                      >
                        <div className="timeline-marker">
                          <div className="timeline-dot" />
                          {index !== tracking.length - 1 && (
                            <div className="timeline-line" />
                          )}
                        </div>
                        <div className="timeline-content">
                          <h4 className="event-title">{event.event}</h4>
                          <div className="event-details">
                            <span className="event-location">
                              <MapPin size={14} />
                              {event.location}
                            </span>
                            {event.tohub && (
                              <span className="event-destination">
                                <Navigation size={14} />
                                To: {event.tohub}
                              </span>
                            )}
                          </div>
                          <span className="event-time">
                            <Clock size={14} />
                            {format(
                              new Date(event.date),
                              "dd MMM yyyy, hh:mm a",
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Status */}
            {delivery.length > 0 && (
              <div className="info-card delivery-card">
                <div className="card-header">
                  <h3>Delivery Status</h3>
                </div>
                <div className="card-body">
                  {delivery.map((d, index) => (
                    <DeliveryStatus
                      key={index}
                      delivery={d}
                      onImageClick={setShowImage}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <Package size={64} />
            <h3>Start Tracking</h3>
            <p>Enter your AWB number above to track your shipment</p>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImage && (
        <div className="image-modal" onClick={() => setShowImage(null)}>
          <button className="modal-close" onClick={() => setShowImage(null)}>
            <X size={24} />
          </button>
          <img src={showImage} alt="Proof of Delivery" />
        </div>
      )}
    </div>
  );
};

// Helper Components
const InfoItem = ({ icon, label, value }) => (
  <div className="info-item">
    <div className="info-icon">{icon}</div>
    <div className="info-content">
      <span className="info-label">{label}</span>
      <span className="info-value">{value || "-"}</span>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusConfig = {
    ofd: { label: "Out for Delivery", icon: <Truck size={16} />, class: "ofd" },
    delivered: {
      label: "Delivered",
      icon: <CheckCircle size={16} />,
      class: "delivered",
    },
    undelivered: {
      label: "Undelivered",
      icon: <XCircle size={16} />,
      class: "failed",
    },
    rto: { label: "RTO", icon: <XCircle size={16} />, class: "failed" },
  };

  const config = statusConfig[status] || statusConfig.delivered;

  return (
    <div className={`status-badge ${config.class}`}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};

const DeliveryStatus = ({ delivery, onImageClick }) => {
  const status = delivery.status;

  return (
    <div className="delivery-info">
      {status === "ofd" && (
        <div className="delivery-status ofd">
          <Truck size={24} />
          <div>
            <h4>Out for Delivery</h4>
            <p>Your package is on its way</p>
          </div>
        </div>
      )}

      {status === "delivered" && (
        <div className="delivery-status delivered">
          <CheckCircle size={24} />
          <div>
            <h4>Successfully Delivered</h4>
            {delivery.deliverydate && (
              <p className="delivery-date">
                <Calendar size={14} />
                {format(new Date(delivery.deliverydate), "dd MMM yyyy")}
              </p>
            )}
          </div>
        </div>
      )}

      {delivery.deliveryimage && status === "delivered" && (
        <div className="pod-image">
          <p className="pod-label">Proof of Delivery</p>
          <img
            src={delivery.deliveryimage}
            alt="Proof of Delivery"
            onClick={() => onImageClick(delivery.deliveryimage)}
          />
        </div>
      )}

      {(status === "undelivered" || status === "rto") && (
        <div className="delivery-status failed">
          <XCircle size={24} />
          <div>
            <h4>{status === "rto" ? "Return to Origin" : "Delivery Failed"}</h4>
            <p className="failure-reason">
              {delivery.deliveryreason || "Reason not available"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Track;
