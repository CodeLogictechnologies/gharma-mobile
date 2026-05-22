import * as React from "react";
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from "react-native-svg";
const ShoppingCartIcon = (props: any) => (
  <Svg
    width={69}
    height={69}
    viewBox="0 0 69 69"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G filter="url(#filter0_d_2239_1138)">
      <Circle cx={34.0918} cy={34.0908} r={25} fill="#DFF2FE" />
    </G>
    <G clipPath="url(#clip0_2239_1138)">
      <Path
        d="M21.8652 20.5908H27.8652L31.8852 40.6758C32.0224 41.3664 32.3981 41.9868 32.9466 42.4283C33.495 42.8698 34.1813 43.1043 34.8852 43.0908H49.4652C50.1692 43.1043 50.8555 42.8698 51.4039 42.4283C51.9524 41.9868 52.3281 41.3664 52.4652 40.6758L54.8652 28.0908H29.3652M35.3652 50.5908C35.3652 51.4192 34.6937 52.0908 33.8652 52.0908C33.0368 52.0908 32.3652 51.4192 32.3652 50.5908C32.3652 49.7624 33.0368 49.0908 33.8652 49.0908C34.6937 49.0908 35.3652 49.7624 35.3652 50.5908ZM51.8652 50.5908C51.8652 51.4192 51.1937 52.0908 50.3652 52.0908C49.5368 52.0908 48.8652 51.4192 48.8652 50.5908C48.8652 49.7624 49.5368 49.0908 50.3652 49.0908C51.1937 49.0908 51.8652 49.7624 51.8652 50.5908Z"
        stroke="black"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_2239_1138">
        <Rect
          width={36}
          height={36}
          fill="white"
          transform="translate(20.3652 19.0908)"
        />
      </ClipPath>
    </Defs>
  </Svg>
);
export default ShoppingCartIcon;
