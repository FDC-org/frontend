import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import './cards.css'
import PropTypes from "prop-types";


const Cards = ({name,animationlink, onclick}) => {
  return (
    <div className="cards_con" onClick={(e) => onclick()}>
      <DotLottieReact
      className="card_anim"
        autoplay
        loop
        src={animationlink}
      />
      <div className="card_title">{name}</div>
    </div>
  );
};

Cards.propType = {
    name : PropTypes.string.isRequired,
    animationlink:PropTypes.string.isRequired,
    onclick:PropTypes.string.isRequired
}

export default Cards;
