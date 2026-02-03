import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import PropTypes from "prop-types";
import "./cards.css";

const Cards = ({ name, animationlink, onclick }) => {
  return (
    <article
      className="card"
      onClick={onclick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onclick();
        }
      }}
    >
      <div className="card__animation-wrapper">
        <DotLottieReact
          className="card__animation"
          autoplay
          loop
          src={animationlink}
        />
      </div>
      <h3 className="card__title">{name}</h3>
    </article>
  );
};

Cards.propTypes = {
  name: PropTypes.string.isRequired,
  animationlink: PropTypes.string.isRequired,
  onclick: PropTypes.func.isRequired,
};

export default Cards;
