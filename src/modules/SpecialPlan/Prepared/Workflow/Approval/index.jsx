import React, { Component } from 'react'
import style from './style.less'
import { Table, Form } from 'antd';
import Search from '../../../../../components/public/Search'
import { connect } from 'react-redux'
import '../../../../../asserts/antd-custom.less'
import axios from "../../../../../api/axios"
import * as WorkFolw from '../../../../Components/Workflow/Start';
import * as dataUtil from "../../../../../utils/dataUtil";
import MyIcon from "../../../../../components/public/TopTags/MyIcon";
import {releasePlanTaskTreeByDefineIds} from "../../../../../api/api";

class PlanTaskReleaseApproval extends Component {

    constructor(props) {
        super(props);
        this.state = {
            initDone: false,
            step: 1,
            columns: [],
            data: [],
            info: {},
            selectedRowKeys: [],
            currentData: [],
            activeIndex: []
        }
    }

    initDatas =()=>{
      const { defineIds } = this.props;
      let defineIdstring = dataUtil.Arr().toString(defineIds) || "-1";

      axios.get(releasePlanTaskTreeByDefineIds(defineIdstring)).then(res=>{
        this.setState({
          data:res.data.data,
          initData:res.data.data
        })
      })
    }

    getInfo = (record) => {
        this.setState({
            activeIndex: record.id
        })
    }

    setClassName = (record) => {
        //判断索引相等时添加行的高亮样式
        return record.id === this.state.activeIndex ? 'tableActivty' : "";
    }

    componentDidMount() {
       // 初始化数据
       this.initDatas();
    }

    // 查询
    search = (text) => {
        const {initData} = this.state;
        let newData = dataUtil.search(initData,[{"key":"name|code","value":text}],true);
        this.setState({
          data: newData
        });
    }

    render() {
        const { intl } = this.props.currentLocale;
        const columns = [
          {
            title: intl.get('wsd.i18n.plan.feedback.name'),
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => {
              let icon = dataUtil.getIcon(record.nodeType,record.taskType);
              return <span><MyIcon type={icon} style={{ fontSize: '18px', marginRight: '8px' }} /> {text}</span>
            }
          },
          // {
          //   title: intl.get('wsd.i18n.plan.feedback.code'),
          //   dataIndex: 'code',
          //   key: 'code',
          //   width : "15%"
          // },
          {
            title: intl.get('wsd.i18n.plan.feedback.planstarttime'),
            dataIndex: 'planStartTime',
            key: 'planStartTime',
            render: (text) =>  dataUtil.Dates().formatDateString(text),
            width : "12%"
          },
          {
            title: intl.get('wsd.i18n.plan.feedback.planendtime'),
            dataIndex: 'planEndTime',
            key: 'planEndTime',
            render: (text) =>  dataUtil.Dates().formatDateString(text),
            width : "12%"
          },
          {
            title: intl.get('wsd.i18n.plan.feedback.iptname'),
            dataIndex: 'org',
            key: 'org',
            render: data => data ? data.name : '',
            width : "15%"
          },
          {
            title: intl.get('wsd.i18n.plan.feedback.username'),
            dataIndex: 'user',
            key: 'user',
            render: data => data ? data.name : '',
            width : "10%"
          }
        ]
        let { selectedRowKeys } = this.state;
        const rowSelection = {
          selectedRowKeys,
          onChange: (selectedRowKeys,selectedRow) => {
            this.setState({
              selectedRowKeys
            });
            let selectedItems = new Array();
            if(selectedRow){
              for(let i = 0, len = selectedRow.length; i < len; i++){
                let item =   selectedRow[i];
                selectedItems.push({"bizId" : item.id, "bizType": "task"});
              }
            }
            this.props.getSubmitData(selectedItems);
          },
          getCheckboxProps: record => ({
            disabled: record.check != 1
          })
        };

        let display = this.props.visible ? "" : "none";
        return (
            <div style = {{display:display}}>
              <div className={style.tableMain}>
                <div className={style.search}>
                  <Search search = {this.search } />
                </div>
                <Table rowKey={record => record.id}
                       defaultExpandAllRows={true}
                       pagination={false}
                       name={this.props.name}
                       columns={columns}
                       rowSelection={rowSelection}
                       dataSource={this.state.data}
                       size="small"
                       onRow={(record, index) => {
                           return {
                               onClick: () => {
                                  this.getInfo(record, index)
                               },
                               onDoubleClick: (event) => {
                                  event.currentTarget.getElementsByClassName("ant-checkbox-wrapper")[0].click();
                               }
                           }
                         }
                       }
                />
              </div>
            </div>
        )
    }
}

const PlanTaskReleaseApproval_ = Form.create()(PlanTaskReleaseApproval)

const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};

const  ReleaseApproval_ = connect(mapStateToProps, null)(PlanTaskReleaseApproval_);
export default WorkFolw.StartWorkFlow(ReleaseApproval_);
