import { useEffect } from "react";
import "./toast.css";
import PropTypes from "prop-types";
import { IoCloseCircleOutline } from "react-icons/io5";

const Toast = ({ message, type, onclose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onclose();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [onclose]);

  return (
    <div
      className={
        type == "success"
          ? "toast success"
          : type == "error"
          ? "toast error"
          : "toast warning"
      }
    >
      {message}
      <IoCloseCircleOutline size={20} onClick={() => onclose()} cursor={"pointer"}/>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  onclose: PropTypes.any.isRequired,
};

export default Toast;
