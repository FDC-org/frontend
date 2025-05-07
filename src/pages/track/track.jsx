import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../components/axios";
import { Spinner } from "../../components/spinner/spinner";
import { format } from "date-fns";
import './track.css'

const Track = () => {
  const { awbno } = useParams();
  const [booking,setbooking] = useState([])
  const [trackingdata,settrackingdata] = useState([])
  const [loading,setloading] = useState(false)
  const navigate = useNavigate();
  useEffect(() => {
    if (!/^\d+$/.test(awbno)) {
      console.error("Invalid AWB number. It must be numeric.");
      navigate("/");
    }
    setloading(true);
    axiosInstance
      .get("track/" + awbno)
      .then((r) => {
        if (r.data.status === "success")
        {
          setbooking(r.data.booking)
          settrackingdata(r.data.tracking_data);
          setloading(false)
        }
        
      }).catch((e) => {
        setloading(false)
        console.log(e);
      }
      )
  },[awbno,axiosInstance,setbooking,settrackingdata]);
  return (
    <div className="track_con">
      {loading ? (
        <Spinner />
      ) : (
        <div className="details">
          <div className="booking_details">
            <p className="data">
              AWB NO. : <b> {awbno} </b>
            </p>
            <div>Pieces: {booking.pcs}</div>
            <div>Weight (kg): {booking.wt}</div>
          </div>
          <div className="tracking_details">
            <h3>Travelling Information</h3>
            {trackingdata.map((data) => {
              return (
                <div className="tracking_data" key={data.id}>
                  <div>{format(data.date, "dd-MM-yyy, HH:mm:ss")}</div>
                  <div>
                    {data.event === "Inscan" ? (
                      <div>
                        Inscaned by {data.location} {}
                      </div>
                    ) : (
                      <div>
                        Outscaned from {data.location} to {data.tohub}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Track