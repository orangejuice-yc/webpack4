import React, { Component } from 'react'
import style from './style.less'
import { Modal, Form} from 'antd';
import '../../../../asserts/antd-custom.less'
import axios from "../../../../api/axios"
import {
  queryRelationMateriel,
  deleteRelationMaterielByIds,
  updateRelationMateriel
} from "../../../../api/suzhou-api"
import {
    updateInventory
} from "../../../../modules/Suzhou/api/suzhou-api"
import * as dataUtil from "../../../../utils/dataUtil";
import PublicTable from '../../../../components/PublicTable'
import PublicButton from '../../../../components/public/TopTags/PublicButton';
import MaterielAdd from '../Materiel/Add' //新增物料关联
export class PlanMaterielReaction extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initDone: false,
            columns: [],
            data: [],
            initData: [],
            currentData: [],
            materielAddModalVisible:false
        }
    }

    //注册 父组件即可调用子组件方法
    onRef = (ref) => {
        this.table = ref
    }

    refreshData = () =>{
        this.table.getData();
    }

    componentDidMount() {
    }

    getData = (callBack) => {
        axios.get(queryRelationMateriel(this.props.rightData.id)).then(res => {
            callBack(res.data.data || []);
            /*const { data } = res.data;
            this.setState({
                data,
                initData : data
            })*/
        })
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

    //显示
    showMaterielAddModal = () => {
      this.setState({
        materielAddModalVisible: true
      })
    }
    //关闭
    handleMaterielAddModal = () => {
      this.setState({
        materielAddModalVisible: false
      })
    }

    deletePlanMaterielReaction = () => {
        let { selectedRowKeys,selectedRows } = this.state;
        if(!selectedRowKeys || selectedRowKeys.length == 0){
            dataUtil.message("请选择数据操作");
            return false;
        }
        let ids = [];
        for (let f = selectedRows.length - 1; f >= 0; f--) {
            ids.push(selectedRows[f].relationId);
        }
        let url = dataUtil.spliceUrlParams(deleteRelationMaterielByIds(ids), {});
        axios.deleted(url, {}, true).then(res => {
            this.refreshData();
        })
    }

    deleteVerifyCallBack = () => {
        let { selectedRowKeys } = this.state;
        if(!selectedRowKeys || selectedRowKeys.length == 0){
            dataUtil.message("请选择数据操作");
            return false;
        }
        return true;
    }


    search = (value) => {
      const {initData } = this.state;
      let newData = dataUtil.search(initData,[{"key":"classificationVo.materialName|materialCode","value":value}],true);
      this.setState({data:newData});
    }

    handleSave = (record, type, value) => {
        //this.table.updateData(record);
        let updateTime = this.props.rightData.deadline;// deadline/截至日期;reportingTime/报告时间
        let thisWeekConsume = record.thisWeekConsume;
        thisWeekConsume = thisWeekConsume ? thisWeekConsume : 0;
        let nextWeekPlanQuantity = record.nextWeekPlanQuantity;
        nextWeekPlanQuantity = nextWeekPlanQuantity ? nextWeekPlanQuantity : 0;
        //updateInventory 
		axios.put(updateRelationMateriel, { wlgltzId: record.id, id:record.relationId, updateTime: updateTime, thisWeekConsume: thisWeekConsume,nextWeekPlanQuantity: nextWeekPlanQuantity}, false, null, true).then(res => {
			this.setState({record},()=>{
				this.table.updateData(record);
			})
        })
    }

    render() {
        let handleSave = this.handleSave;
        let edit = this.props.planMaterielReactionModalButtonVisible && this.props.editAuth ? true : false;
        const columns = [
            {
                title: '物料编码',
                dataIndex: 'materialCode',
                key: "materialCode",
                width:'14%',
            },
            {
                title: '物料名称',
                dataIndex: 'classificationVo.materialName',
                key: 'classificationVo.materialName',
                width:'14%'
            },
            {
                title: '库存量',
                dataIndex: 'storageQuantity',
                key: 'storageQuantity',
                width:'12%',
            },
            {
                title: '本周到货量',
                dataIndex: 'thisWeekArrival',
                key: 'thisWeekArrival',
                width:'14%',
            },
            {
                title: '本周消耗量',
                dataIndex: 'thisWeekConsume',
                key: 'thisWeekConsume',
                width:'14%',
                edit : {editable : edit, formType : 'InputNumber', handleSave:handleSave}
            },
            {
                title: '下周计划量',
                dataIndex: 'nextWeekPlanQuantity',
                key: 'nextWeekPlanQuantity',
                width:'14%',
                edit : {editable : edit, formType : 'InputNumber', handleSave:handleSave}
            },
            {
                title: '计量单位',
                dataIndex: 'classificationVo.unit',
                key: 'classificationVo.unit',
                width:'12%',
            }
        ]
        return (
            <Modal className={style.main} width="850px" centered={true}
                title="关联物料" visible={true} onCancel={this.props.handleCancel} footer={null}>
                <div className={style.tableMain}>
                    {this.props.planMaterielReactionModalButtonVisible && <PublicButton name={'关联'} title={'关联'} edit={this.props.editAuth} icon={'icon-fenpei'}
                      afterCallBack={this.showMaterielAddModal} />}
                    {/*删除*/}
                    {this.props.planMaterielReactionModalButtonVisible && <PublicButton title={"删除"} edit={this.props.editAuth} useModel={true} verifyCallBack={this.deleteVerifyCallBack}
                                  afterCallBack={this.deletePlanMaterielReaction} icon={"icon-delete"} />}
                    {
                       <PublicTable  onRef={this.onRef}
                       getData={this.getData}
                       columns={columns}
                       rowClassName={() => 'editable-row'}
                       rowSelection={true}
                       onChangeCheckBox={this.getSelectedRowKeys}
                       useCheckBox={true}
                       pagination = {false}
                       getRowData = {() => {}}
                        />
                    }
                    {/* 分配 */}
                    {this.state.materielAddModalVisible && <MaterielAdd
                    handleCancel={this.handleMaterielAddModal}
                    sectionId={this.props.sectionId}
                    rightData={this.props.rightData}
                    projectId={this.props.projectId}
                    refreshData={this.refreshData}
                    editAuth={this.props.editAuth}
                    />}
                </div>
            </Modal>

        )
    }
}

const PlanMaterielReactions = Form.create()(PlanMaterielReaction)

export default PlanMaterielReactions
