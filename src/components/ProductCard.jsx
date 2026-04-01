import { ShoppingBag } from 'lucide-react';
import './ProductCard.css';

export function ProductCard({ product }) {
    return (
        <div className="product-card">
            <div className="product-img-wrapper">
                <img src={product.image} alt={product.title} />
            </div>
            <div className="product-info">
                <h4 className="product-title">{product.title}</h4>
                <p className="product-seller">{product.seller}</p>
                <div className="product-bottom">
                    <span className="product-price">{product.price}</span>
                    <button className="buy-btn">
                        <ShoppingBag size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
