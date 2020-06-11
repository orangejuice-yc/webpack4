
import React, {Component} from 'react'
import {Form} from 'antd'
import {connect} from 'react-redux'
import SubmitButton from "../../../../../../components/public/TopTags/SubmitButton"
import axios from '../../../../../../api/axios'
import * as dataUtil from "../../../../../../utils/dataUtil"
import ModelLayout from "../../../../../../components/public/Layout/Model/ModelLayout"
import ModelContent from "../../../../../../components/public/Layout/Model/ModelContent"
import ModelFooter from "../../../../../../components/public/Layout/Model/ModelFooter"
import PublicTable from "../../../../../../components/PublicTable"

// 导入数据接口
const getImportList = (projectId,taskId) => `api/szxm/station/detail/${projectId}/${taskId}/import/list`
// 导入接口
const importStations = (taskId,stationIds) => `api/szxm/station/detail/${taskId}/${stationIds}/import`

export class PfeStationImport extends Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentDidMount() {

    }

    getDataList = (callback) => {
      let {projectId,taskId} = this.props;
      axios.get(getImportList(projectId,taskId)).then(res => {
        callback(res.data.data||[])
      })
    }

    handleOk = () => {

      const {selectedRowKeys} = this.state
      if (selectedRowKeys.length == 0) {
        dataUtil.message("请勾选数据进行操作！")
        return
      }
      let {taskId} = this.props;
      let url = dataUtil.spliceUrlParams(importStations(taskId,selectedRowKeys), {});
      axios.post(url, {}, true, null, true).then(res => {
        this.props.refreshData();
        this.props.handleCancel()
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

    render() {
      const columns = [
        {
            title: "名称", //
            dataIndex: "name",
            key: "name",
            width: "50%"
        },
        {
            title: "编码", //
            dataIndex: "code",
            key: "code",
            width: "35%"
        },
        {
          title: "类型", //
          dataIndex: "stationType",
          key: "stationType",
          width: "15%",
          render : (text, record) => {
            return (text ? text.name : null)
          }
        }
      ]

        return (
            <ModelLayout width="850px" title = {"分配站点明细"} handleCancel = {this.props.handleCancel }>
                <ModelFooter>
                    {/* 保存 */}
                    <SubmitButton key="2" type="primary" onClick={this.handleOk} content = "分配" />
                </ModelFooter>
                <ModelContent>
                    <PublicTable
                        pagination={false}
                        getData={this.getDataList}
                        columns={columns}
                        rowSelection={true}
                        onChangeCheckBox={this.getSelectedRowKeys}
                        useCheckBox={true}
                        istile={true}
						getRowData = {() => {}}
                    />
                </ModelContent>
            </ModelLayout>
        )
    }
}

const PfeStationImport_ = Form.create()(PfeStationImport);
export default connect(state => ({
    currentLocale: state.localeProviderData
}))(PfeStationImport_);


