/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";

const useTextSelection = () => {
  // we need a reference to the element wrapping the text in order to determine
  // if the selection is the selection we are after
  const ref = useRef<HTMLElement>();

  // we store info about the current Range here
  const [range, setRange] = useState<Range | null>(null);

  // In this effect we're registering for the documents "selectionchange" event
  useEffect(() => {
    function handleChange() {
      // get selection information from the browser
      const selection: Selection | null = window.getSelection();

      // we only want to proceed when we have a valid selection
      if (
        !selection ||
        selection.isCollapsed ||
        !selection.containsNode(ref?.current as any, true)
      ) {
        setRange(null);
        return;
      }

      setRange(selection.getRangeAt(0));
    }

    document.addEventListener("selectionchange", handleChange);
    return () => document.removeEventListener("selectionchange", handleChange);
  }, []);

  return { range, ref };
};

export default useTextSelection;
