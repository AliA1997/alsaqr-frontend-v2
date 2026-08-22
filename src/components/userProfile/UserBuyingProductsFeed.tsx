import { useRef } from "react";
import type { ProductRecord } from "@models/product";
import { ContentContainerWithRef } from "@common/Containers";
import { NoRecordsTitle } from "@common/Titles";
import ProductCard from "@components/product/ProductCard";

interface Props {
  products: ProductRecord[];
}

// Displays the zook products the user is buying (has purchased or reserved).
function UserBuyingProductsFeed({ products }: Props) {
  const containerRef = useRef(null);

  return (
    <ContentContainerWithRef
      classNames="text-left grid w-full max-w-7xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
      innerRef={containerRef}
      testId="userbuyingproductsfeed"
    >
      {products && products.length ? (
        products.map((product) => (
          <ProductCard key={product.id} product={product} showCategory />
        ))
      ) : (
        <NoRecordsTitle>You are not buying anything yet.</NoRecordsTitle>
      )}
    </ContentContainerWithRef>
  );
}

export default UserBuyingProductsFeed;
