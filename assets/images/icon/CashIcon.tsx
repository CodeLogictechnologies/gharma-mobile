import * as React from "react";
import Svg, { Path } from "react-native-svg";
const CashIcon = (props: any) => (
  <Svg
    width={36}
    height={36}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M18 27H6C5.20435 27 4.44129 26.6839 3.87868 26.1213C3.31607 25.5587 3 24.7956 3 24V12C3 11.2044 3.31607 10.4413 3.87868 9.87868C4.44129 9.31607 5.20435 9 6 9H30C30.7956 9 31.5587 9.31607 32.1213 9.87868C32.6839 10.4413 33 11.2044 33 12V19.5M24 28.5L28.5 33M28.5 33L33 28.5M28.5 33V24M27 18H27.015M9 18H9.015M21 18C21 19.6569 19.6569 21 18 21C16.3431 21 15 19.6569 15 18C15 16.3431 16.3431 15 18 15C19.6569 15 21 16.3431 21 18Z"
      stroke="black"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default CashIcon;
