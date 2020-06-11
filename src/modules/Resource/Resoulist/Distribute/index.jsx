import React from 'react'
import style from './style.less'
import { Table, Modal, Icon, Input, Button ,notification} from 'antd';
import _ from 'lodash'
import { connect } from 'react-redux'
import axios from "../../../../api/axios"
import { getRsrcrole } from "../../../../api/api"
import * as dataUtil from '../../../../utils/dataUtil';
import SubmitButton from "../../../../components/public/TopTags/SubmitButton"
const Search = Input.Search;
//分配modal，用于 组织机构，协作团队，项目团队
class Distribute extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      leftData: [],                             //左侧数据
      leftInitData: [],                         //左侧数据
      leftActiveKey: null,                  //左侧标记用于添加点击行样式
      rightActiveKey: null,                 //右侧标记用于添加点击行样式
      visible: true,                        //modal默认显示
      isMove: 'no',                         //配置按钮事件有效状态，right向右添加，left向左操作 no禁止操作
      locale: { emptyText: '暂无分配数据' },    //table初始化
      leftColumns: [],//左侧表头
      rightData: [],                        //右侧数据
      choiceData: []                         //选中数据
    }
  }
  componentDidMount() {
    axios.get(getRsrcrole).then(res => {
      this.setState({
        leftData: res.data.data,
        leftInitData: res.data.data,
      })
    })
  }

  //确认操作
  handleOk = () => {
    if (this.state.rightData.length==0) {
      notification.warning(
          {
              placement: 'bottomRight',
              bottom: 50,
              duration: 1,
              message: '警告',
              description: '没有选择数据！'
          }
      )
      return
  }
    this.props.distribute(this.state.rightData);
    this.props.handleCancel()
  }
 

  //获取选中数据
  getInfo = (record, index, type) => {
    if (type == 'left') {
      let isMove = null;

      var index = _.findIndex(this.state.rightData, function (e) {
        return e.id == record.id
      })
      if (index != '-1') {
        isMove = 'no'
      } else {
        isMove = 'right'
      }
      let obj={
        id:record.id,
        roleCode:record.roleCode,
        roleName:record.roleName
      }

      this.setState({
        leftActiveKey: record.id,
        rightActiveKey: null,
        isMove: isMove,
        choiceData: obj
      })
    } else {
      this.setState({
        isMove: 'left',
        leftActiveKey: null,
        rightActiveKey: record.id,
        choiceData: record
      })
    }

  }
  //左侧table，点击时添加背景色
  setLeftClassName = (record, index) => {
    //判断索引相等时添加行的高亮样式
    return record.id === this.state.leftActiveKey ? `${style['clickRowStyl']}` : "";
  }
  //右侧table，点击时添加背景色
  setRightClassName = (record, index) => {
    //判断索引相等时添加行的高亮样式
    return record.id === this.state.rightActiveKey ? `${style['clickRowStyl']}` : "";
  }
    //双击处理
    handleDoubleClick = (type, record) => {
      var rightData = this.state.rightData
     let shoiceData={...record}
     shoiceData.children = null;
      if (type == 'left') {
  
        var index = _.findIndex(rightData, function (e) {
          return e.id == shoiceData.id
        })
        if (index != '-1') {
          rightData.splice(index, 1);
        }
      } else {
        let index=rightData.findIndex(item=>item.id==shoiceData.id)
        if(index==-1){
          rightData.unshift(shoiceData)
        }
      
      }
      this.setState({
        rightData: rightData,
        isMove: 'no'
      })
    }
  //左右按钮选择操作数据
  moveData = (type) => {
    var rightData = this.state.rightData
    if (type == 'left') {
      var choiceData = this.state.choiceData
      var index = _.findIndex(rightData, function (e) {
        return e.id == choiceData.id
      })
      if (index != '-1') {
        rightData.splice(index, 1);
      }
    } else {
      rightData.unshift(this.state.choiceData)
    }
    this.setState({
      rightData: rightData,
      isMove: 'no'
    })
  }
  //搜索
  search = (value) => {
    const { leftInitData } = this.state;
    let newData = dataUtil.search(leftInitData, [{ "key": "roleName|roleCode", "value": value }], true);
    this.setState({ leftData: newData });
  }
  render() {
    const { intl } = this.props.currentLocale
    const leftColumns = [
      {
        title: intl.get('wsd.i18n.rsrc.rsrclist.rsrcname'),
        dataIndex: 'roleName',
        key: 'roleName',
        width:200
      },
      {
        title: intl.get('wsd.i18n.rsrc.rsrclist.rsrccode'),
        dataIndex: 'roleCode',
        key: 'roleCode',
      }
    ]
    const rightColumns = [
      {
        title: intl.get('wsd.i18n.rsrc.rsrclist.rsrcname'),
        dataIndex: 'roleName',
        key: 'roleName',
        width:200
      },
      {
        title: intl.get('wsd.i18n.rsrc.rsrclist.rsrccode'),
        dataIndex: 'roleCode',
        key: 'roleCode',
      }
    ]
    return (
      <div>
        <Modal 
          maskClosable={false}
          className={style.main}
          bodyStyle={{ height: 400 }}
          title="分配资源角色"
          width={900}
          visible={true}
          onOk={this.handleOk}
          onCancel={this.props.handleCancel}
          footer={
            <div className="modalbtn">
              <SubmitButton key={2} onClick={this.props.handleCancel} content="关闭" />
              <SubmitButton key={3} onClick={this.handleOk} type="primary" content="保存" />
            </div>
          }
        >
          <div className={style.search}>
            <Search
              placeholder="用户名称/用户代码"
              enterButton="搜索"
              onSearch={value => { this.search(value) }}
            />
          </div>
          <div className={style.main1}>
            <Table className={style.tableBox}
              rowKey={(record, index) => record.id}
              columns={leftColumns}
              scroll={{ y: 270 }}
              dataSource={this.state.leftData} pagination={false}
              size="small"
              bordered
              locale={this.state.locale}
              rowClassName={this.setLeftClassName}
              onRow={(record, index) => {
                return {
                  onClick: (event) => {
                    this.getInfo(record, index, 'left')
                  },
                  onDoubleClick: event => {
                  
                      this.handleDoubleClick('right', record)
                    
                  },
                }
              }
              }
            />
            <div className={style.border}>
              <div>
                <Button onClick={this.moveData.bind(this, 'right')} disabled={this.state.isMove == 'right' ? false : 'disabled'}
                  icon='double-right' style={{ marginBottom: 10 }} />
                <Button onClick={this.moveData.bind(this, 'left')} disabled={this.state.isMove == 'left' ? false : 'disabled'}
                  icon='double-left' />
              </div>
            </div>
            <Table className={style.tableBoxRight}
              rowKey={(record, index) => record.id}
              columns={rightColumns}
              scroll={{ y: 260 }}
              size="small"
              dataSource={this.state.rightData} pagination={false}
              bordered
              locale={this.state.locale}
              rowClassName={this.setRightClassName}
              onRow={(record, index) => {
                return {
                  onClick: (event) => {
                    this.getInfo(record, index, 'right')
                  },
                  onDoubleClick: event => {
                    this.handleDoubleClick('left', record)
                  },
                }
              }
              }
            />
          </div>
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    currentLocale: state.localeProviderData,
  }
};


export default connect(mapStateToProps, null)(Distribute);
