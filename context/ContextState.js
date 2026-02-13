import React, { memo } from "react";
import Context from "./Context";
import useCombineState from "./CombineState";


const ContextState = (props) => {
   const combinedState = useCombineState();
   return (
       <Context.Provider value={combinedState}>{props.children}</Context.Provider>
   );
};


export default memo(ContextState);