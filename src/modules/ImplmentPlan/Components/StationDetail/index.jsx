import React, { Component } from 'react'
import style from './style.less'
import { Modal, Form} from 'antd';
import axios from "../../../../api/axios"
import PublicTable from "../../../../components/PublicTable";
import * as dataUtil from '../../../../utils/dataUtil';
const getStationFeedbacks = (taskId,feedbackId) => `api/szxm/station/detail/feedback/${taskId}/${feedbackId}/list`
const getFeedBackStepInfo_ = (taskId,feedBackId) =>`api/szxm/planStep/${feedBackId}/${taskId}/list`//获取工序记录
export class PlanStationDetail extends Component {
    constructor(props) {
        super(props)
        this.state = {
            columns: [],
            data: [],
            initData: [],
            stepList: null
        }
    }

    componentDidMount() {
    }

    //注册 父组件即可调用子组件方法
	onRef = (ref) => {
		this.table = ref
	}

  /**
   * 获取站点信息数据
   *
   */
  getStationList = (callback) =>{
    let {id,taskId} = this.props.data;
    let url = getStationFeedbacks(taskId,id || 0);
    axios.get(url).then(res => {
      callback(res.data.data);
    })
  }
  getStepList = (callback) =>{
    let {id,taskId} = this.props.data;
    let url = getFeedBackStepInfo_(id,taskId || 0);
    axios.get(url).then(res => {
      this.setState({stepList : res.data.data})
      callback(res.data.data);
    })
  }
    render() {
        const columns = [
            {
              title: "站点或区间名称", //计划名称
              dataIndex: "station",
              key: "station",
              width: "15%",
              render : (text, record) => {
                return (text ? text.name : null)
              }
            },
            {
              title: "设计总量", //计划名称
              dataIndex: "designTotal",
              key: "designTotal",
              width: "14%"
            },
            {
              title: "月计划量", //计划名称
              dataIndex: "planComplete",
              key: "planComplete",
              width: "14%"
            },
            {
              title: "实际完成量", //计划名称
              dataIndex: "actCompleteTotal",
              key: "actCompleteTotal",
              width: "14%"
            },
            {
              title: "本周计划量", //计划名称
              dataIndex: "planThisweekComplete",
              key: "planThisweekComplete",
              width: "14%"
            },
            {
              title: "本周完成量", //计划名称
              dataIndex: "actWeekComplete",
              key: "actWeekComplete",
              width: "14%"
            },
            {
              title: "下周计划量", //计划名称
              dataIndex: "planNextweekComplete",
              key: "planNextweekComplete",
              width: "14%"
            },
            {
              title: "计量单位", //计划名称
              dataIndex: "unit",
              key: "unit",
              width: "12%",
              render : () => {
                let unit = this.props.mainData.custom07;
                unit = unit && this.props.commUnitMap && this.props.commUnitMap[unit] ? this.props.commUnitMap[unit] : '';
                return unit;
              }
            }
          ]

        const columns2 =[
          {
            title: "工序名称",
            dataIndex: 'name',
            key: 'name',
            width:'15%'
        },
        // {
        //     title: "编号",
        //     dataIndex: 'code',
        //     key: 'code',
        // },
        {
            title: "设计总量",
            dataIndex: 'totalDesign',
            key: 'totalDesign',
            width:'14%'
        },
        {
            title: "计量单位",
            dataIndex: 'unit',
            key: 'unit',
            width:'14%',
            render: text => text ? text.name : '',
        },
        {
            title: "权重",
            dataIndex: 'estwt',
            key: 'estwt',
            width:'14%'
        },
        {
            title: "计划完成量",
            dataIndex: 'planComplete',
            key: 'planComplete',
            width:'14%'
        },
        {
            title: "实际完成量",
            dataIndex: 'actComplete',
            key: 'actComplete',
            width:'14%'
        },
        // {
        //     title: "实际开始时间",
        //     dataIndex: 'actStartTime',
        //     key: 'actStartTime',
        //     width:'15%',
        //     render: (text) => dataUtil.Dates().formatDateString(text)
        // },
        {
            title: "实际完成时间",
            dataIndex: 'actEndTime',
            key: 'actEndTime',
            width:'14%',
            render: (text) => dataUtil.Dates().formatDateString(text)
        },
        {
            title: "完成百分比",
            dataIndex: 'completePct',
            key: 'completePct',
            width:'12%',
        },
        ]
        return (
            <Modal className={style.main} width="850px" centered={true}
                title="完成明细" visible={true} onCancel={this.props.handleCancel} footer={null}>
                <div className={style.tableMain}>
                    {
                       <PublicTable  onRef={this.onRef}
                        getData={this.getStationList}
                        columns={columns}
                        useCheckBox={false}
                        pagination = {false}
                        getRowData = {() => {}}
                       />
                    }
                </div>
                {this.state.stepList && <div className={style.tableMain}>
                    {
                       <PublicTable  onRef={this.onRef}
                        getData={this.getStepList}
                        columns={columns2}
                        useCheckBox={false}
                        pagination = {false}
                        getRowData = {() => {}}
                       />
                    }
                </div>}
            </Modal>

        )
    }
}

const PlanStationDetails = Form.create()(PlanStationDetail)

export default PlanStationDetails
