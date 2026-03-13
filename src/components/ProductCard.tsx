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
      <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gray-200 transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02] relative">
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-white/90 backdrop-blur-sm text-vandora-emerald text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter shadow-sm">Nuevo Legado</span>
        </div>
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
            <Link to={`/producto/${(category || 'general').toLowerCase()}/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}>
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
        <p className="text-[#B8860B] font-serif font-bold text-base">{formatPrice(price)}</p>
      </div>
      <button className="mt-4 w-full bg-vandora-black text-white py-3 px-4 rounded-xl md:opacity-0 group-hover:opacity-100 transition-all duration-300 text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-gray-800">
        Ver Detalles
      </button>
    </motion.div>
  );
};

export default ProductCard;
