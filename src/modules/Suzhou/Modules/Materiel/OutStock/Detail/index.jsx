import React, { Component } from 'react';
import { Table, notification, Modal,Input, Button, Popconfirm, Form } from 'antd';
import style from './style.less';
import Search from '../../../../components/Search';
import PublicButton from '../../../../../../components/public/TopTags/PublicButton';
import axios from '../../../../../../api/axios'
import {getOutstoreList,updateOutstoreRel,delOutstoreRel} from '../../../../api/suzhou-api'
import { connect } from 'react-redux';
const confirm = Modal.confirm;
import { baseURL } from '../../../../../../api/config';
import * as dataUtil from '../../../../../../utils/dataUtil';
import CheckModal from "../../../../components/CheckModal/"
import ListAdd from '../ListAdd';
//布局
import LabelToolbar from '@/components/public/Layout/Labels/Table/LabelToolbar'
import PageTable from '@/components/PublicTable'
import LabelTableLayout from '@/components/public/Layout/Labels/Table/LabelTableLayout'
import LabelTable from '@/components/public/Layout/Labels/Table/LabelTable'
import LabelTableItem from '@/components/public/Layout/Labels/Table/LabelTableItem'

const EditableContext = React.createContext();
const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);
class EditableCell extends React.Component {
  state = {
    editing: false,
  };
  componentDidMount(){
    // if(this.props.rightData.statusVo.code == '1'){
    //   this.setState({
    //     editing:true
    //   })
    // }
  }
  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  };

  save = e => {
    const { record, handleSave } = this.props;
    this.form.validateFields((error, values) => {
      if (error && error[e.currentTarget.id]) {
        return;
      }
      this.toggleEdit();
      handleSave({ ...record, ...values });
    });
  };

  renderCell = form => {
    this.form = form;
    const { children, dataIndex, record, title } = this.props;
    const { editing } = this.state;
    return editing ? (
      <Form.Item style={{ margin: 0 }}>
        {form.getFieldDecorator(dataIndex, {
          rules: [
            {
              required: true,
              message: `${title} is required.`,
            },
          ],
          initialValue: record[dataIndex],
        })(<Input ref={node => (this.input = node)} onPressEnter={this.save} onBlur={this.save} />)}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={this.toggleEdit}
      >
        {children}
      </div>
    );
  };

  render() {
    const {editable,dataIndex,title,record,index,handleSave,children,...restProps} = this.props;
    return (
      <td {...restProps}>
        {editable ? (
          <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
        ) : (
          children
        )}
      </td>
    );
  }
}
class Detail extends Component {
    constructor(props){
        super(props);
        this.state={
            total:'',
            pageSize:10,
            currentPageNum:1,
            data:[],
            editingFlag:false,
            selectedRowKeys:[],
        }
        
    }
    /**
     @method 父组件即可调用子组件方法
    @description 父组件即可调用子组件方法
    */
    onRef = (ref) => {
      this.table = ref
    }
    getList= ()=>{
        const {pageSize,currentPageNum} = this.state;
        const {projectId,sectionId,inspectionCode,outstoreCode} = this.props.rightData;
        axios.get(getOutstoreList(pageSize,currentPageNum,outstoreCode)).then(res=>{
            this.setState({
                data:res.data.data,
                total:res.data.total
            })
        })
    }
    componentDidMount(){
        this.props.rightData?this.getList():null;
        if(this.props.rightData.statusVo.code == '1'){
          this.setState({
            editingFlag:false
          })
        }else{
          this.setState({
            editingFlag:true
          })
        }
    }
    onClickHandle = (name) => {
      if (name == 'AddTopBtn') {
        this.setState({
          isShowModal: true,
          addOrModify: 'add',
          modalTitle: '获取',
        });
      }
      if (name == 'DeleteTopBtn') {
        let { selectedRowKeys, data,selectedRows } = this.state;
        if (selectedRowKeys.length > 0) {
          axios.deleted(delOutstoreRel, { data: selectedRowKeys }, true).then(res => {
            //删除
            const {total,selectedRows,pageSize,currentPageNum} = this.state
            let totalPageNum = Math.ceil((total - selectedRows.length) / pageSize);        //计算总页数
            let PageNum = totalPageNum >= currentPageNum ? currentPageNum : totalPageNum   //总页数大于等于 当前页面，当前页数不变 否则 为1
            this.setState({
                selectedRows:[],
                selectedRowKeys:[],
                currentPageNum:PageNum
            },()=>{
                this.getList();
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
    handleSave = row => {
      // const newData = [...this.state.data];
      // const index = newData.findIndex(item => row.key === item.key);
      // const item = newData[index];
      // newData.splice(index, 1, {
      //   ...item,
      //   ...row,
      // });
      // this.setState({ data: newData });
      axios.put(updateOutstoreRel,row,true).then(res=>{
        this.getList();
      })
    };
    //关闭权限弹框modal
    closePermissionModal = () => {
      this.setState({
        isShowModal: false
      });
    };
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
    render(){
      const components = {
        body: {
          row: EditableFormRow,
          cell: EditableCell,
        },
      };
      const columnsList = [
        {
          title: '物料编码',
          dataIndex: 'materialCode',
        },
        {
          title: '物料名称',
          dataIndex: 'classificationVo.materialName',
        },
        {
          title: '来源',
          dataIndex: 'classificationVo.source',
        },
        {
          title: '规格型号',
          dataIndex: 'classificationVo.specification',
        },
        {
          title: '计量单位',
          dataIndex: 'classificationVo.unit',
        },
        {
          title: '出库数量',
          dataIndex: 'quantity',
          editable: this.state.editingFlag,
          width: '30%',
          render:(text,record)=>{
            if(!text){
              return <span>0</span>
            }else{
              return <span>{text}</span>
            }
          }
        },
      ];
      const columns = columnsList.map(col => {
        if (!col.editable) {
          return col;
        }
        return {
          ...col,
          onCell: record => ({
            record,
            editable: col.editable,
            dataIndex: col.dataIndex,
            title: col.title,
            handleSave: this.handleSave,
          }),
        };
      });
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
            this.getList()
          })
        },
        onChange: (page, pageSize) => {
          this.setState({
            currentPageNum: page
          }, () => {
            this.getList()
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
        return(
          <div className={style.main}>
            <div className={style.mainHeight}>
              <h3 className={style.listTitle}>出库明细</h3>
              <div className={style.rightTopTogs}>
                {/* 获取 */}
                {props.permission.indexOf('OUTSTOCK_MATERIEL-EXPORT-LIST')!==-1 && (
                <PublicButton edit={this.props.rightData.statusVo &&this.props.rightData.statusVo.code == '0'?true:false} name={'获取'} title={'获取'} icon={'icon-add'} afterCallBack={this.onClickHandle.bind(this, 'AddTopBtn')} />)}
                  {/* 删除 */}
                  {props.permission.indexOf('OUTSTOCK_MATERIEL-EXPORT-LIST')!==-1 && (
                  <PublicButton edit={this.props.rightData.statusVo &&this.props.rightData.statusVo.code == '0'?true:false} title={"删除"} useModel={true} verifyCallBack={this.deleteVerifyCallBack} afterCallBack={this.onClickHandle.bind(this,"DeleteTopBtn")} icon={"icon-delete"} />)}
              </div>
              <div className={style.mainScorll}>
                <Table 
                  className={style.table} 
                  rowKey={record => record.id} 
                  columns={columns} 
                  dataSource={this.state.data} 
                  name={this.props.name}
                  size='small'
                  pagination={pagination}
                  rowSelection={rowSelection}
                  components={components}
                  rowClassName={() => 'editable-row'}
                  />
              </div>
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
                    getListData = {this.getList}
                  />}
            </div>
        </div>
        )
    }
}
export default Detail;
