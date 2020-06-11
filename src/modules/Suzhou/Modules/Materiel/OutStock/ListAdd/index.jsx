import React, { Component } from 'react';
import intl from 'react-intl-universal';
import style from './style.less'
import { Table, notification, Modal ,Button} from 'antd';
import Search from '../../../../components/Search';
import PublicButton from '../../../../../../components/public/TopTags/PublicButton';
import axios from '../../../../../../api/axios'
import * as dataUtil from "../../../../../../utils/dataUtil"
import {inventoryList,addOutstoreRel,inventoryListNoPage} from '../../../../api/suzhou-api'
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
    const {projectId,sectionId} = this.props.rightData;
    axios.get(inventoryListNoPage,{params: {projectId,sectionIds:sectionId}}).then(res => {
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
    initData.map((item,i)=>{
      if(!item.classificationVo.materialName){

      }else{
        item.myMaterialName = item.classificationVo.materialName
      }
    })
    let newData = dataUtil.search(initData,[{"key":"materialCode|myMaterialName","value":val}],true);
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
            outstoreCode:this.props.rightData.outstoreCode,
            materialCode:currentValue.materialCode
        };
        dataArr.push(obj);
      })
      axios.post(addOutstoreRel,dataArr,true).then(res=>{
        if(res.data.status == 200){
          this.props.handleCancel();
          this.props.getListData();
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
      },
      {
        title:'物料名称',
        dataIndex: 'classificationVo.materialName',
      },
      {
        title:'来源',
        dataIndex: 'classificationVo.source',
      },
      {
        title:'是否需第三方检测',
        dataIndex: 'classificationVo.needThirdInspectionVo.name',
        width:'140px'
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
        <Modal title={'获取出库清单'} visible={this.props.visible}
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