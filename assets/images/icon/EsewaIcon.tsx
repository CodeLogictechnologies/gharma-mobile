import * as React from "react";
import Svg, { Defs, Image, Pattern, Rect, Use } from "react-native-svg";
const EsewaIcon = (props: any) => (
  <Svg
    width={36}
    height={34}
    viewBox="0 0 36 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    {...props}
  >
    <Rect width={36} height={34} fill="url(#pattern0_2547_2822)" />
    <Defs>
      <Pattern
        id="pattern0_2547_2822"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}
      >
        <Use
          xlinkHref="#image0_2547_2822"
          transform="matrix(0.00491898 0 0 0.00520833 -0.00173611 0)"
        />
      </Pattern>
      <Image
        id="image0_2547_2822"
        width={204}
        height={192}
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </Defs>
  </Svg>
);
export default EsewaIcon;
