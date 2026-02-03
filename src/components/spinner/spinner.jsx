import "./spinner.css";

export const Spinner = ({ size = "md", color = "primary", pulse = false }) => {
  const classes = [
    "spinner",
    `spinner--${size}`,
    `spinner--${color}`,
    pulse && "spinner--pulse",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="spinner-wrapper">
      <div className={classes}>
        <div className="spinner__ring" role="status" aria-label="Loading" />
      </div>
    </div>
  );
};
