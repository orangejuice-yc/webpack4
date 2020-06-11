import React, { Component } from 'react'
import style from './style.less'
import { Modal, Table, Button, notification } from 'antd';
import intl from 'react-intl-universal'
import Search from './Search'
import '../../../../asserts/antd-custom.less'
import PublicButton from '../../../../components/public/TopTags/PublicButton'
import axios from "../../../../api/axios"
import * as dataUtil from "../../../../utils/dataUtil"
import PageTable from "../../../../components/PublicTable"
import AddReply from "./AddReply"
import {

  getvariable,
  getCommunicationrRcordList
} from "../../../../api/api"

export class ComcateLogModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      searcher: {},
      columns: [],
      data: [],
      projSet: { dateFormat: 'YYYY-MM-DD', drtnUnit: 'h', timeUnit: 'h', precision: 2, moneyUnit: '¥' },
    }
  }
  componentDidMount() {
    this.getProjSetInfo()
    this.getFormData()
  }
  getProjSetInfo = () => {
    let { rightData } = this.props

    axios.get(getvariable(rightData.projectId)).then(res => {

      const data = res.data.data || {};
      const projSet = {
        dateFormat: (data.dateFormat || {}).id || "YYYY-MM-DD",
        drtnUnit: (data.drtnUnit || {}).id || "h",
        timeUnit: (data.timeUnit || {}).id || "h",
        precision: data.precision || 2,
        moneyUnit: (data.currency || {}).symbol || "¥",
      }
      this.setState({
        projSet
      })
    })
  }


  /**
 * 获取表单列表
 */
  getFormData = () => {
    let info = {

      ...this.state.searcher,
      defineId: this.props.rightData.nodeType == "define" ? this.props.rightData.id : this.props.rightData.defineId
    }
    let url = dataUtil.spliceUrlParams(getCommunicationrRcordList, info);
    axios.get(url).then(res => {
      if (res.data.data) {
        let data = res.data.data
        data.sort((a, b) => a.id < b.id)
        //计算合并单元格，跨行数
        let temp = {}
        let sort = 1
        data.forEach((item, index) => {
          if (!temp[item.id]) {
            temp[item.id] = 0;
            for (let i = index; i < data.length; i++) {
              if (item.id == data[i].id) {
                temp[item.id]++
              }
            }
            item.rowSpan = temp[item.id]
            item.sort = sort
            sort++
          } else {
            item.rowSpan = 0
          }
        })
        this.setState({
          data:[]
        },()=>{
          this.setState({
            record: null,
            data,
            searcher: {}
          })
        })
        


      }
    })

  }

  /**
  * 获取选中集合、复选框
  * @method getListData
  * @description 获取用户列表、或者根据搜索值获取用户列表
  * @param {string} record  行数据
  * @return {array} 返回选中用户列表
  */
  getRowData = (record) => {
    this.setState({
      record
    })
  };
  //搜索
  searchList = (searcher) => {
    this.setState({
      searcher
    }, () => {
      this.getFormData()
    })
  }


  //常用回复
  addReply = () => {
    this.getFormData()
  }
  //打开回复
  openReply = () => {
    const { record } = this.state
    if (!record) {
      notification.warning({
        placement: 'bottomRight',
        bottom: 50,
        duration: 2,
        message: '提示',
        description: '请选择数据再操作'
      });
      return;
    }
    this.setState({
      addreply: true
    })
  }
  setClassName = (record, index) => {
    //判断索引相等时添加行的高亮样式
    return this.state.record && record.id === this.state.record.id ? 'tableActivty' : "";
  }
  //定位
  location = () => {
    const { record } = this.state
    if (!record) {
      notification.warning({
        placement: 'bottomRight',
        bottom: 50,
        duration: 2,
        message: '提示',
        description: '请选择数据再操作'
      });
      return;
    }
    this.props.locationTask(record)
    this.props.handleCancel()
  }

  render() {


    const columns = [
      {
        title: "序号",
        dataIndex: 'sort',
        width: 100,
        key: 'sort',
        render: (text, record) => {
          const obj = {
            children: <span title={text}>{text}</span>,
            props: {},
          };
          obj.props.rowSpan = record.rowSpan;
          return obj;
        }
      },
      {
        title: "所属WBS/任务",
        dataIndex: 'taskName',
        width: 150,
        key: 'taskName',
        render: (text, record) => {
          const obj = {
            children: <span title={text}>{text}</span>,
            props: {},
          };
          obj.props.rowSpan = record.rowSpan;
          return obj;
        }
      },
      {
        title: "问题类型",
        dataIndex: 'questionType',
        key: 'questionType',
        width: 100,
        render: (text, record) => {
          const obj = {
            children: <span title={text.name}>{text ? text.name : null}</span>,
            props: {},
          };
          obj.props.rowSpan = record.rowSpan;
          return obj;
        }

      },
      {
        title: "意见",
        width: 150,
        dataIndex: 'questionContent',
        key: 'questionContent',
        render: (text, record) => {
          const obj = {
            children: <span title={text}>{text}</span>,
            props: {},
          };
          obj.props.rowSpan = record.rowSpan;
          return obj;
        }
      },
      {
        title: "提出部门",
        dataIndex: 'questionCreatedOrg',
        key: 'questionCreatedOrg',
        width: 100,
        render: (text, record) => {
          const obj = {
            children: text ? <span title={text.name}>{text.name}</span> : "",
            props: {},
          };
          obj.props.rowSpan = record.rowSpan;
          return obj;
        }
      },
      {
        title: "提出人",
        dataIndex: 'questionCreatedUser',
        key: 'questionCreatedUser',
        width: 100,
        render: (text, record) => {
          const obj = {
            children: text ? <span title={text.name}>{text.name}</span> : "",
            props: {},
          };
          obj.props.rowSpan = record.rowSpan;
          return obj;
        }
      },
      {
        title: "提出日期",
        dataIndex: 'questionCreatedDate',
        key: 'questionCreatedDate',
        width: 100,
        render: (text, record) => {
          const obj = {
            children: text ? <span title={text}>{dataUtil.Dates().formatTimeString(text, this.state.projSet.dateFormat)}</span> : "",
            props: {},
          };
          obj.props.rowSpan = record.rowSpan;
          return obj;
        }
      },
      {
        title: "回复内容",
        dataIndex: 'questionReplyContent',
        key: 'questionReplyContent',
        width: 150,
        render: (text) => <span title={text}>{text}</span>
      },
      {
        title: "回复人",
        dataIndex: 'questionReplyUser',
        key: 'questionReplyUser',
        width: 100,
        render: (text) => text ? <span title={text.name}>{text.name}</span> : null
      },
      {
        title: "回复日期",
        dataIndex: 'questionReplyDate',
        key: 'questionReplyDate',

        render: (text) => text ? <span title={text}>{dataUtil.Dates().formatTimeString(text, this.state.projSet.dateFormat)}</span> : ""
      },

    ]

    return (
      <Modal className={style.main} width="1000px" centered={true}
        title="沟通记录" visible={true} onCancel={this.props.handleCancel} bodyStyle={{ padding: 0 }}
        footer={null}>
        <div className={style.tableMain}>
          <div className={style.search}>
            {/*搜索*/}
            <PublicButton title={'搜索'} icon={'icon-search'} afterCallBack={() => this.setState({ findvisiable: true })} />
            {/*导出沟通记录*/}
            <PublicButton title={'导出沟通记录'} icon={'icon-daochu'} afterCallBack={() => this.setState({})} />
            {/*定位*/}
            <PublicButton title={'定位'} icon={'icon-add'} afterCallBack={this.location} />
            {/*快捷回复*/}
            <PublicButton title={'快捷回复'} icon={'icon-querendan-'} afterCallBack={this.openReply} />

            {
              this.state.findvisiable && <Search
                handleCancel={() => this.setState({ findvisiable: false })}
                projectId={this.props.projectId}
                searchList={this.searchList} />
            }
            {
              this.state.addreply &&
              (
                <AddReply
                  addReply={this.addReply}
                  record={this.state.record}

                  handleCancel={() => this.setState({ addreply: false })}

                />
              )
            }
          </div>
          {/* <PageTable onRef={ref => this.formList = ref}
            pagination={false}
            getData={this.getFormData}
            columns={columns}
            bordered={false}
            dataSource={this.state.data}
            loading={this.state.loading1}
            scroll={{ x: '100%', y: 300 }}
            getRowData={this.getRowData}
          /> */}
          <Table
            rowKey={record => record.id}
            defaultExpandAllRows={true}
            pagination={false}
            bordered
            columns={columns}
            scroll={{ x: 1200, y: 350 }}
            dataSource={this.state.data}
            rowClassName={this.setClassName}
            onRow={(record, index) => {
              return {
                onClick: (event) => {
                  this.setState({
                    record
                  })
                }
              }
            }
            }
          />
        </div>
      </Modal>
    )
  }
}


export default ComcateLogModal
