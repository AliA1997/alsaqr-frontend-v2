import { useRef } from "react";
import type { ProductRecord } from "@models/product";
import { ContentContainerWithRef } from "@common/Containers";
import { NoRecordsTitle } from "@common/Titles";
import ProductCard from "@components/product/ProductCard";

interface Props {
  products: ProductRecord[];
}

// Displays the zook products the user is selling (created).
function UserSellingProductsFeed({ products }: Props) {
  const containerRef = useRef(null);

  return (
    <ContentContainerWithRef
      classNames="text-left grid w-full max-w-7xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
      innerRef={containerRef}
      testId="usersellingproductsfeed"
    >
      {products && products.length ? (
        products.map((product) => (
          <ProductCard key={product.id} product={product} showCategory />
        ))
      ) : (
        <NoRecordsTitle>You are not selling anything yet.</NoRecordsTitle>
      )}
    </ContentContainerWithRef>
  );
}

export default UserSellingProductsFeed;
