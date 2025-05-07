import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../components/auth";
import InputField from "../../components/input/input";
import Button from "../../components/button/button";
import Toast from "../../components/toast/toast";
import { Spinner } from "../../components/spinner/spinner";
import "./outscan.css";
import axiosInstance from "../../components/axios";
import Select from "react-select";
import Modal from "react-modal";
import { format } from "date-fns";
import OutScanInputField from "../../components/input/outscaninput";

const OutScan = () => {
  const [prevalues, setPrevalues] = useState([]);
  const [toast, setToast] = useState(false);
  const [status, setStatus] = useState("");
  const [click, setClick] = useState(false);
  const [savefortable, setSavefortable] = useState([]);
  const [openmodel, setopenmodel] = useState(false);
  const [manifestnumber, setmanifestnumber] = useState("");
  const [vehiclenumberdata, setVehiclenumberdata] = useState([]);
  const [tohubdata, setTohubdata] = useState([]);
  const [vehiclenumber, setVehiclenumber] = useState("");
  const [tohub, setTohub] = useState("");
  const [vehiclenumberupdate, setVehiclenumberupdate] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalerror, setModalerror] = useState("")
  const [oldmanifestnumber,setoldmanifestnumber] = useState("")
  const ondelete = (value) => {
    setPrevalues((prevalues) => prevalues.filter((item) => item !== value));
    setSavefortable((savefortable) =>
      savefortable.filter((item) => item[2] !== value)
    );
  };
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn()) navigate("/login");
    setLoading(true);
    axiosInstance
      .get("getmanifestnumber/", { withCredentials: true })
      .then((r) => setmanifestnumber(r.data.manifestno))
      .catch((e) => console.log(e));
      setoldmanifestnumber(manifestnumber)
    axiosInstance
      .get("vehicledetails/", { withCredentials: true })
      .then((r) => {
        const details = r.data.data.map((item) => ({
          value: item,
          label: item.toUpperCase(),
        }));
        setVehiclenumberdata([
          ...details,
          { value: "__add_new__", label: "Add Vehicle" },
        ]);
      })
      .catch((e) => console.log(e));
    axiosInstance
      .get("gethublist/", { withCredentials: true })
      .then((r) => {
        const details = r.data.hub.map((item) => ({
          value: item.name,
          label: item.name,
        }));
        setTohubdata([...details]);
        setLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setLoading(false);
      });
  }, [
    isLoggedIn,
    navigate,
    axiosInstance,
    setVehiclenumberdata,
    setmanifestnumber,
    setVehiclenumberdata,
    setTohubdata,
  ]);

  const handlechange = (selected) => {
    if (selected.value === "__add_new__") {
      setopenmodel(true);
    } else {
      setVehiclenumber(selected.value);
    }
  };

  const handleSumit = () => {
    if (prevalues && prevalues.length != 0) {
      if (vehiclenumber !=="")
      {
        if(tohub !=='')
        {
        setClick(true);
      axiosInstance
        .post("outscan/", {
          awbno: savefortable,
          manifest_number: manifestnumber,
          vehicle_number: vehiclenumber,
          tohub: tohub,
          date: format(new Date(), "dd-MM-yyyy, HH:mm:ss"),
        })
        .then((r) => {
          if (r.data.status === "success") {
            setStatus(r.data["status"]);
            setToast(true);
            setClick(false);
            setPrevalues([]);
            setoldmanifestnumber(manifestnumber)
            setmanifestnumber(r.data.manifest_number)
          }
        })
        .catch((r) => {
          setStatus("error");
          console.log(r);
          setToast(true);
          setClick(false);
        });
        }
        else
        {
          setStatus("Enter To HUB")
          setToast(true)
        }
      }
        else{
          setStatus("Enter Vehicle Number")
          setToast(true)
        }
    } else {
      setStatus("Enter Atleast one AWB number");
      setToast(true);
    }
  };
  const handlevehicleupdate = () => {
    if (vehiclenumberupdate !== "") {
      setClick(true)
      axiosInstance
        .post(
          "vehicledetails/",
          { vehicle_number: vehiclenumberupdate },
          { withCredentials: true }
        )
        .then((r) => {console.log(r);
          setopenmodel(false)
          setClick(false)
          setStatus("success");
          setToast(true)
          setVehiclenumberdata([
            { value: vehiclenumberupdate, label: vehiclenumberupdate },
            ...vehiclenumberdata,
          ]);
          setVehiclenumberupdate("")
        })
        .catch((e) => {
          console.log(e)
          setModalerror("error")
          setStatus("error")
          setToast(true)
        });
    }
  };
  return loading ? (
    <Spinner />
  ) : (
    <div className="inscan">
      <div className="inscan_con">
        <div className="inscan_form outscan_form">
          <div className="outscan_con">
            <div className="input_con">
              <label htmlFor="" className="label">
                Manifest Number
              </label>
              <input
                type="text"
                name=""
                id=""
                className="outscan_input disabled"
                disabled
                value={manifestnumber}
              />
            </div>
            <div className="input_con">
              <label htmlFor="" className="label">
                Vehicle Number
              </label>
              <Select
                options={vehiclenumberdata}
                className="outscan_input select"
                onChange={handlechange}
                placeholder={"Select Vehicle"}
              />
            </div>
            <div className="input_con">
              <label htmlFor="" className="label">
                To HUB
              </label>
              <Select
                options={tohubdata}
                className="outscan_input select"
                onChange={(e) => setTohub(e.value)}
                placeholder={"Select HUB"}
              />
            </div>
          </div>
          <OutScanInputField
            name={"AWB No"}
            type={"text"}
            required={true}
            onclick={setPrevalues}
            prevalues={prevalues}
            ondelete={ondelete}
            setSavefortable={setSavefortable}
            savefortable={savefortable}
            manifestnumber={manifestnumber}
            to_hub={tohub}
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
              <th>Manifest Number</th>
              <th>AWB No</th>
              <th>To HUB</th>
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
                <td
                  onClick={() => navigate("/track/" + value[2])}
                  className="onclick"
                >
                  {value[2]}
                </td>
                <td>{value[3]}</td>
                <td>{value[4]}</td>
                <td>{value[5]}</td>
                <td>{value[6]}</td>
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
      {openmodel && (
        <Modal
          isOpen={openmodel}
          onRequestClose={() => setopenmodel(false)}
          className="inscan_modal"
        >
          <label>Vehicle Number</label>
          <input
            type="text"
            onChange={(e) =>
              setVehiclenumberupdate(e.target.value.toUpperCase())
            }
            className="input_field modal"
            required
            value={vehiclenumberupdate}
          />
          <div className="but">
            {" "}
            {click ? (
              <Spinner />
            ) : (
              <Button name={"Submit"} onclick={() => handlevehicleupdate()} />
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
export default OutScan;
