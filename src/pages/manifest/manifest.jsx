import { useEffect, useState } from "react";
import "./manifest.css";
import { format } from "date-fns";
import axios from "axios";
import { Spinner } from "../../components/spinner/spinner";
import axiosInstance from "../../components/axios";
import {  useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../components/auth";

const Manifest = () => {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState({});
  const [datarender, setdatarednder] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
        if (!isLoggedIn()) nav("/login");
    
    setdatarednder(true);
    axiosInstance
      .get("outscan/" + date, {
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
                <th>Manifest Number</th>
                <th>To HUB</th>
                <th>Vehicle Number</th>
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
                        className="link"
                        onClick={() => {
                          console.log(value[1].manifestnumber);

                          nav("" + value[1].manifestnumber);
                        }}
                      >
                        {value[1].manifestnumber}
                      </td>
                      <td>{value[1].tohub}</td>
                      <td>
                        {value[1].vehicle_number && value[1].vehicle_number.toUpperCase()}
                      </td>
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

export default Manifest;
