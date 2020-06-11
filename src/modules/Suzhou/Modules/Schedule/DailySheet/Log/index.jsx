import React, { Component } from 'react'
import { Table, notification,Statistic,Form, Row, Col,Input,DatePicker} from 'antd'
import moment from 'moment';
import { connect } from 'react-redux'
import { changeLocaleProvider } from '@/store/localeProvider/action'
import * as util from '@/utils/util';
import * as dataUtil from '@/utils/dataUtil';
import Release from "@/modules/Components/Release"
import TipModal from "@/modules/Components/TipModal"
import {getsectionId,getDailySheetKqRecord} from '../../../../api/suzhou-api';
import axios from '@/api/axios';
import MyIcon from "@/components/public/TopTags/MyIcon";
// import TopTags from './TopTags/index';
import {firstLoad} from "@/modules/Suzhou/components/Util/firstLoad";
import notificationFun from '@/utils/notificationTip';

import style from './style.less';

const { Item } = Form;
export class QualityInspectionDetail extends Component {
    constructor(props){
      super(props);
      this.state = {
          selectedRowKeys:[],
          selectedRows:[],
          pageSize:500,
          currentPageNum:1,
          total:'',
          jcrysl:'',//进场人员数量
          qjrs:'',//请假人数
          qqrs:'',//缺勤人数
          cqrs:'',//出勤人数
      }
  }
  getList = ()=>{
      if(this.props.rightData){
        axios.get(getDailySheetKqRecord(this.props.rightData.id)).then(res => {
          this.setState({
              total:(!res.data.data.data || !res.data.data.data.total)?0:res.data.data.data.total,
              data: (!res.data.data.data||!res.data.data.data.data)?[]:res.data.data.data.data,
              cqrs:res.data.data.cqrs,
              jcrysl:res.data.data.jcrysl,
              qjrs:res.data.data.qjrs,
              qqrs:res.data.data.qqrs,
          });
        });
      }
  }
  componentDidMount(){
    this.getList();
  }
  render() {
    const { data,itemMaps } = this.state;
        const { height, record } = this.props;
        const columns = [
            {
                title: '姓名',
                dataIndex: 'name',
                key:'name'
            },
            {
                title:'人员类型',
                dataIndex: 'typeName',
                key: 'typeName',
            },
            {
                title: '职务',
                dataIndex: 'jobName',
                key: 'jobName',
            },
            {
                title: '项目名称',
                dataIndex: 'projectName',
                key: 'projectName',
            },
            {
                title:'标段名称',
                dataIndex: 'sectionName',
                key: 'sectionName',
            },
            {
                title: '打卡时间',
                dataIndex: 'checkTime',
                key: 'checkTime',
            },
            {
                title: '打卡地址',
                dataIndex: 'locationAddress',
                key: 'locationAddress',
            },
            {
                title: '打卡方式',
                dataIndex: 'checkType',
                key: 'checkType',
            },
        ];
        // let pagination = {
        //     total: this.state.total,
        //     // hideOnSinglePage: true,
        //     current: this.state.currentPageNum,
        //     pageSize: this.state.pageSize,
        //     showSizeChanger: true,
        //     size:"small",
        //     showQuickJumper: true,
        //     pageSizeOptions:[500,1000,1500,2000],
        //     showTotal: total => `总共${this.state.total}条`,
        //     onShowSizeChange: (current, size) => {
        //       this.setState({
        //         pageSize: size,
        //         currentPageNum: 1
        //       }, () => {
        //         this.getList();
        //       })
        //     },
        //     onChange: (page, pageSize) => {
        //       this.setState({
        //         currentPageNum: page
        //       }, () => {
        //         this.getList();
        //       })
        //     }
        // }
        // let { selectedRowKeys,selectedRows} = this.state;
        // const rowSelection = {
        //     selectedRowKeys,
        //     onChange: (selectedRowKeys, selectedRows) => {
        //       this.setState({
        //         selectedRowKeys,
        //         selectedRows
        //       })
        //     }
        // };
      const {permission} = this.props;
    return (
      <div className={style.main}>
        <div className={style.mainHeight}>
          <h3 className={style.listTitle}>出勤记录</h3>
            <div className={style.rightTopTogs}>
                <Row>
                  <Col span={8}>
                     <span>项目：</span>
                     <Input disabled style={{width:'70%'}} value={!this.props.rightData || !this.props.rightData.projectName?null:this.props.rightData.projectName} />
                  </Col>
                  <Col span={8}>
                     <span>标段：</span>
                     <Input disabled style={{width:'70%'}} value={!this.props.rightData || !this.props.rightData.sectionName?null:this.props.rightData.sectionName} />
                  </Col>
                  <Col span={8}>
                     <span>派工日期：</span>
                     <DatePicker disabled style={{width:'60%'}} value={!this.props.rightData || !this.props.rightData.dispatchTime?null:moment(this.props.rightData.dispatchTime,'YYYY-MM-DD')} />
                  </Col>
               </Row>
               <Row className={style.data}>
                  <Col span={6}>
                    <Statistic title="派工人员数量" value={this.state.jcrysl} />
                  </Col>
                  <Col span={6}>
                    <Statistic title="出勤人数" value={this.state.cqrs} />
                  </Col>
                  <Col span={6}>
                    <Statistic title="请假人数" value={this.state.qjrs} />
                  </Col>
                  <Col span={6}>
                    <Statistic title="缺勤人数" value={this.state.qqrs} />
                  </Col>
                </Row>
            </div>
             <div className={style.mainScorll + ' '+style.mainScorll1} style={{ minWidth: '100%', overflow: 'auto' }}>
              <Table
                    size="small"
                    pagination={false}
                    columns={columns}
                    rowKey={record => record.id}
                    name={this.props.name}
                    dataSource={data}
                    // rowSelection={rowSelection}
                    scroll={{x:'1000px'}}
                />
              </div>
        </div>
      </div>
    );
  }
}

export default QualityInspectionDetail;
