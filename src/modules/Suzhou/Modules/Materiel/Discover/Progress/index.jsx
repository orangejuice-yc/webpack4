import React, { Component } from 'react';
import { Table, notification, Modal } from 'antd';
import style from './style.less';
import Search from '../../../../components/Search';
import PublicButton from '../../../../../../components/public/TopTags/PublicButton';
import AddModal from '../ProgressAdd';
import axios from '../../../../../../api/axios'
import {inspectionProgressList,getBaseSelectTree,delInspectionProgress} from '../../../../api/suzhou-api'
import { connect } from 'react-redux';
const confirm = Modal.confirm;
import { baseURL } from '../../../../../../api/config';
import * as dataUtil from '../../../../../../utils/dataUtil';
import CheckModal from "../../../../components/CheckModal/"
//证书管理
class Permission extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initDone: false,
      isShowModal: false,
      activeIndex: '',
      record: '',
      selectData: null,
      addOrModify: 'add',//新增或修改
      modalTitle: null,
      data: [],
      selectedRowKeys: [],
      selectedRows:[],
      UploadVisible: false,//上传文件
      isShowCheckModal:false,//查看附件
    };
  }
  //请求接口函数
  getListData = (id) => {
    const {projectId} = this.props.rightData;
    axios.get(inspectionProgressList(id),{param:{projectId}}).then(res => {
      this.setState({
        data: res.data.data,
      })
    });
  }
  componentDidMount() {
    const {rightData} = this.props;
    this.setState({
      projectId:rightData.projectId,
      sectionId:rightData.sectionId,
      source:rightData.inspectionType?rightData.inspectionType.code:'0'
    })
    rightData ? this.getListData(rightData.inspectionCode): null;
  }
  //删除验证
  deleteVerifyCallBack=()=>{
    let { selectedRowKeys, data } = this.state;
    if (selectedRowKeys.length==0) {
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 2,
          message: '未选中数据',
          description: '请勾选数据进行操作'
        }
      )
      return false
    }else{
      return true
    }
  }
  onClickHandle = (name) => {
    if (name == 'AddTopBtn') {
      this.setState({
        isShowModal: true,
        addOrModify: 'add',
        modalTitle: '新增',
      });
    }
    if (name == 'ModifyTopBtn') {
      if (!this.state.activeIndex) {
        notification.warning(
          {
            placement: 'bottomRight',
            bottom: 50,
            duration: 2,
            message: '未选中数据',
            description: '请选择数据进行操作'
          }
        )
      } else {
        this.setState({
          isShowModal: true,
          addOrModify: 'modify',
          modalTitle: '修改',
        });
      }
    }
    if (name == 'DeleteTopBtn') {
      let { selectedRowKeys, data,selectedRows } = this.state;
      if (selectedRowKeys.length > 0) {
          axios.deleted(delInspectionProgress, { data: selectedRowKeys }, true).then(res => {
            //删除
            this.setState({
                selectedRows:[],
                selectedRowKeys:[],
            },()=>{
                this.getListData(this.props.rightData.inspectionCode);
            })
        })
      } else {
        notification.warning(
          {
            placement: 'bottomRight',
            bottom: 50,
            duration: 2,
            message: '未选中数据',
            description: '请选择数据进行操作'
          }
        )
      }

    }
  };
  //更新
  updateSuccess = (data) => {
    let index = this.state.data.findIndex(v => {return v.id == data.id})
    this.setState((preState, props) => ({
      data: [...preState.data.slice(0, index), data, ...preState.data.slice(index + 1)],
      record:data
    }))
    this.props.updateProgress();
  }
  //点击行事件
  getInfo = (record, index) => {
    let id = record.id;
    if (this.state.activeIndex == id) {
      this.setState({
        activeIndex: null,
        selectData: null,
        addOrModify: 'add',
      });
    } else {
      this.setState({
        activeIndex: id,
        selectData: record,
        record: record
      });
    }

  };
  //新增处理
  addData = (v) => {
    // this.setState({
    //   data: [v, ...this.state.data],
    // });
    this.getListData(this.props.rightData.inspectionCode);
    const obj ={
      ...this.props.rightData,
      statusVo:v.statusVo
    }
    this.props.updateSuccess(obj);
  }
  //关闭权限弹框modal
  closePermissionModal = () => {
    this.setState({
      isShowModal: false
    });
  };
  handleCancel = (v) => {
    this.setState({
        UploadVisible: false
    })
  }
   //设置table的选中行class样式
   setClassName = (record, index) => {
    return record.id === this.state.activeIndex ? 'tableActivty' : '';
  };
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
  render() {
    const columns = [
        {
          title:'进展情况说明',
          dataIndex: 'progressComment',
      },
      {
          title:'进展状态',
          dataIndex: 'statusVo.name',
      },
      {
          title: '创建时间',
          dataIndex: 'creatTime',
        },
      {
          title:'备注说明',
          dataIndex: 'description',
      },
      {
          title:'文件',
          dataIndex:"fileCount",
          key:"fileCount",
          width:"15%",
          render:(text,record)=>{
            return <a onClick={this.onClickHandleCheck.bind(this, record)} style={{ cursor: 'pointer' }}>{`查看(${text})`}</a>
          }
      }
    ];
    let { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          selectedRows
        })
      }
    };
    const props = this.props
    return (
      <div className={style.main}>
          <div className={style.mainHeight}>
            <h3 className={style.listTitle}>进展情况</h3>
            <div className={style.rightTopTogs}>
              {/*新增*/}
                {props.permission.indexOf('DISCOVER_MATERIEL-STATUS')!==-1 && (
                <PublicButton edit={this.props.rightData.statusVo &&this.props.rightData.statusVo.code == '0'?true:false} title={'新增'} icon={'icon-add'} afterCallBack={this.onClickHandle.bind(this, 'AddTopBtn')} />)}
                {props.permission.indexOf('DISCOVER_MATERIEL-STATUS')!==-1 && (
                <PublicButton edit={this.props.rightData.statusVo &&this.props.rightData.statusVo.code == '0'?true:false} name={'修改'} title={'修改'} icon={'icon-xiugaibianji'} afterCallBack={this.onClickHandle.bind(this, 'ModifyTopBtn')} />)}
              {/*删除*/}
              {props.permission.indexOf('DISCOVER_MATERIEL-STATUS')!==-1 && (
              <PublicButton edit={this.props.rightData.statusVo &&this.props.rightData.statusVo.code == '0'?true:false} title={"删除"} useModel={true} verifyCallBack={this.deleteVerifyCallBack} afterCallBack={this.onClickHandle.bind(this,"DeleteTopBtn")} icon={"icon-delete"} />)}
              {this.state.isShowModal &&
                <AddModal
                  visible={this.state.isShowModal}
                  handleCancel={this.closePermissionModal.bind(this)}
                  title={this.state.modalTitle}
                  addOrModify={this.state.addOrModify}
                  data={this.state.addOrModify == 'add' ? this.props.data : this.state.record}
                  parentData={this.props.data}
                  rightData = {this.props.rightData}
                  menuCode={this.props.menuCode}
                  updateSuccess={this.updateSuccess} addData={this.addData}
                  updateProgress = {this.props.updateProgress}
                />}
                {/* 查看附件 */}
                {this.state.isShowCheckModal &&
                    <CheckModal
                        visible={this.state.isShowCheckModal}
                        handleCancel={this.closeCheckModal.bind(this)}
                        record={this.state.checkRecord}
                        menuCode = {'MATERIEL-DISCOVER-PROGRESS'}
                        deleteFlag = {'hide'}
                        // extInfo={this.props.extInfo}
                />}
            </div>
            <div className={style.mainScorll}>
              <Table className={style.table} 
                rowKey={record => record.id} 
                columns={columns} 
                dataSource={this.state.data} 
                pagination={false}
                name={this.props.name}
                size='small'
                rowSelection={rowSelection}
                rowClassName={this.setClassName}
                onRow={(record, index) => {
                  return {
                    onClick: (event) => {
                      this.getInfo(record, index);
                    },
                    onDoubleClick: (event) => {
                      event.currentTarget.getElementsByClassName("ant-checkbox-wrapper")[0].click();
                    }
                  };
                }
                } />
            </div>
          </div>
      </div>
    );
  }
}



const mapStateToProps = state => {
  return {
    currentLocale: state.localeProviderData,
  
  }
};

export default connect(mapStateToProps, null)(Permission);