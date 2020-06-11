import React from 'react';

export default function ExtContent  (props){

  let {children} = props;
  let newProps = {...props};
  if(newProps["children"]){
    delete(newProps["children"]);
  }
  return (
    <span>
      {
        React.Children.map(children, function (child) {

          if(child != null ){ // && (child.type === PublicTable || child.type === ExtLayout)
             let newReact = React.cloneElement(child, newProps || {});
             return <span>{newReact} </span>;
          }
          return <span>{child}</span>;
        })
      }
    </span>
  );
}
