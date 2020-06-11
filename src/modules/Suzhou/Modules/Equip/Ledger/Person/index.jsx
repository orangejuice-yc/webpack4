import React, { Component } from 'react'
import style from './style.less'
import axios from '@/api/axios'
import { Table } from 'antd'
import notificationFun from '@/utils/notificationTip'
import AddPerson from '../AddPerson.jsx'
import ModifyPersonInfo from '../ModifyPersonInfo.jsx'
import CheckModal from "../../../../components/CheckModal"
import PublicButton from '@/components/public/TopTags/PublicButton'
import { querySpecialStaffList, addDeviceSpecialStaff, delDeviceSpecialStaff, updateDeviceSpecialStaff } from '../../../../api/suzhou-api'


export class QualityInspectionInfo extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      visibleAddPerson: false,
      isShowCheckModal: false,
      selectedRowKeys: [],
      data: [],
      total: 0,
      pageSize: 10,
      currentPageNum: 1,
      activeIndex: [],
      rightData: null,
      recordId: undefined,
      projectId: undefined,
      sectionId: undefined,
      modalTitle:'新增',
      addOrModify:"add"
    }
  }
  componentWillMount() {
    const {id, projectId, sectionId} = this.props.rightData
    this.setState({
      recordId: id, 
      projectId: projectId, 
      sectionId: sectionId
    }, () => {
      this.getPersonList()
    })
  }
  // 点击触发
  btnClicks = (type) => {
    if (type === 'AddTopBtn') {
      this.setState({visibleAddPerson: true,modalTitle: '新增',addOrModify:'add'})
    } else if (type === 'DeleteTopBtn') {
      const {selectedRowKeys, total, currentPageNum, rightData, data} = this.state
      axios.deleted(delDeviceSpecialStaff(), {data: selectedRowKeys || []}).then(res => {
        // 判断是否是删掉点击的那条 那么要清掉点击的数据和选中class
        if (rightData && selectedRowKeys.some(item => item === rightData.id)) {
          this.setState({
            rightData: null,
            rowClassName: null,
          });
        }
        this.setState({
          total: total - selectedRowKeys.length,
          data: data.filter(item => !selectedRowKeys.includes(item.id)),
          selectedRowKeys: [],
          selectedRows: [],
        }, () => {
          const {data} = this.state
          if (currentPageNum > 1 && data.length === 0) {
            this.setState({
              currentPageNum: currentPageNum - 1, 
              loading: true,
            }, () => {
              this.getPersonList()
            })
          }
          notificationFun('操作提醒', '删除成功', 'success')
        })
      })
    }else if(type == 'ModifyTopBtn'){
      if (!this.state.activeIndex) {
        notificationFun('操作提醒', '请选择数据进行操作', 'success')
      }else{
        this.setState({visibleAddPerson: true,modalTitle: '修改',addOrModify:"modify"})
      }
    }
  }
  // 点击行样式
  setClassName = (record, index) => {
      //判断索引相等时添加行的高亮样式
      return record.id == this.state.activeIndex ? 'tableActivty' : "";
  }
  // 获取点击行信息
  getInfo = (record, index) => {
      this.setState({
          activeIndex: record.id,
          rightData: record
      })
  }
  // 获取人员信息
  getPersonList = () => {
    const {currentPageNum, recordId} = this.state
    axios.get(querySpecialStaffList(recordId)).then(res => {
      const {data, total} = res.data
      if ( data.length === 0 && currentPageNum > 1) {
          this.setState({currentPageNum: currentPageNum - 1}, () => {
              this.getPersonList()
          })
      }
      this.setState({data, total, loading: false})
    })
  }
  // 取消新增
  handleModalCancel = () => {
    this.setState({
      visibleAddPerson: false,
    })
  }
  // 新增
  handleAddOk = (data0, val, cb) => {
    const {projectId, sectionId, recordId} = this.state
    const data1 = {...data0, projectId, sectionId, recordId}
    axios.post(addDeviceSpecialStaff(), data1).then(res => {
      this.getPersonList()
      if (val === 'save') {
        this.setState({visibleAddPerson: false})
      }
      cb()
      notificationFun('操作提醒', '新增成功', 'success')
    })
  }
  //修改
  updateModal = (data) =>{
    axios.put(updateDeviceSpecialStaff(), data, true).then(res => {
      this.getPersonList();
      this.handleModalCancel();
    })
  }
  //显示附件
  onClickHandleCheck = (record) => {
    this.setState({
        isShowCheckModal: true,
        checkRecord: record
    })
  }
  //关闭附件
  closeCheckModal = () => {
    this.setState({
        isShowCheckModal: false
    })
  }
  //判断是否有选中数据
  hasRecord = () => {
    if (this.state.selectedRowKeys.length == 0){
      notificationFun('操作提醒', '未选中数据')
      return false;
    } else {
      return true
    }
  }
  render() {
    const {loading, data, total, currentPageNum, pageSize, selectedRowKeys} = this.state
    const columns = [
      {
        title: '序号',
        render: (text, record, index) => `${index + 1}`
      }, 
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '工种',
        dataIndex: 'craft',
        key: 'craft',
      },
      {
        title: '相关证书',
        dataIndex: 'fileCount',
        key: 'fileCount',
        render:(text,record)=>{
          return <a onClick={this.onClickHandleCheck.bind(this, record)} style={{ cursor: 'pointer' }}>{`查看(${text})`}</a>
        }
      }
    ]
    // 表格行是否可选配置
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys
        })
      }
    }
    const {permission} = this.props
    return (
      <div className={style.main}>
        <div className={style.mainHeight}>
          <h3 className={style.listTitle}>人员信息</h3>
          <div className={style.rightTopTogs}>
          {permission.indexOf('LEDGER_EDIT-DEVICE-PERSON')!==-1 && (
            <PublicButton 
              name={'新增'} 
              title={'新增'} 
              icon={'icon-add'}
              afterCallBack={this.btnClicks.bind(this, 'AddTopBtn')}
              res={'MENU_EDIT'}
            />)}
            {permission.indexOf('LEDGER_EDIT-DEVICE-PERSON')!==-1 && (
            <PublicButton 
              name={'修改'} 
              title={'修改'} 
              icon={'icon-xiugaibianji'}
              afterCallBack={this.btnClicks.bind(this, 'ModifyTopBtn')}
              res={'MENU_EDIT'}
            />)}
            {permission.indexOf('LEDGER_EDIT-DEVICE-PERSON')!==-1 && (
            <PublicButton 
              name={'删除'} 
              title={'删除'} 
              icon={'icon-shanchu'}
              verifyCallBack={this.hasRecord}
              useModel={true} 
              afterCallBack={this.btnClicks.bind(this, 'DeleteTopBtn')}
              content={'你确定要删除吗？'}
              res={'MENU_EDIT'}
            />)}
            {
              this.state.visibleAddPerson ? <AddPerson 
              visibleAddPerson={this.state.visibleAddPerson}
              modalTitle = {this.state.modalTitle}
              addOrModify = {this.state.addOrModify}
              handleModalOk={this.handleAddOk}
              updateModal = {this.updateModal}
              data = {this.state.rightData}
              handleModalCancel={this.handleModalCancel}
              projectId={this.state.projectId}
              sectionId={this.state.sectionId}
              recordId={this.state.recordId}
            />:null
            }
           
            {this.state.isShowCheckModal &&
              <CheckModal
                  visible={this.state.isShowCheckModal}
                  handleCancel={this.closeCheckModal.bind(this)}
                  record={this.state.checkRecord}
                  menuCode = {'DEVICE-LEDGER-PERSON'}
                  deleteFlag = {'hide'}
                  // extInfo={this.props.extInfo}
            />}
          </div>
          <div className={style.mainScorll} style={{minWidth: '100%', overflow: 'hidden'}}>
            <Table className={style.table}
              columns={columns} 
              dataSource={data} 
              pagination={false}
              rowSelection={rowSelection}
              rowKey={_r => _r.id}
              rowClassName={this.setClassName}
              loading={loading}
              onRow={(_r) => {
                return {
                  onClick: this.getInfo.bind(this, _r),
                };
              }}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default QualityInspectionInfo
