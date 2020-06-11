import React from 'react';
import style from './style.less';
import Header from '../../../components/public/HeaderEps/index'; //头部组件，包含菜单
import HomeBox from '../../../modules/Index/index';
import { Tabs, notification } from 'antd';
import router from 'next/router';
// import dynamic from 'next/dynamic';

const TabPane = Tabs.TabPane;
import { connect } from 'react-redux';
import RightClickTpl from '../../../components/RightClickMenu';
import { bindActionCreators } from 'redux';
import * as sysMenuAction from '../../../store/sysMenu/action';
import * as localAction from '../../../store/localeProvider/action';
import axios from '../../../api/axios';
import { getProcessInstByProcInstId, menuGetByMenuCode } from '../../../api/api';

var CryptoJS = require('crypto-js');
var CRYPTOJSKEY = CryptoJS.enc.Utf8.parse('wisdom!QAZ!@#123');

class Home extends React.Component {
  constructor(props) {
    super(props);
    const panes = [
      //tab集合，默认加载首页，不可关闭页签
      {
        title: '首页',
        content: (
          <HomeBox
            fileUrl="Index"
            openMenuByMenuCode={this.openMenuByMenuCode}
            openWorkFlowMenu={this.openWorkFlowMenu}
            callBackBanner={this.callBackBanner}
            rightClickMenu={this.rightClickMenu}
          />
        ),
        key: '1',
        closable: false,
        parentId: 0,
        titleName: (
          <span
            style={{ width: '92%', height: '100%', display: 'inline-block' }}
            onContextMenu={this.clickMenu.bind(this, { id: 1 })}
          >
            {'首页'}
          </span>
        ),
        x: '0',
        y: '0',
        rightClickShow: false,
        times: '1',
        menuCode: 'HOME',
      },
    ];
    this.state = {
      panes: panes, //tab集合
      activeKey: panes[0].key, //tab当前显示位置`
      activityId: '',
      rightClickData: [],
    };
  }

