import { Menu, Icon, Button } from 'antd';
import style from './style.less';
import React from 'react';
const { SubMenu } = Menu;

class App extends React.PureComponent {
  state = {
    collapsed: false,
  };
  render() {
    return (
      <div className={style.menuLayout}>
        <Icon
          type={this.state.collapsed ? 'double-left' : 'double-right'}
          className={style.clickIcon}
          style={{ right: this.state.collapsed ? '0' : '-10px' }}
          onClick={() => this.setState(({ collapsed }) => ({ collapsed: !collapsed }))}
        />
        <div
          style={{
            width: this.state.collapsed ? 200 : 0,
            overflow: 'hidden',
            height: '100%',
            transition: 'all .3s',
          }}
        >
          <Menu mode="inline" theme="light" style={{ height: '100%', borderTop: '1px solid #ccc' }}>
            {this.props.menuData.map((item, i) => {
              // onClick={this.addTab.bind(this, item, i)}
              return (
                <Menu.Item key={i} onClick={() => this.props.handleClickTargetMenuItem(item, i)}>
                  {item.menuName}
                </Menu.Item>
              );
            })}
          </Menu>
        </div>
      </div>
    );
  }
}

export default App;
