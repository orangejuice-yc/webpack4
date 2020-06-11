import React, { Component } from 'react';
import { Table, notification, Modal } from 'antd';
import style from './style.less';
import Search from '../../../../components/Search';
import PublicButton from '../../../../../../components/public/TopTags/PublicButton';
import ListAdd from '../ListAdd';
import axios from '../../../../../../api/axios'
import {getMaterialList,delInspectionRel} from '../../../../api/suzhou-api'
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
      currentPageNum: 1,
      total:'',
      pageSize: 10,
      isShowCheckModal:false,//查看附件
    };
  }
  //请求接口函数
  getListData = (id) => {
    const {currentPageNum,pageSize} = this.state;
    axios.get(getMaterialList(pageSize,currentPageNum,id)).then(res => {
      this.setState({
        data: res.data.data,
        total:res.data.total
      })
    });
  }
  componentDidMount() {
    const {rightData} = this.props;
    this.setState({
      projectId:rightData.projectId,
      sectionId:rightData.sectionId,
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
    if (name == 'DeleteTopBtn') {
      let { selectedRowKeys, data,selectedRows } = this.state;
      if (selectedRowKeys.length > 0) {
        axios.deleted(delInspectionRel, { data: selectedRowKeys }, true).then(res => {
          //删除
          const {total,selectedRows,pageSize,currentPageNum} = this.state
          let totalPageNum = Math.ceil((total - selectedRows.length) / pageSize);        //计算总页数
          let PageNum = totalPageNum >= currentPageNum ? currentPageNum : totalPageNum   //总页数大于等于 当前页面，当前页数不变 否则 为1
          this.setState({
              selectedRows:[],
              selectedRowKeys:[],
              currentPageNum:(PageNum == 0)?1:PageNum
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
    this.setState({
      data: [v, ...this.state.data],
      total: this.state.total + 1
    });
  }
  //关闭权限弹框modal
  closePermissionModal = () => {
    this.setState({
      isShowModal: false
    });
  };
  render() {
    const columns = [
      {
          title:'物料编码',
          dataIndex: 'classificationVo.materialCode',
          key: 'classificationVo.materialCode',
          width:"13%",
      },
      {
          title:'物料名称',
          dataIndex: 'classificationVo.materialName',
          key: 'classificationVo.materialName',
          width:"12%",
      },
      {
          title: '来源',
          dataIndex: 'classificationVo.source',
          key: 'classificationVo.source',
          width:"12%",
      },
      {
          title:'规格型号',
          dataIndex: 'classificationVo.specification',
          key: 'classificationVo.specification',
          width:"13%",
      },
      {
          title:'计量单位',
          dataIndex: 'classificationVo.unit',
          key: 'classificationVo.unit',
          width:"12%",
      },
      {
          title:'供货商',
          dataIndex: 'classificationVo.supplier',
          key: 'classificationVo.supplier',
          width:"13%",
      },
      {
          title:'品牌',
          dataIndex:"classificationVo.brand",
          key:"classificationVo.brand",
          width:"12%",
          
      },
      {
          title:'备注说明',
          dataIndex:"classificationVo.description",
          key:"classificationVo.description",
          width:"13%",
          
      }
    ];
    let pagination = {
      total: this.state.total,
      // hideOnSinglePage: true,
      current: this.state.currentPageNum,
      pageSize: this.state.pageSize,
      showSizeChanger: true,
      size:"small",
      showQuickJumper: true,
      showTotal: total => `总共${this.state.total}条`,
      onShowSizeChange: (current, size) => {
        this.setState({
          pageSize: size,
          currentPageNum: 1
        }, () => {
          this.getListData(this.props.rightData.inspectionCode);
        })
      },
      onChange: (page, pageSize) => {
        this.setState({
          currentPageNum: page
        }, () => {
          this.getListData(this.props.rightData.inspectionCode);
        })
      }
    }
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
            <h3 className={style.listTitle}>检测清单</h3>
            <div className={style.rightTopTogs}>
              {/*新增*/}
              {props.permission.indexOf('DISCOVER_MATERIEL-DETAILL')!==-1 && (
                <PublicButton edit={this.props.rightData.statusVo &&this.props.rightData.statusVo.code == '0'?true:false} name={'获取'} title={'获取'} icon={'icon-add'} afterCallBack={this.onClickHandle.bind(this, 'AddTopBtn')} />)}
              {/*删除*/}
              {props.permission.indexOf('DISCOVER_MATERIEL-DETAILL')!==-1 && (
              <PublicButton edit={this.props.rightData.statusVo &&this.props.rightData.statusVo.code == '0'?true:false} title={"删除"} useModel={true} verifyCallBack={this.deleteVerifyCallBack} afterCallBack={this.onClickHandle.bind(this,"DeleteTopBtn")} icon={"icon-delete"} />)}
              {this.state.isShowModal &&
                <ListAdd
                  visible={this.state.isShowModal}
                  handleCancel={this.closePermissionModal.bind(this)}
                  title={this.state.modalTitle}
                  addOrModify={this.state.addOrModify}
                  data={this.state.addOrModify == 'add' ? this.props.data : this.state.record}
                  rightData = {this.props.rightData}
                  menuCode={this.props.menuCode}
                  updateSuccess={this.updateSuccess} addData={this.addData}
                  getListData = {this.getListData.bind(this.id)}
                />}
                
            </div>
            <div className={style.mainScorll}>
              <Table className={style.table} rowKey={record => record.id} 
                columns={columns} 
                dataSource={this.state.data} 
                pagination={pagination}
                name={this.props.name}
                size='small'
                rowSelection={rowSelection}
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