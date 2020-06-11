import React, { Component } from 'react';
import style from './style.less';
import { Table, notification } from 'antd';
// import RightClickMenu from './RightClickMenu'; // 左侧机构树右键事件
import RoleAddModel from './AddModel'; // 新增弹框
import TreeTable from '@/components/PublicTable';
// import TopTags from './TopTags/index';
import RightTags from '@/components/public/RightTags/index';
import TipModal from '@/modules/Components/TipModal';
import { roleTree, deleteRole, orgSearch } from '@/api/api';
import {
  querySecurityExaminationModuleList,
  delSecurityExaminationModule,
  getPermission
} from '@/modules/Suzhou/api/suzhou-api';
import axios from '@/api/axios';
import MyIcon from '@/components/public/TopTags/MyIcon';
import { connect } from 'react-redux';
// import * as util from '@/utils/util';

//系统管理-组织机构
class sysRole extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rightClickShow: false, // 鼠标右键事件的菜单显示和隐藏
      roleVisible: false, // 控制弹窗的显示隐藏
      rightImgShow: true, // 控制提示图片显示和隐藏
      modelTitle: '', // 弹框标题
      loading: false, // loading状态默认不显示
      rightData: null, // 选中行数据
      x: 0, // 右键操作用于定位作用
      y: 0, // 右键操作用于定位作用
      data: [
        {
          id: 0,
          key: 1,
          orgType: 'tree',
          moduleName: '安全考核模板',
          children: null,
        },
      ],
      clickTreeName: '安全考核模板',
      groupCode: 1,
      // contentMenu:[
      //   {name: '新增组织机构', fun: 'add', type: 'buttom', icon: 'plus-square',isPublic:false},
      //   {name: '删除组织机构', fun: 'delete', type: 'buttom', icon: 'delete',isPublic:false}
      // ]
      permission:[]
    };
  }

  /**
   @method 父组件即可调用子组件方法
   @description 父组件即可调用子组件方法
   */
  onRef = ref => {
    this.child = ref;
  };

  /**
   @method 获取组织机构
   @description 获取组织机构
   */
  getRoleTree = callBack => {
    this.setState({
      loading: true,
    });
    let search = this.state.search || '';
    axios.get(querySecurityExaminationModuleList + `?searcher=${search}`).then(res => {
      if (res.data.data) {
        const data = this.state.data;
        data[0].children = res.data.data.length > 0 ? res.data.data : null;
        callBack(data);
        this.setState({
          data,
          rightData: null,
          loading: false,
          search: '',
        });
      }
    });
  };

  /**
   @method 移动回调
   @description table移动回调
   @param moveInfo {obj} 被移动数据
   @param positionID {int} 落脚点ID
   @param callback {fun}   回调给table组件，通知是否可以移动
   */
  callBackMoveList = (moveInfo, positionID, callback) => {
    this.setState({
      loading: true,
    });
    axios.get(roleTree).then(res => {
      callback(true);
      this.setState({
        loading: false,
      });
    });
  };

  // 控制弹窗的显示隐藏方法
  addShow = modelTitle => {
    this.setState({
      roleVisible: true,
      rightClickShow: false,
      modelTitle: modelTitle,
    });
  };

  handleCancel = () => {
    this.setState({
      roleVisible: false,
    });
  };

  /**
   @method 获取行数据
   @description table 点击行时获取行数据，record.orgType=='tree' 为真时则说明选中的是根结点，不存在有右侧页签状态
   @param record {obj} 行数据
   */
  getRowData = record => {
    const {permission} = this.state
    this.setState({
      rightData: record,
      rightImgShow: record.orgType == 'tree' ? true : false,
      groupCode: record.orgType == 'tree' ? -1 : 1, //禁止选择组织机构树
      clickTreeName: record.orgType == 'tree' ? 'tree' : 'org',
      contentMenu:
      permission.indexOf('TEMPLATE_EDIT-SAFETEMPLATE')!==-1 ? (
        record.orgType == 'tree'  
          ? [
              {
                name: '新增',
                fun: 'add',
                type: 'buttom',
                icon: 'plus-square',
                isPublic: false,
              },
            ]
          : [
              {
                name: '新增',
                fun: 'add',
                type: 'buttom',
                icon: 'plus-square',
                isPublic: false,
              },
              {
                name: '删除',
                fun: 'delete',
                type: 'buttom',
                icon: 'delete',
                isPublic: false,
              },
            ]):null
    });
  };

  /**
   @method 右键操作
   @description 右键操作时，获取行数据、设置点击位置、设置选中行、设置右侧页签组
   @param event {event} event
   @param record {obj} 右键时行数据
   */
  rightClickMenuShow = data => {
    let title = this.state.rightData.orgType == 'tree' ? '新增' : '新增';
    if (data.fun == 'add') {
      this.addShow(title);
    } else {
      this.openDeleteTip();
    }
  };

  /**
   @method 打开删除提示
   @description 打开删除提示
   */
  openDeleteTip = () => {
    if (this.state.rightData.orgType == 'tree') {
      notification.warning({
        placement: 'bottomRight',
        bottom: 50,
        duration: 2,
        message: '警告',
        description: '不能删除',
      });
      return;
    }
    this.setState({
      deleteTip: true,
    });
  };

  /**
   @method 删除组织机构
   @description  删除组织机构
   */
  deleteRole = () => {
    if (this.state.rightData) {
      axios
        .deleted(delSecurityExaminationModule, { data: [this.state.rightData.id] }, true)
        .then(res => {
          this.child.deleted(this.state.rightData);
          this.setState({
            rightData: null,
          });
        });
      this.setState({
        deleteTip: false,
      });
    } else {
      notification.warning({
        placement: 'bottomRight',
        bottom: 50,
        duration: 2,
        message: '未选中数据',
        description: '请选择数据进行操作',
      });
    }
  };

  //监听更新
  updateSuccess = newRecord => {
    this.child.update(this.state.rightData, newRecord);
  };

  //新增
  addSuccess = value => {
    this.child.add(this.state.rightData, value);
  };

  unShow = () => {
    this.setState({
      roleVisible: false,
    });
  };

  //搜索
  search = val => {
    let search = val.trim();
    this.setState(
      {
        search,
      },
      () => {
        this.child.getData();
      }
    );
  };
  componentDidMount() {
    let menuCode = 'SECURITY-TEMPLATE'
    axios.get(getPermission(menuCode)).then((res)=>{
      let permission = []
      res.data.data.map((item,index)=>{
        permission.push(item.code)
      })
      this.setState({
        permission
      })
    })
  }
  render() {
    const { intl } = this.props.currentLocale;
    const columns = [
      {
        title: '名称', //组织机构树
        dataIndex: 'moduleName',
        width: '50%',
        key: 'id',
        render: (text, record) => {
          if (record.orgType == 'tree') {
            return (
              <span title={text}>
                {' '}
                <MyIcon type="icon-zuzhijigou" /> {text}{' '}
              </span>
            );
          } else if (record.orgType == 0) {
            return (
              <span title={text}>
                {' '}
                <MyIcon type="icon-gongsi" /> {text}{' '}
              </span>
            );
          } else if (record.orgType == 1) {
            return (
              <span title={text}>
                {' '}
                <MyIcon type="icon-bumen1" /> {text}{' '}
              </span>
            );
          } else {
            return (
              <span title={text}>
                <MyIcon type="icon-gongsi" /> {text}
              </span>
            );
          }
        },
      },
      {
        title: '代码',
        dataIndex: 'moduleCode',
        key: 'moduleCode',
        width: '50%',
        render: text => <span title={text}>{text}</span>,
      },
    ];
    return (
      <div>
        {/* <TopTags search={this.search} /> */}
        <div className={style.main}>
          {/* 左侧组织机构树 */}
          <div className={style.leftTree100} style={{ height: this.props.height }}>
            <TreeTable
              contentMenu={this.state.contentMenu}
              onRef={this.onRef}
              getData={this.getRoleTree}
              move={this.callBackMoveList}
              dnd={false}
              dataSource={this.state.data}
              pagination={false}
              columns={columns}
              loading={this.state.loading}
              scroll={{ x: '100%', y: this.props.height - 50 }}
              getRowData={this.getRowData}
              rightClick={this.rightClickMenuShow}
            />
            {/* 删除提示 */}
            {this.state.deleteTip && (
              <TipModal
                onOk={this.deleteRole}
                onCancel={() => this.setState({ deleteTip: false })}
              />
            )}
          </div>

          {/* {
            this.state.rightImgShow &&
            <div className={style.rightTable}>
              <div>
                <div className={style.rightTitle}>系统操作说明</div>
                <div className={style.rightImg}>
                  <img src="./../../../static/images/show.png" alt=""/>
                </div>
              </div>
            </div>
          } */}
          {/* 新增弹框 */}
          {this.state.roleVisible && (
            <RoleAddModel
              addSuccess={this.addSuccess}
              rightData={this.state.rightData}
              roleVisible={this.state.roleVisible}
              handleCancel={this.handleCancel}
              unShow={this.unShow}
              modelTitle={this.state.modelTitle}
            />
          )}
          <div className={style.rightBox} style={{ height: this.props.height }}>
            <RightTags
              updateSuccess={this.updateSuccess}
              rightTagList={this.state.rightTags}
              rightData={this.state.rightData}
              api="rightTags"
              menuCode={this.props.menuInfo.menuCode}
              groupCode={this.state.groupCode}
              permission={this.state.permission}
            />
          </div>
        </div>
      </div>
    );
  }
}

/* *********** connect链接state及方法 start ************* */
export default connect(state => ({
  currentLocale: state.localeProviderData,
}))(sysRole);
/* *********** connect链接state及方法 end ************* */
