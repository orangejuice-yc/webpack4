import React from 'react';


export default function Toolbar(props){

  let {children} = props || {};
  return (
    <span>
      {
        React.Children.map(children, function (child) {
          return <span>{child}</span>;
        })
      }
    </span>
  );
}
