import { useState } from "react";

export const useIsHover = (initalValues: object) => {
  const [values, setValues] = useState(initalValues);

  return [
    values,
    (obj: { val: boolean, e: {target: { name: string } }}) =>
      setValues({
        ...values,
        [parseInt(obj.e.target.name)]: obj.val,
      }),
  ];
};
