import React, { Component } from 'react'
import style from './style.less'
import { Table, Form } from 'antd';
// import Search from '../../../../../components/Search'
import { connect } from 'react-redux'
import '../../../../../../../asserts/antd-custom.less'
import axios from "../../../../../../../api/axios"
import * as WorkFolw from '../../../../../../Components/Workflow/Start';
import * as dataUtil from "../../../../../../../utils/dataUtil";
import MyIcon from "../../../../../../../components/public/TopTags/MyIcon";
import {getReleaseMeetingList } from "../../../../../../../api/api";
import {keyPointAcceptListNoPage} from '../../../../../api/suzhou-api';
import Search from '../../../../../components/Search';
import PageTable from '@/components/PublicTable'
class PlanPreparedRelease extends Component {

    constructor(props) {
        super(props);
        this.state = {
            initDone: false,
            step: 1,
            columns: [],
            data: [],
            info: {},
            selectedRowKeys: [],
            currentData: [],
            activeIndex: []
        }
    }
    onRef = (ref) => {
      this.table = ref
    }
    initDatas =(callBack)=>{
      const {projectId,sectionId,keyPointCategory,accessoryStatus,acceptTimeFrom,acceptTimeTo} = this.props;
      if(this.state.newData){
        callBack(this.state.newData)
        this.setState({newData:null})
        return
      }
      axios.get(keyPointAcceptListNoPage,{params:{projectId,sectionIds:sectionId,status:'INIT',keyPointCategory,accessoryStatus,acceptTimeFrom,acceptTimeTo}}).then(res=>{
        if(res.data.data){
          callBack(res.data.data)
          this.setState({
            initData:res.data.data
          })
        }else{
          callBack([])
        }
        
      })
    }
    getInfo = (record) => {
        this.setState({
            activeIndex: record.id
        })
    }
    setClassName = (record) => {
        //判断索引相等时添加行的高亮样式
        return record.id === this.state.activeIndex ? 'tableActivty' : "";
    }

    // componentDidMount() {
    //    // 初始化数据
    //    this.initDatas();
    // }
    // 查询
    search = (text) => {
        const {initData} = this.state;
        let newData = dataUtil.search(initData,[{"key":"projectBuildName","value":text}],true);
        this.setState({
          newData
        },()=>{
          this.table.getData();
        });
    }
      /**
      * 获取复选框 选中项、选中行数据
      * @method updateSuccess
      * @param {string} selectedRowKeys 复选框选中项
      * @param {string} selectedRows  行数据
      */
     getSelectedRowKeys = (selectedRowKeys, selectedRows) => {
      this.setState({
          selectedRows,
          selectedRowKeys
      },()=>{
        let selectedItems = new Array();
            if(this.state.selectedRows){
              for(let i = 0, len = this.state.selectedRows.length; i < len; i++){
                let item =   this.state.selectedRows[i];
                selectedItems.push({"bizId" : item.id, "bizType":this.props.bizType,origData:item});
              }
            }
            this.props.getSubmitData(selectedItems);
      })
  }
    render() {
        const columns = [
          {
              title: '单位工程名称',
              dataIndex: 'projectBuildName',
          },
          {
              title: '关键节点类别',
              dataIndex: 'keyPointCategoryVo.name',
          },
          {
              title: '项目名称',
              dataIndex: 'projectName',
          },
          {
              title: '标段名称',
              dataIndex: 'sectionName',
          },
          {
              title: '施工单位',
              dataIndex: 'sgdw',
          },
          {
              title: '监理单位',
              dataIndex: 'jldw',
          },
          {
              title: '验收时间',
              dataIndex: 'acceptTime',
          },
        ];
        let display = this.props.visible ? "" : "none";
        return (
            <div style = {{display:display}}>
              <div className={style.tableMain}>
                <div className={style.search} style={{'marginTop':'10px','marginBottom':'10px'}}>
                  <Search search = {this.search } placeholder={'单位工程名称'} />
                </div>
                <PageTable onRef={this.onRef}
                            rowSelection={true}
                            pagination={false}
                            useCheckBox={true}
                            onChangeCheckBox={this.getSelectedRowKeys}
                            getData={this.initDatas}
                            scroll={{x:"100%",y:350}}
                            closeContentMenu={true}
                            columns={columns}
                            getRowData={this.getInfo}

                        />
                {/* <Table rowKey={record => record.id}
                       defaultExpandAllRows={true}
                       pagination={false}
                       name={this.props.name}
                       columns={columns}
                       rowSelection={rowSelection}
                       dataSource={this.state.data}
                       size="small"
                       onRow={(record, index) => {
                           return {
                               onClick: () => {
                                  this.getInfo(record, index)
                               },
                               onDoubleClick: (event) => {
                                  event.currentTarget.getElementsByClassName("ant-checkbox-wrapper")[0].click();
                               }
                           }
                         }
                       }
                /> */}
              </div>
            </div>
        )
    }
}

const PlanPreparedReleases = Form.create()(PlanPreparedRelease)

const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};

const  DelvApporal = connect(mapStateToProps, null)(PlanPreparedReleases);
export default WorkFolw.StartWorkFlow(DelvApporal);
