import { useEffect, useState } from "react";
import "./manifestbynumber.css";
import { format } from "date-fns";
import { Spinner } from "../../components/spinner/spinner";
import axiosInstance from "../../components/axios";
import { useNavigate, useParams } from "react-router-dom";
import { isLoggedIn } from "../../components/auth";

const ManifestByNumber = () => {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState({});
  const [datarender, setdatarednder] = useState(false);
  const [vehicle_number, setVehicle_number] = useState("");
  const [tohub, setTohub] = useState("");
  const nav = useNavigate();
  const { manifestnumber } = useParams();

  useEffect(() => {
    if (!isLoggedIn()) nav("/login");
    setdatarednder(true);
    axiosInstance
      .get("manifestdata/" + manifestnumber, {
        headers: { Authorization: "Token " + localStorage.getItem("token") },
      })
      .then((r) => {
        if (r.data.status === "success")
          if (r.data.awb != 0) {
            setData(r.data.awbno);
            setTohub(r.data.tohub);
            setDate(r.data.date);
            setVehicle_number(r.data.vehicle_number);
          }
        setdatarednder(false);
      })
      .catch((e) => {
        console.log(e);
        setdatarednder(false);
      });
  }, [
    date,
    setData,
    isLoggedIn,
    nav,
    axiosInstance,
    setdatarednder,
    setData,
    setDate,
    setTohub,
    setVehicle_number,
  ]);

  return (
    <div className="viewinscan_con manifest">
      <div className="manifest-data">
        <div className="data">Manifest Number: {manifestnumber}</div>
        <div className="data"> Date: {format(date, "dd-MM-yyyy")}</div>
        <div className="data">
          {" "}
          Vehicle Number: {vehicle_number.toUpperCase()}
        </div>
        <div className="data"> To HUB: {tohub.toUpperCase()}</div>
      </div>
      <div className="inscan_table">
        {datarender ? (
          <Spinner />
        ) : (
          <table className="inscan_table1">
            <thead>
              <tr>
                <th>S. No.</th>
                <th>AWB No</th>
                <th>Pieces</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {data ? (
                Object.entries(data).map((value, index) => {
                  console.log(value);

                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td
                        onClick={() => nav("/track/" + value[1].awbno)}
                        className="onclick"
                      >
                        {value[1].awbno}
                      </td>
                      <td>{value[1].pcs}</td>
                      <td>{value[1].wt}</td>
                    </tr>
                  );
                })
              ) : (
                <div>{console.log("no")}</div>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManifestByNumber;
