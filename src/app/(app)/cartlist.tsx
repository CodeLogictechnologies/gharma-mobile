import Cart from "@/features/cart/Cart";
import { useAddtoCartList } from "@/features/cart/hooks";
import React from "react";

const cartlist = () => {
  const { data: AddToCArtList, isPending: isAddToCArtListPending } =
    useAddtoCartList();

  // if (isAddToCArtListPending) return <Spinner />;
  return (
    <>
      <Cart data={AddToCArtList?.data || []} />
    </>
  );
};

export default cartlist;
