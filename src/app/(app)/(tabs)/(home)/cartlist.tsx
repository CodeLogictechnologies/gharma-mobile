import Cart from "@/screen/cart/Cart";
import { useAddtoCartList } from "@/screen/cart/hooks";
import React from "react";

const cartlist = () => {
  const { data: AddToCArtList, isPending: isAddToCArtListPending } =
    useAddtoCartList();
  return (
    <>
      <Cart data={AddToCArtList?.data || []} />
    </>
  );
};

export default cartlist;
