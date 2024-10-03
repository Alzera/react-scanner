import { useRef, useState } from "react";

export function useImmediateState<S>(
  initialState: S | (() => S)
): [React.MutableRefObject<S>, React.Dispatch<React.SetStateAction<S>>];
export function useImmediateState<S = undefined>(): [
  React.MutableRefObject<S | undefined>,
  React.Dispatch<React.SetStateAction<S | undefined>>
];

export function useImmediateState<S>(
  initialState?: S | (() => S)
): [
  React.MutableRefObject<S | undefined>,
  React.Dispatch<React.SetStateAction<S | undefined>>
] {
  const initial =
    typeof initialState === "function"
      ? (initialState as () => S)()
      : initialState;

  const [state, setState] = useState<S | undefined>(initial);
  const reference = useRef<S | undefined>(initial);
  reference.current = state;

  return [reference, setState];
}
