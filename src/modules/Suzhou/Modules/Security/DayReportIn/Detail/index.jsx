import React, { Component } from 'react';
import { Table, notification, Modal,Upload,DatePicker} from 'antd';
import style from './style.less';
import moment from 'moment';
import Search from '../../../../components/Search';
import PublicButton from '../../../../../../components/public/TopTags/PublicButton';
import CheckModal from "../../../../components/CheckModal/"
import axios from '../../../../../../api/axios'
import {getRcDetailReport,bindRcDetailFile} from '../../../../api/suzhou-api'
import { connect } from 'react-redux';
import { baseURL } from '../../../../../../api/config';
import UploadTpl from '../../../../components/Upload/uploadTpl';
import PageTable from '@/components/PublicTable';
import * as dataUtil from '@/utils/dataUtil';
const confirm = Modal.confirm;
const { RangePicker } = DatePicker;
//人员
class Permission extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initDone: false,
      activeIndex: '',
      record: '',
      selectData: null,
      modalTitle: null,
      filesTitle:"文件",
      data: [],
      selectedRowKeys: [],
      selectedRows:[],
      currentPageNum: 1,
      pageSize: 10,
      total:'',
      UploadVisible: false,//上传文件
      isShowFileModal:false,//文件显示
      file: null,
      fileList: [],
      editFlag:true,
      search:'',
      zqStart:'',//时间开始
      zqEnd:'',//时间结束
      canEdit:false,//文件操作
      uploadTplPermission:''
    };
  }
  onRef = (ref) => {
    this.table = ref
  }
    getSelectedRowKeys = (selectedRowKeys, selectedRows) => {
        this.setState({
            selectedRows,
            selectedRowKeys
        })
    }
  //请求接口函数
    getListData =()=>{
        const {projectId,sectionId,rightData,viewType} = this.props;
        const {zqStart,zqEnd,currentPageNum,pageSize} = this.state;
        axios.get(getRcDetailReport(pageSize,currentPageNum,rightData.id),{params:{zqStart,zqEnd,projectId,viewType}}).then(res=>{
            this.setState({
                data: res.data.data,
                total:res.data.total
            })
        })
    }
    componentDidMount(){
        let firstDate = new Date();
        firstDate.setDate(1); //第一天
        let endDate = new Date(firstDate);
        endDate.setMonth(firstDate.getMonth() + 1);
        endDate.setDate(0);
        const firstDay =
        (new Date(firstDate).getDate() + '').length == 1
            ? '0' + new Date(firstDate).getDate()
            : new Date(firstDate).getDate();
        const endDay =
        (new Date(endDate).getDate() + '').length == 1
            ? '0' + new Date(endDate).getDate()
            : new Date(endDate).getDate();
        const startTime = `${new Date(firstDate).getFullYear()}-${new Date(firstDate).getMonth() +
        1}-${firstDay}`;
        const endTime = `${new Date(endDate).getFullYear()}-${new Date(endDate).getMonth() +
        1}-${endDay}`;
        this.setState({
            zqStart: startTime,
            zqEnd: endTime,
        },()=>{
            this.getListData();
        });
        let menuCode = this.props.menuCode
        if(menuCode=='SECURITY-DAYREPORTIN'){
          this.setState({
            uploadTplPermission:'DAYREPORTIN_RC-REPORT-IN-DETAILL',
            
          })
        }else if(menuCode=='SECURITY-DAYREPORTOUT'){
          this.setState({
            uploadTplPermission:'DAYREPORTOUT_DETAIL-DAYREPORT-OUT',
            
          })
        }
    }
  //点击行事件
  getInfo = (record, index) => {
    const { activeIndex } = this.state;
    const { id } = record;
    if(record.canEdit == '1'){//可编辑
        this.setState({
            activeIndex: id,
            selectData: record,
            record: record,
            editFlag:false,
            canEdit:true
        });
    }else{
        this.setState({
            canEdit:false,
            editFlag:true
        })
    }
    
    // let id = record.id;
    // if (this.state.activeIndex == id) {
    //   this.setState({
    //     activeIndex: null,
    //     selectData: null,
    //     editFlag:true,
    //     canEdit:false,
    //   });
    // } else {
        
      
    // }
  };
  //关闭文件弹窗
  closeFilesModal = () => {
    this.setState({
      isShowFileModal: false
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
  //文件操作
  onAction = (record) =>{
    this.setState({
        isShowFileModal: true,
        checkRecord: record,
    })
    if(record.canEdit == '1'){
        this.setState({
            canEdit:true
        })
    }else{
        this.setState({
            canEdit:false
        })
    }
  }
    //关闭附件
    closeCheckModal = () => {
        this.setState({
        isShowFileModal: false
        })
    }
    //选择时间
    changeTime = (times, dateString)=>{
        this.setState({
            zqStart: !dateString[0]
              ? ''
              : moment(dateString[0]).format('YYYY-MM-DD'),
            zqEnd: !dateString[1]
              ? ''
              : moment(dateString[1]).format('YYYY-MM-DD'),
          },()=>{
            this.getListData();
          });
    }
    delDoc = ()=>{
        this.getListData();
    }
 //上传回调
 file = (files) => {
  let { fileList } = this.state;
  let fileIds = [];
  if (files.response && files.response.data) {
    let file = files.response.data;
    let name = file.fileName.split('.')[0];
    let type = file.fileName.split('.')[1];
    let obj = {
      id: file.id,
      name,
      type
    }
    fileList.push(obj);
    fileIds.push(file.id);
  }
  this.setState({
    fileList,
  })
  const bizType = this.props.viewType == 0 ? "SECURITY-DAYREPORTIN-DETAIL":'SECURITY-DAYREPORTOUT-DETAIL';
  const data={
    fileIds,
    bizId:this.state.record.id,
    bizType:bizType
  }
  axios.post(bindRcDetailFile,data,true).then(res=>{
    if(res.status == 200){
      this.getListData();
    }
  })
}
  render() {
    const columns = [
      {
        title:'周期数',
        dataIndex: 'sbQs',
        key: 'sbQs',
      },
      {
        title:'周期范围',
        dataIndex: 'zqStart',
        key: 'zqStart',
        render:(text,record)=>{
            return <span>{text+'-'+record.zqEnd}</span>
        }
      },
      {
        title:'部门名称',
        dataIndex: 'companyName',
        key: 'companyName',
      },
      {
        title:'上报人',
        dataIndex: 'uploader',
        key: 'uploader',
      },
      {
        title:'上报时间',
        dataIndex: 'sbDate',
        key: 'sbDate',
      },
      {
        title:'是否上报',
        dataIndex: 'isSbVo.name',
        key: 'isSbVo.name',
      },
      {
        title: '是否逾期',
        dataIndex: 'isYqVo.name',
        key: 'isYqVo.name',
      },
      {
        title: "附件",
        dataIndex: 'fileCount',
        key: 'fileCount',
        render: (text, record) => {
          if(record.canView == 1){ //可编辑
            return (<a onClick={this.onAction.bind(this, record)} style={{ cursor: 'pointer' }}>{`查看(${text})`}</a>)
          }else{
            return(
              <a style={{opacity:"0.5"}}>{`查看(${text})`}</a>
            )
          }
        }
      },
    ];
    const columns1 = [
        {
          title:'周期数',
          dataIndex: 'sbQs',
          key: 'sbQs',
        },
        {
          title:'周期范围',
          dataIndex: 'zqStart',
          key: 'zqStart',
          render:(text,record)=>{
              return <span>{text+'-'+record.zqEnd}</span>
          }
        },
        {
          title:'单位名称',
          dataIndex: 'companyName',
          key: 'companyName',
        },
        {
          title:'上报人',
          dataIndex: 'uploader',
          key: 'uploader',
        },
        {
          title:'上报时间',
          dataIndex: 'sbDate',
          key: 'sbDate',
        },
        {
          title:'是否上报',
          dataIndex: 'isSbVo.name',
          key: 'isSbVo.name',
        },
        {
          title: '是否逾期',
          dataIndex: 'isYqVo.name',
          key: 'isYqVo.name',
        },
        {
          title: "附件",
          dataIndex: 'fileCount',
          key: 'fileCount',
          render: (text, record) => {
            if(record.canView == 1){ //可编辑
              return (<a onClick={this.onAction.bind(this, record)} style={{ cursor: 'pointer' }}>{`查看(${text})`}</a>)
            }else{
              return(
                <a style={{opacity:"0.5"}}>{`查看(${text})`}</a>
              )
            }
          }
        },
    ]
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
            this.getListData()
          })
        },
        onChange: (page, pageSize) => {
          this.setState({
            currentPageNum: page
          }, () => {
            this.getListData()
          })
        }
      }
      const dateFormat = 'YYYY-MM-DD';
      const {uploadTplPermission} = this.state
      console.log('uploadTplPermission',uploadTplPermission)
    return (
      <div className={style.main}>
          <div className={style.mainHeight}>
            <h3 className={style.listTitle}>上报详情</h3>
            <div className={style.rightTopTogs}>
              <div className={style.search}>
                    选择时间：
                    <RangePicker
                        style={{width:'100%'}}
                        format="YYYY-MM-DD"
                        placeholder={['开始时间', '结束时间']}
                        size="small"
                        onChange={this.changeTime}
                        style={{ width: 220 }}
                        value={
                            this.state.zqStart === undefined ||
                            this.state.zqEnd === undefined ||
                            this.state.zqStart === '' ||
                            this.state.zqEnd === ''
                            ? null
                            : [
                                moment(this.state.zqStart, dateFormat),
                                moment(this.state.zqEnd, dateFormat),
                            ]
                        }
                    />
              </div>
                <UploadTpl isBatch={true} file={this.file.bind(this)} txt={'上报'}  editFlag ={this.state.editFlag||this.props.permission.indexOf(uploadTplPermission)==-1} />
                {/* 显示附件 */}
                {this.state.isShowFileModal &&
                    <CheckModal
                        visible={this.state.isShowFileModal}
                        handleCancel={this.closeCheckModal.bind(this)}
                        record={this.state.checkRecord}
                        deleteFlag = {this.state.canEdit == false?'hide':''}
                        menuCode = {this.props.viewType == '0'?'SECURITY-DAYREPORTIN-DETAIL':'SECURITY-DAYREPORTOUT-DETAIL'}
                        delDoc = {this.delDoc}
                    />}
            </div>
            <div className={style.mainScorll}>
                    {/* <PageTable onRef={this.onRef}
                        rowSelection={true}
                        pagination={true}
                        useCheckBox={true}
                        onChangeCheckBox={this.getSelectedRowKeys}
                        getData={this.getListData}
                        scroll={{x:"100%",y:350}}
                        closeContentMenu={true}
                        columns={columns}
                        // getRowData={this.getInfo}
                        pageSize={10}
                        total={this.state.total}
                    /> */}
                    <Table 
                        className={style.table} 
                        rowKey={record => record.id} 
                        columns={this.props.viewType == '0'?columns:columns1} 
                        dataSource={this.state.data} 
                        name={this.props.name}
                        size='small'
                        pagination={pagination}
                        // rowSelection={rowSelection}
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
                        } 
                        />
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