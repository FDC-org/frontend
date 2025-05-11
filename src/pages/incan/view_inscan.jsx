import { useEffect, useState } from "react";
import "./viewinscan.css";
import { format } from "date-fns";
import axios from "axios";
import { Spinner } from "../../components/spinner/spinner";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../components/auth";

const ViewInscan = () => {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState({});
  const [datarender, setdatarednder] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn()) navigate("/login");
    setdatarednder(true);
    axios
      .get(import.meta.env.VITE_API_LINK + "inscan/" + date, {
        headers: { Authorization: "Token " + localStorage.getItem("token") },
      })
      .then((r) => {
        if (r.data.status === "success")
          if (r.data.data != 0) {
            setData(r.data.data);
          }
        setdatarednder(false);
      })
      .catch((e) => {
        console.log(e);
        setdatarednder(false);
      });
  }, [date, setData]);

  const handlechange = (e) => {
    setDate(e.target.value);
    setdatarednder(true);
    axios
      .get(import.meta.env.VITE_API_LINK + "inscan/" + e.target.value, {
        headers: { Authorization: "Token " + localStorage.getItem("token") },
      })
      .then((r) => {
        if (r.data.status === "success") {
          setData(r.data.data);
          setdatarednder(false);
        }
      })
      .catch((e) => {
        console.log(e);
        setdatarednder(false);
      });
  };

  const formatdate = (datef) => {
    const [date, timeWithMs] = datef.split("T");
    const time = timeWithMs.split(".")[0];
    return date + ", " + time;
  };

  return (
    <div className="viewinscan_con">
      <div className="viewinscan_date">
        <input
          type="date"
          name="date"
          id=""
          className="input_field view_inscan_date"
          defaultValue={format(new Date(), "yyyy-MM-dd")}
          onChange={handlechange}
        />
      </div>
      <div className="inscan_table">
        {datarender ? (
          <Spinner />
        ) : (
          <table className="inscan_table1">
            <thead>
              <tr>
                <th>S. No.</th>
                <th>Date</th>
                <th>AWB No</th>
                <th>Type</th>
                <th>Pcs</th>
                <th>Wt</th>
              </tr>
            </thead>
            <tbody>
              {data ? (
                Object.entries(data).map((value, index) => {
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{formatdate(value[1].date)}</td>
                      <td
                        onClick={() => navigate("/track/" + value[1].awbno)}
                        className="onclick"
                      >
                        {value[1].awbno}
                      </td>
                      <td>{value[1].type}</td>
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

export default ViewInscan;
