import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { Table, notification } from 'antd';
import style from './style.less';
import { connect } from 'react-redux';
import { changeLocaleProvider } from '../../../../../../../store/localeProvider/action';
import RightTags from '../../../../../../../components/public/RightTags/index';
import * as util from '../../../../../../../utils/util';
import * as dataUtil from '../../../../../../../utils/dataUtil';
import { meetingWfList } from '../../../../../../../api/api';
import { queryFlowDeviceHoistingList ,getPermission} from '../../../../../api/suzhou-api';
import axios from '../../../../../../../api/axios';
import MyIcon from '../../../../../../../components/public/TopTags/MyIcon';
import { queryFlowSecurityCheckList } from '@/modules/Suzhou/api/suzhou-api';

class Delivery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: [],
      rightData: [],
      data: [],
      initData: [],
      dataMap: [],
      projectData: [],
      taskData: [],
      projectId: null,
      permission:[],
      checkStatus:'1',
    };
  }
  componentDidMount() {
    //监听全局点击事件
    document.addEventListener('click', this.closeRight);
    // 初始化数据
    this.initDatas();
    let menuCode = 'SECURITY-SECURITYCHECK'
    axios.get(getPermission(menuCode)).then((res)=>{
      let permission = []
      res.data.data.map((item,index)=>{
        permission.push(item.code)
      })
      this.setState({
        permission,
        isShow:'SECURITYCHECK_FILE-ORG-CHECK',
          problemShow:'SECURITYCHECK_EDIT-PRO-ORGCHECK',
          problemSendShow:'SECURITYCHECK_RELEASE-PRO-ORGCHECK',
          checkStatus:'1'
      })
    })
  }

  /**
   * 初始化数据
   *
   */
  initDatas = () => {
    this.getComuMeetListByBizs();
  };

  componentWillUnmount() {
    //销毁全局点击事件
    document.removeEventListener('click', this.closeRight, false);
  }

  // 获取选中的列表项
  getInfo = record => {
    this.setState({
      activeIndex: [record.id],
      rightData: [record],
      record:record
    });
  };

  // 选中行高亮
  setClassName = record => {
    let activeId = this.state.activeIndex.length > 0 ? this.state.activeIndex[0] : -1;
    //判断索引相等时添加行的高亮样式
    return record.id === activeId ? 'tableActivty' : '';
  };

  //获取发布列表
  getComuMeetListByBizs = () => {
    const { formDatas } = this.props;
    let ids = dataUtil.Arr().toStringByObjectArr(formDatas, 'bizId');
    if (ids && ids.length > 0) {
      axios.get(queryFlowSecurityCheckList + `?ids=${ids}`).then(res => {
        const { data } = res.data;
        const dataMap = util.dataMap(data);
        this.setState({
          data: data || [],
          initData: data || [],
          dataMap,
        });
      });
    } else {
      this.setState({
        data: [],
        initData: [],
        dataMap: {},
      });
    }
  };
  /**
   * 查询条件
   *
   * @param value
   */
  search = value => {
    const { initData, tableData } = this.state;
    let newData = dataUtil.search(initData, [{ key: 'title', value: value }], true);
    const dataMap = util.dataMap(newData);
    tableData[0].children = data;
    this.setState({
      data: newData,
      dataMap,
    });
  };
  updatetableCallBack = v => {
    const { data, dataMap ,record} = this.state;
    util.modify(data, dataMap, record, v);
    this.setState({
        data,
        dataMap,
        rightData:[v],
    });
  };
  render() {
    const columns = [
      {
        title: '检查编号',
        dataIndex: 'code',
        width: '10%',
        key: 'code',
      },
      {
        title: '检查标题',
        dataIndex: 'stationPointInfo',
        key: 'stationPointInfo',
        width: '10%',
      },
      {
        title: '项目名称',
        dataIndex: 'projectName',
        key: 'projectName',
        width: '10%',
      },
      {
        title: '标段名称',
        dataIndex: 'sectionName',
        key: 'sectionName',
        width: '10%',
      },
      {
        title: '检查类型',
        dataIndex: 'jclxVo',
        key: 'jclxVo',
        width: '10%',
        render: obj => (obj ? obj.name : ''),
      },
      {
        title: '检查地点',
        dataIndex: 'checkLocation',
        key: 'checkLocation',
        width: '10%',
      },
      {
        title: '检查时间',
        dataIndex: 'jcsx',
        key: 'jcsx',
        width: '10%',
      },
      {
        title: '主要施工内容',
        dataIndex: 'constructionContent',
        key: 'constructionContent',
        width: '10%',
      },
      {
        title: '状态',
        dataIndex: 'statusVo',
        key: 'statusVo',
        render: obj => (obj ? obj.name : ''),
        width: '10%',
      },
    ];
    const {isShow,problemShow,problemSendShow} = this.state
    return (
      <div className={style.main}>
        <div className={style.leftMain} style={{ height: this.props.height }}>
          <div style={{ minWidth: 'calc(100vw - 60px)' }}>
            <Table
              className={style.Infotable1}
              columns={columns}
              pagination={false}
              dataSource={this.state.data}
              rowClassName={this.setClassName}
              rowKey={record => record.id}
              defaultExpandAllRows={true}
              size={'small'}
              onRow={(record, index) => {
                return {
                  onClick: () => {
                    this.getInfo(record, index);
                  },
                };
              }}
            />
          </div>
        </div>
        <div className={style.rightBox} style={{ height: this.props.height }}>
          <RightTags
            menuCode={this.props.menuInfo.menuCode}
            rightTagList={this.state.rightTags}
            rightData={
              this.state.rightData && this.state.rightData.length > 0
                ? this.state.rightData[0]
                : null
            }
            bizType={'SECURITY-SECURITYCHECK'}
            bizId={
              this.state.rightData && this.state.rightData.length > 0
                ? this.state.rightData[0].id
                : null
            }
            projectId={this.state.projectId}
            menuId={this.props.menuInfo.id}
            wfeditAuth="false"
            wfPubliceditAuth={false}
            fileEditAuth={false}
            meetActionEditAuth={false}
            taskFlag={!this.props.start?false:true}
            isShow={this.state.permission.indexOf(isShow)==-1?false:true} //文件权限
            problemShow={this.state.permission.indexOf(problemShow)==-1?false:true}//问题权限
            problemSendShow={this.state.permission.indexOf(problemSendShow)==-1?false:true}//问题发布权限
            permission={this.state.permission}
            checkStatus={this.state.checkStatus}
            updatetableCallBack={this.updatetableCallBack}
            sectionType = 'multiple'
          />
        </div>
      </div>
    );
  }
}

/* *********** connect链接state及方法 start ************* */
export default connect(
  state => ({
    currentLocale: state.localeProviderData,
  }),
  { changeLocaleProvider }
)(Delivery);
