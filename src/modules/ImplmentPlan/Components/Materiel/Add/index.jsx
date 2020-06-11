import React, { Component } from 'react'
import style from './style.less'
import { Modal, Table, Form} from 'antd';
import Search from '../../../../../components/public/Search'
import '../../../../../asserts/antd-custom.less'
import axios from "../../../../../api/axios"
import {
    addRelationMateriel
} from "../../../../../api/suzhou-api"
import {
    inventoryListNoPage
} from "../../../../../modules/Suzhou/api/suzhou-api"
import * as dataUtil from "../../../../../utils/dataUtil";
import SubmitButton from "../../../../../components/public/TopTags/SubmitButton"
export class MaterielAdd extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initDone: false,
            columns: [],
            data: [],
            initData: [],
            currentData: []
        }
    }

    handleSubmit = () => {
        const { activeIndex } = this.state
        if(!activeIndex || activeIndex.length == 0 ){
            notification.warning({
                placement: 'bottomRight',
                bottom: 50,
                duration: 2,
                message: '未勾选数据',
                description: '请勾选数据再操作'
            });
            return;
        }
        axios.put(addRelationMateriel,{projectId:this.props.projectId,taskId:this.props.rightData.taskId,fbId:this.props.rightData.id,ids:[...activeIndex]}, true).then(res => {
             this.props.refreshData();
             this.props.handleCancel();
        })
    }

    setClassName = (record, index) => {
        //判断索引相等时添加行的高亮样式
        return record.id === this.state.activeIndex ? 'tableActivty' : "";
    }

    componentDidMount() {
        let params = {projectId: this.props.projectId,sectionIds:this.props.sectionId};
        axios.get(inventoryListNoPage,{params: params}).then(res => {
            const { data } = res.data;
            this.setState({
                data,
                initData : data
            })
        })
    }


    search = (value) => {
      const {initData } = this.state;
      let newData = dataUtil.search(initData,[{"key":"classificationVo.materialName|materialCode","value":value}],true);
      this.setState({data:newData});
    }

    render() {
        const columns = [
            {
                title: '物料编码',
                dataIndex: 'materialCode',
                width:'230px',
            },
            {
                title: '物料名称',
                dataIndex: 'classificationVo.materialName',
                width:'140px'
            },
            {
                title: '计量单位',
                dataIndex: 'classificationVo.unit',
                width:'100px',
            },
            {
                title: '库存量',
                dataIndex: 'storageQuantity',
                width:'100px',
            },
            {
                title: '本周到货量',
                dataIndex: 'thisWeekArrival',
                width:'100px',
            }
        ]
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    activeIndex: selectedRowKeys,
                    selectData: selectedRows
                })
            },
            getCheckboxProps: (record) => {
                return ({
                    disabled: false
                })
            }
        };
        return (
            <Modal className={style.main} width="850px" centered={true}
                title="关联" visible={true} onCancel={this.props.handleCancel} footer={
                    <div className="modalbtn">
                        <SubmitButton key="back" onClick={this.props.handleCancel} content="取消" />
                        <SubmitButton key="3" type="primary" onClick={this.handleSubmit} content="确定" />
                    </div>
                }>
                <div className={style.tableMain}>
                    <div className={style.search}>
                      <Search search={this.search.bind(this)} />
                    </div>
                    {<Table
                        rowKey={record => record.id}
                        defaultExpandAllRows={true}
                        pagination={false}
                        name={this.props.name}
                        columns={columns}
                        rowSelection={rowSelection}
                        dataSource={this.state.data}
                        rowClassName={this.setClassName}
                        onRow={() => {
                            return {
                                onClick: (event) => {

                                }
                            }
                        }
                        }
                    />}
                </div>
            </Modal>

        )
    }
}

const MaterielAdds = Form.create()(MaterielAdd)

export default MaterielAdds
