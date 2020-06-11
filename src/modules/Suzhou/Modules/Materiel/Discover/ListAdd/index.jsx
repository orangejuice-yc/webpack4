import React, { Component } from 'react';
import intl from 'react-intl-universal';
import style from './style.less'
import { Table, notification, Modal ,Button} from 'antd';
import Search from '../../../../components/Search';
import PublicButton from '../../../../../../components/public/TopTags/PublicButton';
import axios from '../../../../../../api/axios'
import * as dataUtil from "../../../../../../utils/dataUtil"
import {classificationListNoPage,addInspectionRel} from '../../../../api/suzhou-api'
import { connect } from 'react-redux';
const confirm = Modal.confirm;

//人员
class Permission extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys:[],
      selectedRows:[],  
    }
  }
  //请求接口函数
  getListData = () => {
    const {inspectionTypeVo,projectId,sectionId,inspectionCode} = this.props.rightData;
    const source = inspectionTypeVo && inspectionTypeVo.code == 1 ?inspectionTypeVo.code:null;
    const needThirdInspection = this.props.rightData.needThirdInspectionVo.code;
    axios.get(classificationListNoPage,{params: {projectId,source,needThirdInspection,inspectionCode,status:'APPROVED',sectionIds:sectionId}}).then(res => {
      this.setState({
        data: res.data.data,
        initData:res.data.data,
      })
    })
  }
  componentDidMount(){
    this.getListData()
  }
  //搜索
  search = (val) => {
    this.setState({
      name:val
    })
    const {initData} = this.state;
    let newData = dataUtil.search(initData,[{"key":"materialCode|materialName","value":val}],true);
    this.setState({data:newData});
  }
  handleCancel = (e) => {
    this.props.handleCancel();
  };
  handleSubmit = (val, e) => {
    if (this.state.selectedRowKeys.length) {
      const dataArr = [];
      this.state.selectedRows.forEach((currentValue, index, arr)=>{
        let obj = {
            sectionId:currentValue.sectionId,
            projectId:currentValue.projectId,
            inspectionCode:this.props.rightData.inspectionCode,
            materialCode:currentValue.materialCode
        };
        dataArr.push(obj);
      })
      axios.post(addInspectionRel,dataArr,true).then(res=>{
        if(res.data.status == 200){
          this.props.handleCancel();
          this.props.getListData(this.props.rightData.inspectionCode);
        }
      })
    }else{
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

  render() {
    const { intl } = this.props.currentLocale;
    const columns = [
      {
        title:'物料编码',
        dataIndex: 'materialCode',
        key: 'materialCode',
        width:'35%'
      },
      {
        title:'物料名称',
        dataIndex: 'materialName',
        key: 'materialName',
        width:'35%'
      },
      {
        title:'来源',
        dataIndex: 'source',
        key: 'source',
        width:'10%'
      },
      {
        title:'是否需第三方检测',
        dataIndex: 'needThirdInspectionVo.name',
        key: 'needThirdInspectionVo.name',
        width:'20%'
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
    return (
      <div className={style.main}>
        <div>
        <Modal title={'获取检测清单'} visible={this.props.visible}
            onCancel={this.handleCancel}
            width="800px"
            footer={<div className="modalbtn">
              <Button key={1} onClick={this.handleCancel}>取消</Button>
              <Button key={2} onClick={this.handleSubmit.bind(this, 'save')} type="primary">确定</Button>
            </div>}>
              <div className={style.search} style={{'marginBottom':'10px'}}>
                <Search search={this.search} placeholder={'编码/名称'} />
              </div>
              <Table className={style.table} rowKey={record => record.id} columns={columns} dataSource={this.state.data}
                name={this.props.name}
                size='small'
                pagination={false}
                rowSelection={rowSelection}
                onRow={(record, index) => {
                  return {
                    onDoubleClick: (event) => {
                      event.currentTarget.getElementsByClassName("ant-checkbox-wrapper")[0].click();
                    }
                  };
                }
                } />
          </Modal>
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