import React, { Component } from 'react'
import style from './style.less'
import {Table, Form, Progress} from 'antd';
import Search from '../../../../../components/public/Search'
import { connect } from 'react-redux'
import '../../../../../asserts/antd-custom.less'
import axios from "../../../../../api/axios"
import * as WorkFolw from '../../../../Components/Workflow/Start';
import * as dataUtil from "../../../../../utils/dataUtil";
import {getfeedbackreleasetree} from "../../../../../api/api";

class Approval extends Component {

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
      const {planIds} = this.props;
      let planIdStrs = dataUtil.Arr().toString(planIds)
      axios.get(getfeedbackreleasetree(planIdStrs)).then(res=>{
        this.setState({
          data:res.data.data
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
        const columns= [
          {
            title: intl.get('wsd.i18n.plan.feedback.name'),
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => dataUtil.getIconCell(record.type, text, record.taskType)
          },
          // {
          //   title: intl.get('wsd.i18n.plan.feedback.code'),
          //   dataIndex: 'code',
          //   key: 'code'
          // },
          {
            title: "申请完成%",
            dataIndex: 'applyPct',
            key: 'applyPct',
            render: number => (
              <Progress key={1} percent={number} />
            )
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
                selectedItems.push({"bizId" : item.feedbackId, "bizType": "ST-PRED-FEEDBACK"});
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

const Approval_ = Form.create()(Approval)
const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};
export default WorkFolw.StartWorkFlow(connect(mapStateToProps, null)(Approval_));
