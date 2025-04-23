import Button from "../button/button";
import './popup.css'
const Popup = ({senddata}) => {
  return <div className="popup">
    <input type="text" name="pcs" className="input_field"  />
    <input type="text" name="wt" className="input_field" />
    <Button name={"Add"} onclick={senddata}/>
  </div>;
};

export default Popup