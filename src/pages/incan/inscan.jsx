import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../components/auth";
import InputField from "../../components/input/input";
import Button from "../../components/button/button";
import axios from "axios";
import getCookie from "../../components/getCookies";
import Toast from "../../components/toast/toast";
import { Spinner } from "../../components/spinner/spinner";
import "./inscan.css";

const Inscan = () => {
  const [prevalues, setPrevalues] = useState([]);
  const [toast, setToast] = useState(false);
  const [status, setStatus] = useState("");
  const [click, setClick] = useState(false);
  const [savefortable, setSavefortable] = useState([]);

  const ondelete = (value) => {
    setPrevalues((prevalues) => prevalues.filter((item) => item !== value));
    setSavefortable((savefortable) => savefortable.filter((item) => item[1] !== value) )
  };
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn()) navigate("/login");
  }, [isLoggedIn, navigate]);

  const handleSumit = () => {
    if (prevalues && prevalues.length != 0) {
      setClick(true);
      axios
        .post(
          import.meta.env.VITE_API_LINK + "inscan/",
          { awbno: savefortable },
          {
            headers: {
              Authorization: "Token " + localStorage.getItem("token"),
              " X-CSRFToken": getCookie(),
            },
            withCredentials: true,
          }
        )
        .then((r) => {
          if (r.data.status === "success") {
            setStatus(r.data["status"]);
            setToast(true);
            setClick(false);
            setPrevalues([]);
          }
        })
        .catch((r) => {
          setStatus("error");
          console.log(r);
          setToast(true);
          setClick(false);
        });
    } else {
      setStatus("Enter Atleast one AWB number");
      setToast(true);
    }
  };

  return (
    <div className="inscan">
      <div className="inscan_con">
        <div className="inscan_form">
          <InputField
            name={"AWB No"}
            type={"text"}
            required={true}
            onclick={setPrevalues}
            prevalues={prevalues}
            ondelete={ondelete}
            setSavefortable={setSavefortable}
            savefortable={savefortable}
          />
          {click ? (
            <Spinner />
          ) : (
            <Button name={"Submit"} onclick={handleSumit} />
          )}
        </div>
      </div>
      <div className="inscan_table">
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
            {savefortable.map((value, index) => (
              <tr key={value}>
                <td>{index + 1}</td>
                <td>{value[0]}</td>
                <td>{value[1]}</td>
                <td>{value[2]}</td>
                <td>{value[3]}</td>
                <td>{value[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {toast && (
        <Toast
          message={status}
          type={status == "success" ? "success" : "error"}
          onclose={() => setToast(false)}
        />
      )}
    </div>
  );
};
export default Inscan;
