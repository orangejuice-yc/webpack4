
import React, { Component } from 'react'
import { notification } from 'antd'
import PageTable from '../../../../components/PublicTable'
import axios from "../../../../api/axios"
import {
    getPlanTaskChangeList
} from "../../../../api/api"
import * as dataUtil from "../../../../utils/dataUtil"
import LabelTableLayout from '../../../../components/public/Layout/Labels/Table/LabelTableLayout'
import LabelTable from '../../../../components/public/Layout/Labels/Table/LabelTable'

export class PlanPreparedChangeInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            name: 'PlanPreparedChangeInfo',
            width: '',
            loading: false,
            data: []
        }
    }

    // 获取计划变更列表
    getPlanTaskChangeList = (callBack) => {
        const { rightData } = this.props
        if (rightData && (rightData[0]['nodeType'] == 'wbs' || rightData[0]['nodeType'] == 'task')) {
            axios.post(getPlanTaskChangeList(rightData[0]['id'])).then(res => {
             
                callBack(res.data.data)
            })
        } else {
            notification.warning(
                {
                    placement: 'bottomRight',
                    bottom: 50,
                    duration: 2,
                    message: '数据类型不符合',
                    description: '所选择的数据类型为task，wbs'
                }
            )
        }
    }

    getRowData = (record) => {
        this.setState({
          record
        })
      };
    

    render() {
        const columns=[
            {
                title: "方式", //状态
                dataIndex: 'changeType',
                key: 'changeType',
                width: 100,
                render: (text) => (
                  <span>{text.name}</span>
                )
            },
            {
                title: "变更前数据", //变更前数据
                dataIndex: 'oldData',
                key: 'oldData',
                width:200,
                render:text=><span title={text}>{text}</span>
            },
            {
                title: "变更后数据", //变更后数据
                dataIndex: 'newData',
                key: 'newData',
                width: 200,
                render:text=><span title={text}>{text}</span>
            },
            {
                title: "变更状态", //变更状态
                dataIndex: 'status',
                key: 'status',
                width: 100,
                render: (text) => (
                  <span>{text.name}</span>
                )
            },
            {
                title: "变更方式", // 变更方式 
                dataIndex: 'changeWay',
                key: 'changeWay',
                width: 100,
                render:text=><span title={text}>{text}</span>
            },
            {
                title: "变更申请原因", //变更申请原因
                dataIndex: 'changeReason',
                key: 'changeReason',
                width: 180,
                render:text=><span title={text}>{text}</span>
            },
            {
                title: "变更影响分析", //变更影响分析
                dataIndex: 'changeEffect',
                key: 'changeEffect',
                width: 100,
                render:text=><span title={text}>{text}</span>
            },
            {
                title: "采取措施说明", //采取措施说明
                dataIndex: 'changeWayDesc',
                key: 'changeWayDesc',
                width: 200,
                render:text=><span title={text}>{text}</span>
            },
            {
                title: "申请人", //申请人
                dataIndex: 'creator',
                key: 'creator',
                width: 100,
                render: (text) => (
                  <span>{text ? text.name : ""}</span>
                )
            },
            {
                title: "申请时间", //申请时间
                dataIndex: 'creatTime',
                key: 'creatTime',
                width: 100,
                render: (text) =>  dataUtil.Dates().formatDateString(text)
            },
        ]
        return (

          <LabelTableLayout title = {this.props.title} menuCode={this.props.menuCode}>
            <LabelTable labelWidth = {this.props.labelWidth } contentMinWidth = {1000}>
              <PageTable onRef={ref => this.talbe= ref}
                         pagination={false}
                         getData={this.getPlanTaskChangeList}
                         columns={columns}
                         bordered={false}
                         dataSource={this.state.data}
                         closeContentMenu={true}
                         loading={this.state.loading}
                         getRowData={this.getRowData}
              />
            </LabelTable>
          </LabelTableLayout>
        )
    }
}

export default PlanPreparedChangeInfo
