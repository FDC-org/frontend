import { useEffect, useState } from "react";
import axiosInstance from "../../components/axios";
import { useNavigate } from "react-router-dom";
import "./view_bookings.css";
import { Spinner } from "../../components/spinner/spinner";

const ViewBookings = () => {
  const navigate = useNavigate();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async (selectedDate) => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(`booking/${selectedDate}`);

      if (res.data.status === "success") {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(date);
  }, [date]);

  return (
    <div className="bookings-page">
      <div className="bookings-header">
        <h2>Bookings</h2>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="date-picker"
        />
      </div>

      <div className="table-wrapper">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>#</th>
              <th>AWB No</th>
              <th>Date</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Destination</th>
              <th>Type</th>
              <th>Wt</th>
              <th>Pcs</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9"><Spinner /></td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan="9">No data</td>
              </tr>
            ) : (
              bookings.map((b, index) => (
                <tr key={b.awbno}>
                  <td>{index + 1}</td>

                  <td
                    className="awb-link"
                    onClick={() => navigate(`/track/${b.awbno}`)}
                  >
                    {b.awbno}
                  </td>

                  <td>{b.date}</td>
                  <td>{b.sender}</td>
                  <td>{b.receiver}</td>
                  <td>{b.destination}</td>
                  <td>{b.doc_type}</td>
                  <td>{b.wt}</td>
                  <td>{b.pcs}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewBookings;
