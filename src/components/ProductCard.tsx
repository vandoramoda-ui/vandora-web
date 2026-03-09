import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/utils';
import { motion } from 'motion/react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  colors?: { name: string; code: string }[];
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, image, category, colors }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative"
    >
      <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-200 group-hover:opacity-75 transition-opacity">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover object-center"
          loading="lazy"
        />
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700 font-medium">
            <Link to={`/producto/${category.toLowerCase()}/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-gray-500 capitalize">{category}</p>
          {colors && colors.length > 0 && (
            <div className="flex gap-1 mt-2">
              {colors.map((color, idx) => (
                <div
                  key={idx}
                  className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: color.code }}
                  title={color.name}
                />
              ))}
            </div>
          )}
        </div>
        <p className="text-sm font-medium text-gray-900">{formatPrice(price)}</p>
      </div>
      <button className="mt-4 w-full bg-vandora-black text-white py-2 px-4 rounded opacity-0 group-hover:opacity-100 transition-opacity text-sm uppercase tracking-wide">
        Ver Detalles
      </button>
    </motion.div>
  );
};

export default ProductCard;
