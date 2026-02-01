import { IoIosClose } from "react-icons/io";
import axios from "axios";
import "./input.css";
import { useEffect, useState } from "react";
import { format } from "date-fns";

import Modal from "react-modal";
import Button from "../button/button";
import { Spinner } from "../spinner/spinner";
import axiosInstance from "../axios";

const InputField = ({
  name,
  required,
  type,
  ondelete,
  onclick,
  prevalues,
  savefortable,
  setSavefortable,
}) => {
  const [awbno, setAwbno] = useState("");
  const [error, setError] = useState("");
  const [doc_type, setDoc_type] = useState("");
  const [pcs, setPcs] = useState("");
  const [wt, setWt] = useState("");
  const [popup, setPopup] = useState(false);
  const [click, setclick] = useState(false);
  const [loading, setloading] = useState(false);
  const handleEnter = async (e) => {
    if (e.key === "Enter" || e.key === "Tab" || e.key === " ") {
      if (awbno !== "") {
        if (awbno.length == 10) {
          if (!prevalues.includes(awbno)) {
            setloading(true);
            axios
              .post(
                import.meta.env.VITE_API_LINK + "bookingdetails/",
                { awbno: awbno },
                {
                  headers: {
                    Authorization: "Token " + localStorage.getItem("token"),
                    " X-CSRFToken": localStorage.getItem("csrf_token"),
                  },
                  withCredentials: true,
                },
              )
              .then((response) => {
                if (response.data.status === "found") {
                  onclick((val) => [...prevalues, awbno]);
                  setSavefortable((val) => [
                    ...savefortable,
                    [
                      format(new Date(), "dd-MM-yyyy, HH:mm:ss"),
                      awbno,
                      response.data.type,
                      response.data.pcs,
                      response.data.wt,
                    ],
                  ]);
                  setAwbno("");
                }
                if (response.data.status === "not found") {
                  setPopup(true);
                }
                setloading(false);
              })
              .catch((e) => {
                localStorage.removeItem("token");
                nav("/login");
                setloading(false);
              });
          } else {
            setAwbno("");
          }
        } else {
          setError("AWB no must be 9 digits");
          // setAwbno("");
        }
      } else {
        setError("enter AWB No.");
        setAwbno("");
      }
    }
  };
  const handleSubmit = () => {
    if (pcs !== "" || wt !== "") {
      setclick(true);
      axiosInstance
        .post(
          import.meta.env.VITE_API_LINK + "addbookingdetails/",
          { awbno: awbno, pcs: pcs, wt: wt, doctype: doc_type },
          {
            headers: {
              Authorization: "Token " + localStorage.getItem("token"),
              // " X-CSRFToken": getCookie(),
            },
            withCredentials: true,
          }
        )
        .then((response) => {
          if (response.data.status === "added") {
            onclick((val) => [...prevalues, awbno]);
            setSavefortable((val) => [
              ...savefortable,
              [
                format(new Date(), "dd-MM-yyyy, HH:mm:ss"),
                awbno,
                doc_type,
                pcs,
                wt,
              ],
            ]);
            setPopup(false);
            setAwbno("");
            setPcs("");
            setWt("");
            setDoc_type("");
            setclick(false);
          }
        });
    }
  };
  return (
    <div className="input_con">
      <label htmlFor={name} className="label">
        {name} {required && "*"}
      </label>
      <div className="input_field">
        <div className="previousval">
          {prevalues.map((value) => (
            <div className="prevalues" key={value}>
              {value}
              <div className="preval_close">
                <IoIosClose
                  size={15}
                  onClick={() => ondelete(value)}
                  cursor={"pointer"}
                />
              </div>
            </div>
          ))}
        </div>
        <input
          type={type}
          name={name}
          required={required}
          onChange={(e) => {
            setError("");
            const value = e.target.value;
            if (/^\d*$/.test(value)) setAwbno(value);
          }}
          value={awbno}
          onKeyDown={handleEnter}
          autoFocus={true}
          inputMode="numeric"
          pattern="[0-9]*"
        />
        {loading && <Spinner />}
      </div>
      <Modal
        isOpen={popup}
        onRequestClose={() => setPopup(false)}
        contentLabel="Enter Name"
        className="inscan_modal"
      >
        <div className="radio">
          <input
            type="radio"
            name="doc_type"
            id=""
            onChange={(e) => setDoc_type("docx")}
          />
          Docx
          <input
            type="radio"
            name="doc_type"
            id=""
            onChange={(e) => setDoc_type("non-docx")}
          />
          NonDocx
        </div>
        <br></br>
        <label>Pcs</label>
        <input
          type="number"
          onChange={(e) => setPcs(e.target.value)}
          className="input_field modal"
          required
        />
        <label>wt (kg)</label>
        <input
          type="number"
          onChange={(e) => setWt(e.target.value)}
          className="input_field modal"
          required
        />
        <br></br>
        {click ? (
          <Spinner />
        ) : (
          <Button name={"Submit"} onclick={handleSubmit} />
        )}
      </Modal>
      {error && <div className="input_error">{error}</div>}
    </div>
  );
};

export default InputField;
