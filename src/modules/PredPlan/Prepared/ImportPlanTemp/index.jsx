import React, { Component } from 'react'
import style from './style.less'
import { Modal, Table, Button,notification } from 'antd';
import Search from "../../../../components/public/Search"
import { connect } from 'react-redux'
import axios from '../../../../api/axios'
import { getTmpltaskTree,importPlanTemplate } from '../../../../api/api';
import * as dataUtil from "../../../../utils/dataUtil"
import MyIcon from '../../../../components/public/TopTags/MyIcon';
import SubmitButton from "../../../../components/public/TopTags/SubmitButton"
import intl from 'react-intl-universal'
class ImportOneModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      initDone: false,
      visible: true,
      record: null,
      activeIndex: null,
      data: [],
      initData: []
    }
  }

  getDataList = () => {
    axios.get(getTmpltaskTree).then(res => {
      if (res.data.data) {
        this.setState({
          data: res.data.data,
          initData: res.data.data,
        })
      }
    })

  }

  componentDidMount() {
    this.getDataList();

  }

  handleOk = () => {
    if(!this.state.activeIndex){
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 2,
          message: '未选中数据',
          description: '请选择数据进行操作'
        }
      )
      return;
    }
    axios.post(importPlanTemplate(this.props.rightData.id,this.state.activeIndex), true).then(res=>{
      this.props.getPreparedTreeList();
      this.props.handleCancel();
    })

  }
  handleCancel = (e) => {
    this.props.handleCancel()
  }
  getInfo = (record, index) => {

    let id = record.id;
    if(record.type == 'tmpl'){
      this.setState({
        activeIndex: id,
        record
      })
    } else{
      this.setState({
        activeIndex: null,
        record: null
      })
    }


  }
  setClassName = (record, index) => {
    //判断索引相等时添加行的高亮样式
    return record.id === this.state.activeIndex ? "tableActivty" : "";
  }
  search = (val) => {
    const {initData} = this.state;
    let newData = dataUtil.search(initData, [{"key": "taskName|taskCode", "value": val}], true);
    this.setState({
      data: newData
    })
  }

  render() {
    const columns = [
      {
        title: intl.get('wsd.i18n.base.planTem.name'),
        dataIndex: 'taskName',
        key: 'taskName',
        width: 400,
        render: (text, record) => {
          if (record.type == "tmpl") {
            return <span><MyIcon type="icon-xiangmu" style={{fontSize: '18px', verticalAlign: "middle"}}/>&nbsp;{text}</span>
          }
          else if (record.type == "wbs") {
            return <span><MyIcon type="icon-WBS" style={{fontSize: '18px', verticalAlign: "middle"}}/>&nbsp;{text}</span>
          }
          else if (record.type == "task") {
            if (record.taskType.id == '2' || record.taskType.id == '3') {
              return <span><MyIcon type="icon-lichengbei" style={{fontSize: '18px', verticalAlign: "middle"}}/>&nbsp;{text}</span>
            } else {
              return <span><MyIcon type="icon-renwu1" style={{fontSize: '18px', verticalAlign: "middle"}}/>&nbsp;{text}</span>
            }
          } else {
            return
          }
        }
      },
      {
        title: intl.get('wsd.i18n.base.planTemAddWBS.code'),
        dataIndex: 'taskCode',
        key: 'taskCode',
        width: 200
      },
      {
        title: intl.get('wsd.i18n.plan.feedback.plandrtn'),
        dataIndex: 'planDrtn',
        key: 'planDrtn',
        width: 150,
        render: (text) => {
          if (text) {
            return <span>{text + "D"}</span>
          } else {
            return "--"
          }
        }
      },
      // {
      //   title: intl.get('wsd.i18n.plan.feedback.planqty'),
      //   dataIndex: 'planQty',
      //   key: 'planQty',
      //   width: 150,
      //   render: (text) => {
      //     if (text) {
      //       return <span>{text + "h"}</span>
      //     } else {
      //       return "--"
      //     }
      //   }
      // },
      {
        title: intl.get('wsd.i18n.plan.plandefine.plantype'),
        dataIndex: 'planType',
        key: 'planType',
        width: 150,
        render: (text) => {
          if (text) {
            return <span>{text.name}</span>
          } else {
            return "--"
          }
        }
      },
      {
        title: intl.get('wsd.i18n.plan.feedback.planlevel'),
        dataIndex: 'planLevel',
        key: 'planLevel',
        width: 150,
        render: (text) => {
          if (text) {
            return <span>{text.name}</span>
          } else {
            return "--"
          }
        }
      }
    ];
    return (
      <div >
        <Modal className={style.main}
               title={"导入计划模板"} visible={true}
               onCancel={this.props.handleCancel}
               width="950px"
               mask={false}
               maskClosable={false}
               footer={
                 <div className="modalbtn">
                   <SubmitButton key={2} type="primary" onClick={this.handleOk} content="保存" />
                 </div>
               }
        >
          <div className={style.context}>
            <section className={style.search}>
              <Search search={this.search}></Search>
            </section>

            <div>
              <Table columns={columns} dataSource={this.state.data} pagination={false}
                     rowKey={record => record.id}
                     bordered={true}
                     size='small'
                     rowClassName={this.setClassName}
                     onRow={(record, index) => {
                       return {
                         onClick: () => {
                           this.getInfo(record, index)
                         }
                       }
                     }
                     } />
            </div>
          </div>
        </Modal>

      </div>
    )
  }
}

export default connect(state => ({
  currentLocale: state.localeProviderData
}))(ImportOneModal)
