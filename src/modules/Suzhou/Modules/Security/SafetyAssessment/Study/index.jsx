import React, { Component } from 'react';
import { Table, Input, Button, Popconfirm, Form ,InputNumber,notification} from 'antd';
import style from './style.less';
import PublicButton from '@/components/public/TopTags/PublicButton';
import AddModal from './AddModal';
import notificationTip from '@/utils/notificationTip';
import {
  querySecurityExaminationDetailList,
  updateSecurityExaminationDetail,
  updateConfirm,
  getPermission
} from '@/modules/Suzhou/api/suzhou-api';
import axios from '@/api/axios';

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
    // permission:[]
  };
  componentDidMount() {
    // let menuCode = 'SECURITY-SAFETYASSESSMENT'
    // axios.get(getPermission(menuCode)).then((res)=>{
    //   let permission = []
    //   res.data.data.map((item,index)=>{
    //     permission.push(item.code)
    //   })
    //   this.setState({
    //     permission
    //   })
    // })
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
      const { score, learnTime, trainId, id, workerId } = { ...record, ...values };
      if(score < record.total || score == record.total){
        handleSave({ score, learnTime, trainId, id, workerId });
      }else{
        notificationTip('提示','实际得分不应大于应得分数')
        return false
      }
    });
  };

  renderCell = form => {
    this.form = form;
    const { children, dataIndex, record, title } = this.props;
    const { editing } = this.state;
    //
    return 'true' ? (
      <Form.Item style={{ margin: 0 }}>
        {form.getFieldDecorator(dataIndex, {
          rules: [
            {
              required: true,
              message: `请输入`,
            },
          ],
          initialValue: record[dataIndex],
        })(
          <Input
            ref={node => (this.input = node)}
            // type="number"
            onPressEnter={this.save}
            onBlur={this.save}
            disabled={this.props.auth && this.props.statusVo.code == 'INIT' || (this.props.auth &&this.props.statusVo.code == 'REJECT' && this.props.taskFlag)?(this.props.permission.indexOf('SAFETYASSESSMENT_SAFETYASSESSMENTKPI')!==-1?false:true):true}
            min={0}
            max={this.props.record.total}
          />
        )}
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
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      children,
      ...restProps
    } = this.props;
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

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: '考核项',
        dataIndex: 'title',
      },
      {
        title: '应得分数',
        dataIndex: 'total',
        width: '100px',
      },

      {
        title: '实际得分',
        dataIndex: 'score',
        width: '100px',
        editable: true,
      },
    ];

    this.state = {
      dataSource: [],
      selectedRowKeys: [],
      total: 0,
      // permission:[]
      sum:'',//总分
      lack:'',//扣减分数
      real:'',//实际得分
    };
  }

  handleSave = row => {
    // const { score, learnTime ,learnOk} = row;
    // axios
    //   .put(
    //     updateSecurityExaminationDetail,
    //     {
    //       ...row,
    //       aqkhId: this.props.rightData.id,
    //     },
    //     true
    //   )
    //   .then(res => {
    //     const { status, data } = res.data;
    //     if (status === 200) {
    //       const newData = [...this.state.dataSource];
    //       const index = newData.findIndex(item => row.id === item.id);
    //       const item = newData[index];
    //       newData.splice(index, 1, {
    //         ...item,
    //         ...data,
    //       });
    //       this.setState({ dataSource: newData });
    //       this.props.handleAddData();
    //     }
    //   });
         const newData = [...this.state.dataSource];
          const index = newData.findIndex(item => row.id === item.id);
          const item = newData[index];
          newData.splice(index, 1, {
            ...item,
            ...row,
          });
          const sum = this.getSum(0,newData);
          const real = this.getReal(0,newData);
          const lack = sum-real;
          this.setState({ dataSource: newData ,sum,real,lack});
  };
  handleRequset = () => {
    axios.get(querySecurityExaminationDetailList(this.props.rightData.id)).then(res => {
      const { data } = res.data;
      const sum = this.getSum(0,data);
      const real = this.getReal(0,data);
      const lack = sum-real;
      this.setState({ dataSource: data,sum,real,lack });
    });
  };
  getSum = (newData,arr)=>{
    if(arr.length > 0){
      arr.map(item=>{
        newData += parseInt(item.total)
      })
    }
    return newData;
  }
  getReal = (newData,arr)=>{
    if(arr.length > 0){
      arr.map(item=>{
        newData +=parseInt(item.score) 
      })
    }
    return newData;
  }
  handleAddUpdateTabel = data => {
    this.setState({
      dataSource: [...this.state.dataSource, ...data],
      total: this.state.total + 1,
    });
  };
  handleDelete = () => {
    
    // if (this.state.selectedRowKeys.length > 0) {
    //   axios.deleted(delTrainStaff(), { data: this.state.selectedRowKeys }, true).then(res => {
    //     const { status } = res.data;
    //     if (status === 200) {
    //       this.setState(({ dataSource, selectedRowKeys, total }) => ({
    //         dataSource: dataSource.filter(item => !selectedRowKeys.includes(item.id)),
    //         selectedRowKeys: [],
    //         total: total - selectedRowKeys.length,
    //       }));
    //     }
    //   });
    // }
    const {dataSource,real,lack} =  this.state;
    const obj={...this.props.rightData,actTotal:real,reduTotal:lack}
    axios
    .put(updateConfirm + `?aqkhId=` + this.props.rightData.id,dataSource )
    .then(() => {
      notification.success(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 2,
          message: '操作提醒',
          description:'操作成功！'
        }
      )
      this.props.updateSuccess(obj)
    });
  };
  hasRecord = () => {
    if (!this.state.selectedRowKeys.length > 0) {
      notificationTip('操作提醒', '未选中数据');
      return false;
    } else {
      return true;
    }
  };
  componentDidMount() {
    this.handleRequset();
    // let menuCode = 'SECURITY-SAFETYASSESSMENT'
    // axios.get(getPermission(menuCode)).then((res)=>{
    //   let permission = []
    //   res.data.data.map((item,index)=>{
    //     permission.push(item.code)
    //   })
    //   this.setState({
    //     permission
    //   })
    // })
  }
  render() {
    const { dataSource } = this.state;
    const components = {
      body: {
        row: EditableFormRow,
        cell: props => <EditableCell statusVo={this.props.rightData.statusVo} taskFlag={this.props.taskFlag} {...props} permission={this.props.permission} auth={this.props.auth} />,
      },
    };
    const columns = this.columns.map(col => {
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
    return (
      <div className={style.container}>
        <h3 className={style.h3}>考核表</h3>
        <div className={style.tools} style={{ marginBottom: 10 }}>
          {/* {this.props.auth && (
            <AddModal
              rightData={this.props.rightData}
              handleAddUpdateTabel={this.handleAddUpdateTabel}
            />
          )} */}
          <span className={style.scoreTxt}> 满分：{this.state.sum}</span>
          <span className={style.scoreTxt}> 扣减分数：{this.state.lack}</span>
          <span className={style.scoreTxt}> 实得分数：{this.state.real}</span>
          {/* 满分： 
          扣减分数：<Input value={this.state.lack}  style={{width:'80px'}} disabled />
          实得分数:<Input value={this.state.real} style={{width:'80px'}} disabled />  */}
          { ((this.props.auth && this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'INIT') || ( this.props.auth && this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'REJECT' && this.props.taskFlag)) ? (
            <Button type="primary" style={{ marginLeft: 10 }} onClick={this.handleDelete}
            disabled={this.props.permission.indexOf('SAFETYASSESSMENT_SAFETYASSESSMENTKPI')!==-1?false:true}>
              确定打分
            </Button>
          ) : null}
        </div>
        <Table
          size="small"
          components={components}
          rowKey={record => record.id}
          // rowClassName={record =>
          //   record.id === (this.state.record && this.state.record.id) ? 'tableActivty' : ''
          // }
          // rowSelection={{ onChange: selectedRowKeys => this.setState({ selectedRowKeys }) }}
          pagination={false}
          dataSource={dataSource}
          columns={columns}
          scroll={{ y: this.props.height - 45 }}
          // onChange={({ current, pageSize }) => {
          //   this.handleRequset(current, pageSize);
          // }}
        />
      </div>
    );
  }
}
export default EditableTable;
