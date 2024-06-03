import "./styles.css"

const Card = ({ children, heading }) => {
  return <div className="card-container">
    <h1>{heading}</h1>
    {children}</div>;
};


export default Card