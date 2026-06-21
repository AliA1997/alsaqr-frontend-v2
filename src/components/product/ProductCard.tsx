import { OptimizedPostImage } from "@common/Image";
import type { ProductRecord } from "@models/product";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Ported from alsaqr-zook (https://github.com/AliA1997/alsaqr-zook)
interface ProductCardProps {
  product: ProductRecord;
  onClick?: () => void;
  showCategory?: boolean;
  classNames?: string;
  cardClassNames?: string;
  testId?: string;
}

export default function ProductCard({
  classNames,
  cardClassNames,
  product,
  onClick,
  showCategory,
  testId,
}: ProductCardProps) {
  const navigate = useNavigate();

  const imageUrl = useMemo(() => {
    return product.images && product.images.length > 0
      ? product.images[0]
      : "https://via.placeholder.com/200";
  }, [product]);

  return (
    <a
      href={onClick ? "" : `/products/${product.slug}`}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
        else navigate(`/products/${product.slug}`);
      }}
      className={`block transition-transform duration-200 hover:scale-[1.02] ${classNames ?? ""}`}
      data-testid={testId ?? "productcard"}
    >
      <div
        className={`flex h-full w-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0e1517] ${cardClassNames ?? ""}`}
      >
        <div className="relative flex items-center justify-center p-1">
          <OptimizedPostImage
            src={imageUrl}
            alt={product.title}
            classNames="h-40 w-full rounded-md object-cover"
          />
        </div>

        <div className="p-2 pt-0">
          <h3
            data-testid="producttext"
            className="line-clamp-2 w-full text-sm font-medium leading-tight sm:text-base"
          >
            {product.title}
          </h3>
          {showCategory && (
            <p className="text-sm text-gray-500">{product.category}</p>
          )}
        </div>

        <div className="w-full p-2 pt-0">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            ${product.price?.toLocaleString("en-US")}
          </p>
        </div>
      </div>
    </a>
  );
}
