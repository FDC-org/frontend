import { useEffect } from "react";
import { isLoggedIn } from "../../components/auth";
import { useNavigate } from "react-router-dom";
import Cards from "../../components/cards/cards";
import './dashbaord.css'

export const Dashboard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn()) navigate("/login");
  }, [isLoggedIn, navigate]);

  return (
    <div className="dashboard_con">
      <Cards
        name={"Booking"}
        animationlink={
          "https://lottie.host/98f13bce-638f-46ef-9164-b9e9939257c6/Jcew5ot42F.lottie"
        }
        onclick={() => navigate("/booking")}
      />
      <Cards
        name={"Inscan"}
        animationlink={
          "https://lottie.host/83a6e64d-afc6-45f0-bed1-e86a66d4f733/zI3x1Joh3c.lottie"
        }
        onclick={() => navigate("/inscan")}
      />
      <Cards
        name={"OutScan"}
        animationlink={
          "https://lottie.host/83a6e64d-afc6-45f0-bed1-e86a66d4f733/zI3x1Joh3c.lottie"
        }
        onclick={() => navigate("/outscan")}
      />
      <Cards
        name={"DRS"}
        animationlink={
          "https://lottie.host/7f0046ab-b091-4c4a-b0da-6c6874b6b472/IIaoqOyqQZ.lottie"
        }
        onclick={() => navigate("/drs")}
      />
    </div>
  );
};
