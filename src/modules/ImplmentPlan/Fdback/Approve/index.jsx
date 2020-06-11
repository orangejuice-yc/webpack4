import React, {Component} from 'react'

import {Modal, Table, Button, Progress, notification} from 'antd'
import style from './style.less'
import '../../../../asserts/antd-custom.less'
import {connect} from 'react-redux'
import axios from "../../../../api/axios"
import {getfeedbackreleasetree, updatefeedbackrelease} from "../../../../api/api"
import * as dataUtil from "../../../../utils/dataUtil";
import SubmitButton from "../../../../components/public/TopTags/SubmitButton"

const release = `api/szxm/plan/feedback/release_`;

export class PlanFdbackApprove extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalInfo: {
        title: '进展批准'
      },
      selectedRowKeys: [],
      data: [],
      activeIndex: [],
      rightData: []
    }
  }

  componentDidMount() {
    const {selectArray} = this.props
    let str = selectArray[0].toString()
    selectArray.forEach((item, i) => {
      if (i > 0) {
        str = str + "," + item
      }

    })
    axios.get(getfeedbackreleasetree(str)).then(res => {
      this.setState({
        data: res.data.data
      })
    })
  }

  handleSubmit = () => {
    const {rightData} = this.state

    if (rightData.length == 0) {
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 1,
          message: '警告',
          description: '没有选择计划！'
        }
      )
      return
    }
    let index = rightData.map(item => item.feedbackId)
    let url = dataUtil.spliceUrlParams(release, {"startContent": "项目【" + this.props.projectName + "】"});
    axios.put(url, index, true).then(res => {
      this.props.approvalHandle()
      this.props.handleCancel()
    })
  }
  setClassName = (record, index) => {
    //判断索引相等时添加行的高亮样式
    if (this.state.activeIndex.findIndex(value => record.id === value) > -1) {
      return 'tableActivty'
    } else {
      return "";
    }

  }

  render() {
    const {intl} = this.props.currentLocale
    const columns = [
      {
        title: intl.get('wsd.i18n.plan.feedback.name'),
        dataIndex: 'name',
        key: 'name',
        width: 320,
        render: (text, record) => {
          let custom01 = record.taskCustom01;
          custom01 = custom01 ? custom01+"年" : "";
          let custom02 = record.taskCustom02;
          custom02 = custom02 ? custom02+"月" : "";
          custom01 = custom01 + custom02;
          custom01 = custom01 ? "("+custom01+") " +text: text;
          custom01 = dataUtil.getIconCell(record.type, custom01, record.taskType)
          return <span>{custom01}</span>
        }
      },
      {
        title: "申请完成%",
        dataIndex: 'applyPct',
        key: 'applyPct',
        width: 120,
        render: number => (
          <Progress key={1} percent={number}/>
        ),
      },
      {
        title: '实际开始时间',
        dataIndex: 'actStartDate',
        key: 'actStartDate',
        width: 100,
        render: (text) => dataUtil.Dates().formatDateString(text)
      },
      {
          title: '实际完成时间',
          dataIndex: 'actEndDate',
          key: 'actEndDate',
          width: 100,
          render: (text) => dataUtil.Dates().formatDateString(text)
      },
      
    ]

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        let array = []
        let array1 = []
        selectedRows.forEach(item => {
          if (item.check == 1) {
            array.push(item.id)
            array1.push(item)
          }
        })
        this.setState({
          activeIndex: array,
          selectedRowKeys: array,
          rightData: array1
        })
      },
      getCheckboxProps: record => ({
        disabled: record.check == null || record.check != 1, // Column configuration not to be checked

      }),
    };

    return (
      <Modal className={style.main} width="850px" centered={true} title={this.state.modalInfo.title} visible={true} onCancel={this.props.handleCancel} footer={
        <div className="modalbtn">
          <SubmitButton key="1" onClick={this.props.handleCancel} content="取消" />
          <SubmitButton key="2" type="primary" onClick={this.handleSubmit} content="批准" />
        </div>
      }>
        <div className={style.tableMain}>
          <Table rowKey={record => record.id}
                 defaultExpandAllRows={true}
                 rowClassName={this.setClassName}
                 pagination={false}
                 name={this.props.name}
                 columns={columns}
                 rowSelection={rowSelection}
                 dataSource={this.state.data}
                 onRow={(record, index) => {
                   return {
                     onClick: (event) => {
                       if (record.check == 1) {
                         event.currentTarget.getElementsByClassName("ant-checkbox-wrapper")[0].click()
                       }
                     },
                   };
                 }
                 }
          />
        </div>
      </Modal>
    )
  }
}


const mapStateToProps = state => {
  return {
    currentLocale: state.localeProviderData,
  }
};


export default connect(mapStateToProps, null)(PlanFdbackApprove);