  encrypt = word => {
    let srcs = CryptoJS.enc.Utf8.parse(word);
    let encrypted = CryptoJS.AES.encrypt(srcs, CRYPTOJSKEY, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  };

  decrypt = word => {
    var decrypt = CryptoJS.AES.decrypt(word, CRYPTOJSKEY, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
  };

  componentDidMount() {
    localStorage.setItem('openedProject', '');
    localStorage.setItem('name', '首页');
    //中英文设置
    let language = localStorage.getItem('acmlanguage');
    if (language) {
      this.props.actions.initLocaleProvider(language);
    }
    document.addEventListener('click', this.closeRight);
    let userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (!userInfo) {
      router.push('/login');
      return;
    }
    this.props.actions.setSysMenu(userInfo.loginMenu.left);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.closeRight, false);
  }

  closeRight = () => {
    this.setState({
      rightClickShow: false,
    });
  };

  /**
   * 根据模块获取模块信息
   *
   * @param menuCode
   * @returns {*}
   */
  getMenuInfoByMenuCode = menuCode => {
    let userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    let retItem = null;
    userInfo.loginMenu.left.forEach(item => {
      if (item.children) {
        item.children.forEach(v => {
          if (v.menuCode == menuCode) {
            retItem = v;
          }
        });
      }
    });
    return retItem;
  };

  /**
   * 打开工作项
   *
   */
  openWorkFlowMenu = (proc = {}) => {
    // 流程处理界面
    let menuInfo = {
      menuCode: 'FLOW',
      menuName: '流程处理',
      url: 'Components/Workflow/Form',
      id: -1000,
      parentId: 0,
      proc_: proc,
    };
    let { procInstId } = proc;
    this.getBizTypeByProcInstId(procInstId, data => {
      this.callBackBanner(menuInfo, true, { proc: { ...proc, ...data } });
    });
  };

  /**
   *
   */
  getBizTypeByProcInstId = (procInstId, callback) => {
    axios.get(getProcessInstByProcInstId(procInstId)).then(res => {
      this.getMenuInfoByMenuInfo(res.data.data, callback);
    });
  };

  getMenuInfoByMenuInfo = (info, callback) => {
    const { moduleCode } = info;
    axios.get(menuGetByMenuCode(moduleCode)).then(res => {
      let newdata = { ...info, menuInfo: res.data.data };
      callback && callback(newdata);
    });
  };

  /**
   * 根据模块代码打开模块
   * @param menuCode
   * @param isRefresh
   * @param beforeCallback
   */
  openMenuByMenuCode = (menuCode, isRefresh, beforeCallback) => {
    // 获取信息
    let menuInfo = this.getMenuInfoByMenuCode(menuCode);
    if (!menuInfo) {
      notification.warning({
        placement: 'bottomRight',
        bottom: 50,
        duration: 2,
        message: '提示',
        description: '无访问权限',
      });
      return;
    }
    if (beforeCallback && typeof beforeCallback == 'function') {
      beforeCallback(menuInfo);
    }
    // 打开菜单
    this.callBackBanner(menuInfo, isRefresh);
  };

  //监听导航栏操作，添加页签 name=当前菜单名称，ComponentName=模块文件位置
  /**
   *menuInfo:菜单信息
   isRefresh：是否刷新
   */
  callBackBanner = (menuInfo, isRefresh, datas = {}) => {
    const { panes } = this.state;
    //判断是否已存在，如存在，切换tab当前点击元素位置
    localStorage.setItem('name', menuInfo.menuCode);
    const ComponentNames = () => import('../../../components/public/Main/index');
    for (var i = 0; i < panes.length; i++) {
      if (menuInfo.menuCode == panes[i].menuCode) {
        this.setState(
          {
            activeKey: panes[i].key.toString(),
          },
          () => {
            if (isRefresh) {
              panes[i]['content'] = (
                <ComponentNames
                  time={new Date().valueOf()}
                  menuInfo={menuInfo}
                  activeKey={this.state.activeKey}
                  callBackBanner={this.callBackBanner}
                  openWorkFlowMenu={this.openWorkFlowMenu}
                  rightClickMenu={this.rightClickMenu}
                  openMenuByMenuCode={this.openMenuByMenuCode}
                  {...datas}
                />
              );
              this.setState({
                panes,
              });
            }
          }
        );
        return;
      }
    }
    const activeKey = menuInfo.id;
    panes.push({
      title: menuInfo.menuName,
      titleName: (
        <span
          style={{ width: '92%', height: '100%', display: 'inline-block' }}
          onContextMenu={this.clickMenu.bind(this, menuInfo)}
        >
          {menuInfo.menuName}
        </span>
      ),
      content: (
        <ComponentNames
          menuInfo={menuInfo}
          activeKey={this.state.activeKey}
          callBackBanner={this.callBackBanner}
          openWorkFlowMenu={this.openWorkFlowMenu}
          openMenuByMenuCode={this.openMenuByMenuCode}
          rightClickMenu={this.rightClickMenu}
          {...datas}
        />
      ),
      key: activeKey.toString(),
      parentId: menuInfo.parentId,
      times: menuInfo.id,
      menuCode: menuInfo.menuCode,
    });
    this.setState({
      panes: panes,
      activeKey: activeKey.toString(),
      activityId: menuInfo.parentId,
    });
  };

  //打开收藏模块
  openFevModal = data => {
    //判断是否已存在，如存在，切换tab当前点击元素位置
    const panes = this.state.panes;
    let activeKey;
    data.forEach(item => {
      for (var i = 0; i < this.state.panes.length; i++) {
        if (item.menuCode == this.state.panes[i].menuCode) {
          return;
        }
      }
      const ComponentNames = () => import('../../../components/public/Main/index');
      activeKey = item.id;
      panes.push({
        title: item.menuName,
        titleName: (
          <span
            style={{ width: '92%', height: '100%', display: 'inline-block' }}
            onContextMenu={this.clickMenu.bind(this, item)}
          >
            {item.menuName}
          </span>
        ),
        content: (
          <ComponentNames
            time={item.times}
            callBackBanner={this.callBackBanner}
            rightClickMenu={this.rightClickMenu}
            openMenuByMenuCode={this.openMenuByMenuCode}
            openWorkFlowMenu={this.openWorkFlowMenu}
            menuInfo={item}
          />
        ),
        key: activeKey.toString(),
        menuCode: item.menuCode,
      });
    });
    for (var i = 0; i < this.state.panes.length; i++) {
      if (data[data.length - 1].menuCode == this.state.panes[i].menuCode) {
        this.setState({
          panes,
          activeKey: this.state.panes[i].key.toString(),
        });
        return;
      }
    }
  };

  //操作当前tab
  onChangeTab = activeKey => {
    this.setState({ activeKey });
    for (var i = 0; i < this.state.panes.length; i++) {
      if (activeKey == this.state.panes[i].key) {
        this.setState({
          activityId: this.state.panes[i].parentId,
        });
        localStorage.setItem('name', this.state.panes[i].menuCode);
        return;
      }
    }
  };

  //关闭当前tab
  onEdit = (targetKey, action) => {
    let activeKey = this.state.activeKey;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
        this.setState({
          activityId: this.state.panes[lastIndex].parentId,
        });
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].key;
      this.setState({
        activityId: this.state.panes[lastIndex].parentId,
      });
      localStorage.setItem('name', panes[lastIndex].menuCode);
    }
    this.setState({ panes, activeKey });
  };

  clickMenu = (menuInfo, e) => {
    e.preventDefault();
    this.setState({
      x: event.clientX,
      y: event.clientY - 105,
      rightClickShow: true,
      rightClickData: menuInfo,
    });
  };

  //右击菜单选项
  rightClickMenu = menu => {
    var panes = this.state.panes;
    var num = 0;
    //关闭其他
    if (menu == 'deleteOther') {
      var data = [];
      for (var i = 0; i < panes.length; i++) {
        if (panes[i].key == 1 || panes[i].key == this.state.rightClickData.id) {
          num++;
          data.push(panes[i]);
        }
      }
      this.setState({
        panes: data,
        activeKey: data[num - 1].key,
      });
    }
    //关闭当前  //首页无法关闭
    if (menu == 'deleteCurrent') {
      var key = this.state.activeKey;
      for (var i = 0; i < panes.length; i++) {
        if (panes[i].key != 1 && panes[i].key == this.state.rightClickData.id) {
          //判断是否是当前打开的tab 关闭，是需要处理 tab activeKey属性
          if (panes[i].key == key) {
            key = panes[i - 1].key;
          }
          panes.splice(i, 1);
        }
      }
      this.setState({
        panes: panes,
        activeKey: key,
      });
    }
    if (menu == 'refresh') {
      //刷新当前模块，判断是否是首页，非首页按模块映射地址重新加载模块，首页直接重新加载首页模块
      let times = new Date().valueOf();
      const ComponentNames = () => import('../../../components/public/Main/index');
      const activeKey = this.state.rightClickData.id;

      if (activeKey == -1000) {
        let { proc_ } = this.state.rightClickData;
        this.openWorkFlowMenu(proc_);
        return;
      }
      let flog = false; //刷新状态
      for (var i = 0; i < panes.length; i++) {
        // 非首页模块刷新
        if (panes[i].key == activeKey && activeKey != 1) {
          flog = true;
          panes[i]['content'] = (
            <ComponentNames
              time={times}
              menuInfo={this.state.rightClickData}
              activeKey={activeKey}
              callBackBanner={this.callBackBanner}
              rightClickMenu={this.rightClickMenu}
              openWorkFlowMenu={this.openWorkFlowMenu}
              openMenuByMenuCode={this.openMenuByMenuCode}
            />
          );
        }
      }
      if (!flog) {
        //首页模块刷新
        const ComponenTpl = () => import('../../../modules/Index/index');
        panes[0]['content'] = (
          <ComponenTpl
            fileUrl="Index"
            time={times}
            openMenuByMenuCode={this.openMenuByMenuCode}
            rightClickMenu={this.rightClickMenu}
            callBackBanner={this.callBackBanner}
            openWorkFlowMenu={this.openWorkFlowMenu}
          />
        );
      }
      this.setState({
        panes: panes,
      });
    }
    //关闭右击菜单
    this.setState({
      rightClickShow: false,
    });
  };

  render() {
    return (
      <div className={style.main}>
        <Header
          callBackBanner={this.callBackBanner}
          menuData={this.props.menuData}
          activeKey={this.state.activeKey}
          openWorkFlowMenu={this.openWorkFlowMenu}
          openFevModal={this.openFevModal}
          layoutType="LAYOUT1"
        />

        <Tabs
          tabPosition="bottom"
          onChange={this.onChangeTab}
          hideAdd={true}
          type="editable-card"
          onEdit={this.onEdit}
          activeKey={this.state.activeKey}
          tabBarGutter={0}
          animated={true}
        >
          {this.state.panes.map(pane => (
            <TabPane
              tab={pane.titleName}
              key={pane.key}
              closable={pane.closable}
              times={pane.times}
            >
              {pane.content}
            </TabPane>
          ))}
        </Tabs>
        {this.state.rightClickShow && (
          <RightClickTpl
            rightClickData={this.state.rightClickData}
            x={this.state.x}
            y={this.state.y}
            handleClick={this.rightClickMenu}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    currentLocale: state.localeProviderData,
    // menuData: state.menuData,
    // record:state.sysMenu.record,
    menuData: state.sysMenu.menuData,
  };
};
const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Object.assign({}, sysMenuAction, localAction), dispatch),
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
// export default connect(state=>({
//   menuData: state.menuData
// }),{changeMenuData})(Home)
