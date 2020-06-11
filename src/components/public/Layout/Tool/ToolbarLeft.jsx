import React from 'react';

export default function ToolbarLeft(props_) {

  let children = props_.children;

  return (
    <span>
      {
        React.Children.map(children, function (child) {
          if(child != null) {
            return <span> {child} </span>
          }
          return <span></span>
        })
      }
    </span>
  );
}
