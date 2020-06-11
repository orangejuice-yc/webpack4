import React, { Component } from 'react';
import { Table, notification, Modal } from 'antd';
import style from './style.less';
import Search from '../../../../components/Search';
import PublicButton from '../../../../../../components/public/TopTags/PublicButton';
import Add from '../AddModal';
import axios from '../../../../../../api/axios'
import {deleteObjectTemplate,selectDetailItemObjectTemplates} from '../../../../api/suzhou-api'
import { connect } from 'react-redux';
const confirm = Modal.confirm;
import { baseURL } from '../../../../../../api/config';
import * as dataUtil from '../../../../../../utils/dataUtil';
import CheckModal from "../../../../components/CheckModal/"
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
      currentPageNum: 1,
      total:'',
      pageSize: 10,
      isShowCheckModal:false,//查看附件
    };
  }
  //请求接口函数
  getListData = (id) => {
    axios.get(selectDetailItemObjectTemplates(id)).then(res => {
      this.setState({
        data: res.data.data,
      })
    });
  }
  componentDidMount() {
    const {rightData} = this.props;
    rightData ? this.getListData(rightData.id): null;
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
        axios.deleted(deleteObjectTemplate, { data: selectedRowKeys }, true).then(res => {
          //删除
          const obj = {
            ...this.props.rightData,
            itemCount:this.props.rightData.itemCount-selectedRowKeys.length
          }
          this.props.updateSuccess(obj);
          this.setState({
              selectedRows:[],
              selectedRowKeys:[],
          },()=>{
              this.getListData(this.props.rightData.id);
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
  //关闭权限弹框modal
  closePermissionModal = () => {
    this.setState({
      isShowModal: false
    });
  };
  //设置table的选中行class样式
  setClassName = (record, index) => {
    return record.id === this.state.activeIndex ? 'tableActivty' : '';
  };
  render() {
    const columns = [
      {
          title:'违规行为',
          dataIndex: 'checkTitle',
          key: 'checkTitle',
          width:"80%",
      },
      {
          title:'扣分标准',
          dataIndex: 'deductionStandard',
          key: 'deductionStandard',
          width:"20%",
      },
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
            <h3 className={style.listTitle}>考核明细</h3>
            <div className={style.rightTopTogs}>
              {/*新增*/}
              {/* {props.permission.indexOf('DISCOVER_MATERIEL-DETAILL')!==-1 && ( */}
                {/* <PublicButton edit={true} name={'增加'} title={'增加'} icon={'icon-add'} afterCallBack={this.onClickHandle.bind(this, 'AddTopBtn')} /> */}
                {/* )} */}
              {/*删除*/}
              {props.permission.indexOf('OBJECTIVE_EDIT_OBJECTTEMPLATE')!==-1 && (
                <PublicButton edit={true} name={'修改'} title={'修改'} icon={'icon-edit'} afterCallBack={this.onClickHandle.bind(this, 'ModifyTopBtn')} />
              )}
              {props.permission.indexOf('OBJECTIVE_EDIT_OBJECTTEMPLATE')!==-1 && (
                <PublicButton edit={true} name={"删除"} title={"删除"} useModel={true} verifyCallBack={this.deleteVerifyCallBack} afterCallBack={this.onClickHandle.bind(this,"DeleteTopBtn")} icon={"icon-delete"} />
              )}
              {this.state.isShowModal &&
                <Add
                  visible={this.state.isShowModal}
                  handleCancel={this.closePermissionModal.bind(this)}
                  title={this.state.modalTitle}
                  addOrModify={this.state.addOrModify}
                  data={this.state.addOrModify == 'add' ? this.props.data : this.state.record}
                  rightData = {this.props.rightData}
                  menuCode={this.props.menuCode}
                  updateSuccess={this.updateSuccess} addData={this.addData}
                  getListData = {this.getListData.bind(this.id)}
                  record={this.state.record}
                />}
                
            </div>
            <div className={style.mainScorll}>
              <Table className={style.table} rowKey={record => record.id} 
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