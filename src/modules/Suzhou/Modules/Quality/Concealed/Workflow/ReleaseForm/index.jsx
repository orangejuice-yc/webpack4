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
import { queryFlowDeviceHoistingList } from '../../../../../api/suzhou-api';
import axios from '../../../../../../../api/axios';
import MyIcon from '../../../../../../../components/public/TopTags/MyIcon';
import { queryFlowQuaInsp ,getPermission} from '@/modules/Suzhou/api/suzhou-api';
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
      permission:[]
    };
  }
  componentDidMount() {
    let menuCode = 'QUALITY-CONCEALED'
    axios.get(getPermission(menuCode)).then((res)=>{
      let permission = []
      res.data.data.map((item,index)=>{
        permission.push(item.code)
      })
      this.setState({
        permission
      })
    })
    //监听全局点击事件
    document.addEventListener('click', this.closeRight);
    // 初始化数据
    this.initDatas();
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
      projectId:record.projectId,
      activeIndex: [record.id],
      rightData: [record],
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
      axios.get(queryFlowQuaInsp + `?&ids=${ids}`).then(res => {
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
  updateInfoTabel = callBackData => {
    this.setState(({ data, rightData }) => ({
      data: data.map(item => (item.id === callBackData.id ? callBackData : item)),
      rightData: { ...callBackData },
    }));
  };
  render() {
    const columns = [
      {
        title: '项目名称',
        dataIndex: 'projectName',
      },
      {
        title: '标段名称',
        dataIndex: 'sectionName',
      },
      {
        title: '隐蔽工程名称',
        dataIndex: 'engineName',
      },
      {
        title: '所属站',
        dataIndex: 'belongStaVoList',
        render: arr => arr.map(item => item.name).join(','),
      },
      {
        title: '施工单位',
        dataIndex: 'sgdw',
      },
      // {
      //   title: '监理单位',
      //   dataIndex: 'jldw',
      // },
      {
        title: '验收时间',
        dataIndex: 'checkTime',
      },
      {
        title: '发起人',
        dataIndex: 'initiatorName',
      },
      {
        title: '发起时间',
        dataIndex: 'initTime',
      },
      {
        title: '附件状态',
        dataIndex: 'fileStatusVo',
        render: ({ name }) => name,
      },
      {
        title: '状态',
        dataIndex: 'statusVo',
        render: ({ name }) => name,
      },
    ];
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
            bizType={this.props.proc.formDatas[0].bizType}
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
            isShow={this.state.permission.indexOf('CONCEALED_FILE-CONCEALED')==-1?false:true} //文件权限
            problemShow={this.state.permission.indexOf('CONCEALED_QUES-EDIT')==-1?false:true}//问题权限
            problemSendShow={this.state.permission.indexOf('CONCEALED_QUES-EDIT')==-1?false:true}//问题发布权限
            permission={this.state.permission}
            taskFlag={!this.props.start?false:true}
            updateInfoTabel={this.updateInfoTabel}
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
