import { Link } from 'react-router-dom';
import '../assets/CardForCar.css';

function CardForCar({
  brand,
  model,
  carIMG,
  showInfo,
}: {
  brand: string | null;
  model: string | null;
  carIMG: string;
  showInfo: boolean;
}) {
  return (
    <section>
      <figure className="card">
        <Link to={`/project2/carpage/${brand}-${model}`}>
          <img src={carIMG} className="car-image" alt={`${brand}-${model}`} />
        </Link>
      </figure>
      {showInfo ? (
        <div className="car-name">
          <div className="car-title-wrapper">
            <h1 className="car-title">{brand}</h1>
            <p className="car-title">{model}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
export default CardForCar;
