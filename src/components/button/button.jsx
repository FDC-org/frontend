import "./button.css";
import PropTypes from "prop-types";
const Button = ({ name, onclick }) => {
  return (
    <button className="button" onClick={onclick}>
      {name}
    </button>
  );
};

Button.propTypes = {
  name: PropTypes.string.isRequired,
  onclick: PropTypes.object.isRequired,
};
export default Button;
