import { useEffect } from "react";
import { isLoggedIn } from "../../components/auth";
import { useNavigate } from "react-router-dom";
import Cards from "../../components/cards/cards";
import "./dashbaord.css";

export const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
    }
  }, [navigate]);

  const dashboardCards = [
    {
      id: 1,
      name: "Booking",
      animationLink:
        "https://lottie.host/98f13bce-638f-46ef-9164-b9e9939257c6/Jcew5ot42F.lottie",
      path: "/booking",
    },
    {
      id: 2,
      name: "Inscan",
      animationLink:
        "https://lottie.host/83a6e64d-afc6-45f0-bed1-e86a66d4f733/zI3x1Joh3c.lottie",
      path: "/inscan",
    },
    {
      id: 3,
      name: "OutScan",
      animationLink:
        "https://lottie.host/83a6e64d-afc6-45f0-bed1-e86a66d4f733/zI3x1Joh3c.lottie",
      path: "/outscan",
    },
    {
      id: 4,
      name: "DRS",
      animationLink:
        "https://lottie.host/7f0046ab-b091-4c4a-b0da-6c6874b6b472/IIaoqOyqQZ.lottie",
      path: "/drs",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        <div className="dashboard__grid">
          {dashboardCards.map((card) => (
            <Cards
              key={card.id}
              name={card.name}
              animationlink={card.animationLink}
              onclick={() => navigate(card.path)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
