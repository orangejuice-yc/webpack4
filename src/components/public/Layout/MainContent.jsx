import React from 'react';
import PublicTable from '../../../components/PublicTable';

export default function MainContent  (props){

  function getHeight(){
    //初始化css样式
    let h = document.documentElement.clientHeight || document.body.clientHeight;   //浏览器高度，用于设置组件高度
    return h - 215;
  }
  // 高度
  let height = getHeight();
  let {children,contentWidth,contentMinWidth,initLayoutWidth,surplusWidth} = props;
  surplusWidth = surplusWidth || 0;
  contentWidth = contentWidth && contentWidth >0 ? contentWidth : initLayoutWidth;
  contentWidth = contentWidth - surplusWidth;
  let newProps = {...props,layout_ : { contentHeight: height,contentWidth ,contentMinWidth}};
  delete(newProps["children"]);

  return (
    <span>
      {
        React.Children.map(children, function (child) {

          if(child != null && child.type === PublicTable){
             let p = {...newProps,mainContent:true}
             let newReact = React.cloneElement(child, p);
             return <span>{newReact} </span>;
          }else if(child != null && child.type === MainContent){
            let newReact = React.cloneElement(child, newProps || {});
            return <span>{newReact} </span>;
          }
          return <span>{child}</span>;
        })
      }
    </span>
  );
}
