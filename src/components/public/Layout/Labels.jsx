import React from 'react';


export default function Toolbar({children,props}){

  return (
    <div>
      {
        React.Children.map(children, function (child) {
          return {child};
        })
      }
    </div>
  );
}
