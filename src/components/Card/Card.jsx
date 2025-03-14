import { Link } from 'react-router-dom';
import './Card.css';

const Card = ({ id, brand, name, rating, description, category, image }) => {
    return (
        <Link to={`/energies/${id}`} className="product-link">
            <div className="product__item">
                <h3 className="brand">{brand}</h3>
                <p className="name">{name}</p>
                <p className="rating">{rating}</p>
                <p className="rating">{rating}</p>
                <p className="description">{description}</p>
                <p className="category">{category}</p>
                <p className="image">{image}</p>
            </div>
        </Link>
    );
};

export default Card;