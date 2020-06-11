
import React, { Component } from 'react'
import { Select, InputNumber,Input, Table, Button, Popconfirm, Form  } from 'antd'
import { connect } from 'react-redux'
import axios from '../../../../api/axios'
import * as dataUtil from '../../../../utils/dataUtil'
import PublicTable from '../../../../components/PublicTable'
import LabelTableLayout from "../../../../components/public/Layout/Labels/Table/LabelTableLayout";
import LabelToolbar from "../../../../components/public/Layout/Labels/Table/LabelToolbar";
import LabelTable from "../../../../components/public/Layout/Labels/Table/LabelTable";
import PublicButton from "../../../../components/public/TopTags/PublicButton";
import Import from "./TopTags/Import";
import './style.less'
const getData = (taskId) => `api/szxm/station/detail/${taskId}/list`
const del = ( ids ) => `api/szxm/station/detail/${ids}/delete`
const update = `api/szxm/station/detail/update`
import {getdictTree} from '../../../../api/api';

export class PfeStationDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addVisible : false,
            searchData : {}
        }
    }

    //注册 父组件即可调用子组件方法
    onRef = (ref) => {
        this.table = ref
    }

    componentDidMount() {
      this.loadUnitData();
    }
    loadUnitData = () =>{
      axios.get(getdictTree("comm.unit")).then(res => {
        this.setState({unitSelectList: res.data.data || []});
      });
    }
    /**
     * 加载分页数据集合
     */
    getStationDetailDataList = (callBack) => {

        let {searchData} = this.state;
        let {rightData} = this.props;
        let id = rightData && rightData.length > 0 ? rightData[0].id : 0;
        let url = dataUtil.spliceUrlParams(getData(id), searchData || {});

        axios.get(url).then(res => {
            callBack(res.data.data || []);
        });
    }
    /**
     * 搜索
     *
     * @param text
     */
    search = (text) => {
        this.setState({searchData : text}, () => {
            this.table.getData();
        });
    }

    refreshData = () =>{
        this.table.getData();
    }

    /**
     * 删除验证
     * @returns {boolean}
     */
    delVerify = () =>{
        let { selectedRowKeys } = this.state;
        if(!selectedRowKeys || selectedRowKeys.length == 0){
            dataUtil.message("请选择数据操作");
            return false;
        }
        return true;
    }

    /**
     *  删除数据
     *
     */
    delData = () => {
        let { selectedRowKeys } = this.state;
        if(!selectedRowKeys || selectedRowKeys.length == 0){
            dataUtil.message("请选择数据操作");
            return false;
        }
        let url = dataUtil.spliceUrlParams(del(dataUtil.Arr().toString(selectedRowKeys,",")), {});
        axios.deleted(url, {}, true).then(res => {
            this.refreshData();
        })
    }

    /**
     * 修改数据
     * @param val
     */
    updateData = (val) => {
        this.table.updateData(val);
    }

    // 显示表单弹窗
    showAddForm = () => {
        this.setState({addVisible : true});
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
        })
    }
	
    handleSave = (record, type, value) => {
		axios.put(update, record, true, null, true).then(res => {
			this.setState({record},()=>{
				this.table.updateData(record);
			})
        })
    }
    handleSave2 = (record, type, e) => {
        record[type] = e.currentTarget.value
        this.setState({ record })
        this.table.update(record, record)
    }

    edit = (record, type) => {
        this.setState({
            editIndex: record.id,
            edittype: type
        }, () => {
            this.input.focus();
        })
    }
    disableEdit = (e) => {
      this.setState({
        editIndex: null,
        edittype: null
      }, () => {
        axios.put(update, this.state.record, true, null, true).then(res => {

        })
      })
    }

	
    render() {
        let {rightData} = this.props;
        let data = rightData && rightData.length > 0 ? rightData[0] : {};
        let {id,custom07}= data;
		let handleSave = this.handleSave;
        const columns = [
            {
                title: "站点或区间名称", //计划名称
                dataIndex: "station",
                key: "station",
                width: 200,
                render : (text, record) => {
                    return (text ? text.name : null)
                }
            },
            {
                title: "设计总量", //计划名称
                dataIndex: "designTotal",
                key: "designTotal",
                width: 100,
				edit : {editable :this.props.menuCode == "ST-IMPLMENT-M-TASK" && this.props.editAuth, formType : 'InputNumber', handleSave:handleSave}
            },
            {
                title: "计划完成量", //计划名称
                dataIndex: "planComplete",
                key: "planComplete",
                width: 100,
				edit : {editable : this.props.menuCode == "ST-IMPLMENT-M-TASK" && this.props.editAuth, formType : 'InputNumber', handleSave:handleSave}
            },
            {
                title: "实际完成量", //计划名称
                dataIndex: "actCompleteTotal",
                key: "actCompleteTotal",
                width: 100,
            },
            {
                title: "完成百分比", //完成百分比
                dataIndex: "",
                key: "",
                width: 100,
                render : (text, record) => {
                    let actCompleteTotal = record.actCompleteTotal;
                    let planComplete = record.planComplete;
                    let designTotal = record.designTotal;
                    let menuCode = this.props.menuCode;
                    return actCompleteTotal > 0 && designTotal >0 ? Math.round(((actCompleteTotal/designTotal)*10000))/100 +"%" : '0%';
                    // return "ST-IMPLMENT-M-TASK" == menuCode ? (actCompleteTotal > 0 && planComplete >0 ? Math.round(((actCompleteTotal/planComplete)*10000))/100 +"%" : '0%') :
                    // (actCompleteTotal > 0 && designTotal >0 ? Math.round(((actCompleteTotal/designTotal)*10000))/100 +"%" : '0%');
                }
            },
            {
                title: "计量单位", //计划名称
                dataIndex: "unit",
                key: "unit",
                width: 100,
                render : (text, record) => {
                    return custom07;
                }
            },
            {
                title: "说明", //计划名称
                dataIndex: "remark",
                key: "remark",
                width: 300,
				edit : {editable : this.props.menuCode == "ST-IMPLMENT-M-TASK" && this.props.editAuth, formType : 'Input', handleSave:handleSave}
              }
        ]
        return (
            <span>
              <LabelTableLayout title = {this.props.title} menuCode = {this.props.menuCode}>
                <LabelToolbar>
                  {/*新增*/}
                  {this.props.menuCode == "ST-IMPLMENT-M-TASK" && <PublicButton title={'增加'}
                                icon={'icon-add'}
								edit = {this.props.editAuth}
                                afterCallBack={this.showAddForm.bind(this)}
                  />}
                  {/*删除*/}
                  {this.props.menuCode == "ST-IMPLMENT-M-TASK" && <PublicButton title={"删除"}
                                useModel={true}
								edit = {this.props.editAuth}
                                verifyCallBack = {this.delVerify}
                                afterCallBack={this.delData}
                                icon={"icon-delete"}
                  />}
                </LabelToolbar>
                <LabelTable labelWidth = {this.props.labelWidth } contentMinWidth = {1000}>
                  <PublicTable  onRef={this.onRef}
                                getData={this.getStationDetailDataList}
                                columns={columns}
								rowClassName={() => 'editable-row'}
                                rowSelection={true}
                                onChangeCheckBox={this.getSelectedRowKeys}
                                useCheckBox={true}
                                pagination = {false}
                                getRowData = {() => {}}
                  />
                </LabelTable>
                {/* 新增 */}
                {
                  this.state.addVisible &&
                  (
                    <Import addData={this.addData}
                             projectId = {this.props.projectId}
                             refreshData = {this.refreshData}
                             taskId = {id}
                             handleCancel = {() => { this.setState({addVisible : false}) }}
                             rightData={this.state.rightData} />
                  )
                }

              </LabelTableLayout>
            </span>
        )
    }
}

export default connect(state => ({
    currentLocale: state.localeProviderData
}))(PfeStationDetail);


