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
            onclick((val) => [...prevalues, awbno]);
            setSavefortable((val) => [...savefortable, awbno]);
            setAwbno("");
          } else {
            setAwbno("");
          }
        } else {
          setError("AWB no must be 10 digits");
        }
      } else {
        setError("enter AWB No.");
        setAwbno("");
      }
    }
  };

  const handleSubmit = () => {
    if (pcs !== "" && wt !== "" && doc_type !== "") {
      setclick(true);
      axiosInstance
        .post(
          import.meta.env.VITE_API_LINK + "addbookingdetails/",
          { awbno: awbno, pcs: pcs, wt: wt, doctype: doc_type },
          {
            headers: {
              Authorization: "Token " + localStorage.getItem("token"),
            },
            withCredentials: true,
          },
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
        })
        .catch((error) => {
          console.error("Error submitting booking:", error);
          setclick(false);
        });
    }
  };

  return (
    <div className="input_con">
      <label htmlFor={name} className="label">
        {name} {required && "*"}
      </label>
      <div className="input_field">
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
          style={{ border: "none" }}
        />
        {loading && <Spinner />}
      </div>

      {prevalues.length > 0 && (
        <div className="previousval">
          {prevalues.map((value) => (
            <div className="prevalues" key={value}>
              <span className="preval_text">{value}</span>
              <button
                className="preval_close"
                onClick={() => ondelete(value)}
                aria-label={`Remove ${value}`}
              >
                <IoIosClose size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={popup}
        onRequestClose={() => setPopup(false)}
        contentLabel="Enter Booking Details"
        className="inscan_modal"
        overlayClassName="inscan_modal_overlay"
      >
        <h3 className="modal_title">Enter Booking Details</h3>

        <div className="modal_content">
          <div className="form_group">
            <label className="form_label">Document Type</label>
            <div className="radio_group">
              <label className="radio_label">
                <input
                  type="radio"
                  name="doc_type"
                  value="docx"
                  checked={doc_type === "docx"}
                  onChange={(e) => setDoc_type(e.target.value)}
                />
                <span>Docx</span>
              </label>
              <label className="radio_label">
                <input
                  type="radio"
                  name="doc_type"
                  value="non-docx"
                  checked={doc_type === "non-docx"}
                  onChange={(e) => setDoc_type(e.target.value)}
                />
                <span>Non-Docx</span>
              </label>
            </div>
          </div>

          <div className="form_group">
            <label className="form_label" htmlFor="pcs">
              Pieces
            </label>
            <input
              id="pcs"
              type="number"
              value={pcs}
              onChange={(e) => setPcs(e.target.value)}
              className="form_input"
              placeholder="Enter pieces"
              required
            />
          </div>

          <div className="form_group">
            <label className="form_label" htmlFor="wt">
              Weight (kg)
            </label>
            <input
              id="wt"
              type="number"
              value={wt}
              onChange={(e) => setWt(e.target.value)}
              className="form_input"
              placeholder="Enter weight"
              required
            />
          </div>

          <div className="modal_actions">
            {click ? (
              <Spinner />
            ) : (
              <>
                <Button
                  name="Cancel"
                  onclick={() => setPopup(false)}
                  className="btn_secondary"
                />
                <Button
                  name="Submit"
                  onclick={handleSubmit}
                  className="btn_primary"
                />
              </>
            )}
          </div>
        </div>
      </Modal>

      {error && <div className="input_error">{error}</div>}
    </div>
  );
};

export default InputField;
