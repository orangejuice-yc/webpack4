import React, { Component } from 'react';
import { Table, Input, Button, Popconfirm, Form, Select } from 'antd';
import style from './style.less';
import PublicButton from '@/components/public/TopTags/PublicButton';

import notificationTip from '@/utils/notificationTip';

import {
  queryQuarterMortgageList,
  updateConfirm,
  updateOutUnitSecurityCheck,
  updateQuarterMortgage,
  updateZbsj,
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
  };

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
      const { zrdhze, id } = { ...record, ...values };
      handleSave({ zrdhze, id });
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
              message: `请输入`,
            },
          ],
          initialValue: record[dataIndex],
        })(
          <Input
            ref={node => (this.input = node)}
            type="number"
            onPressEnter={this.save}
            onBlur={this.save}
            disabled={((this.props.parentData.statusVo &&this.props.parentData.statusVo.code == 'INIT') || (this.props.parentData.statusVo && this.props.rightData.parentData.code == 'REJECT' && this.props.taskFlag))?false:true}
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
    this.state = {
      dataSource: [],
      selectedRowKeys: [],
      total: 0,
      editingFlag:false,
    };
  }

  handleSave = row => {
    // const { score, learnTime ,learnOk} = row;
    axios
      .put(
        updateQuarterMortgage,
        { ...row, zid: this.props.rightData.id, pjJg: this.props.rightData.pjJgVo.code },
        true
      )
      .then(res => {
        const { status, data } = res.data;
        if (status === 200) {
          const newData = [...this.state.dataSource];
          const index = newData.findIndex(item => row.id === item.id);
          const item = newData[index];
          newData.splice(index, 1, {
            ...item,
            ...data,
          });
          this.setState({ dataSource: newData });
          this.props.updatetableCallBack(
            {
              ...this.props.rightData,
              pjJgVo: { code: data.pjJg },
              sjTotal: data.sjTotal,
              zkcbffhe: data.zkcbffhe,
            },
            true
          );
        }
      });
  };
  handleRequset = () => {
    axios.get(queryQuarterMortgageList(this.props.rightData.id, 100, 1)).then(res => {
      const { data } = res.data;
      this.setState({ dataSource: data });
    });
  };
  handleAddUpdateTabel = data => {
    this.setState({
      dataSource: [...this.state.dataSource, ...data],
      total: this.state.total + 1,
    });
  };
  handleDelete = () => {
    axios
      .put(updateConfirm + `?aqkhId=` + this.props.rightData.id, {})
      .then(() => this.props.updatetableCallBack());
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
    if((this.props.rightData.statusVo.code == 'INIT' ||this.props.rightData.statusVo.code == 'REJECT')&&this.props.permission .indexOf('MORTGAGE_QUARTER_EDIT')!==-1){
      this.setState({
        editingFlag:true
      })
    }else{
      this.setState({
        editingFlag:false
      })
    }
  }
  handleChange = value => {
    axios
      .put(updateZbsj, {
        id: this.props.rightData.id,
        pjJg: value,
      })
      .then(res => {
        const data = {
          ...res.data.data,
          pjJgVo: {
            code: res.data.data.pjJg,
          },
        };
        this.props.updatetableCallBack(data, true);
      });
  };
  render() {
    const { dataSource } = this.state;
    const columnsList = [
      {
        title: '年度',
        dataIndex: 'year',
      },
      {
        title: '季度',
        dataIndex: 'seasson',
      },
      {
        title: '考评得分',
        dataIndex: 'checkScore',
      },
      {
        title: '安全管理违约责任单汇总额（万元）',
        dataIndex: 'zrdhze',
        editable: this.state.editingFlag,
      },
      {
        title: '季度风险抵押金实际计量额（万元）',
        dataIndex: 'jdfxdysjjle',
      },
      {
        title: '扣除金额（万元）',
        dataIndex: 'kcje',
      },
    ];
    const components = {
      body: {
        row: EditableFormRow,
        cell: props => <EditableCell parentData={this.props.rightData} {...props} />,
      },
    };
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

    return (
      <div className={style.main}>
        <div className={style.mainHeight}>
            <h3 className={style.listTitle}>风险抵退还</h3>
            <div className={style.rightTopTogs}>
                <div className={style.tools}>
                  <div>
                    <span>综合评价结果</span>
                      <Select
                        style={{ width: 200 }}
                        defaultValue={this.props.rightData.pjJgVo.code}
                        onChange={this.handleChange}
                        disabled={(((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'REJECT' && this.props.taskFlag))&&(this.props.permission.indexOf('MORTGAGE_QUARTER_EDIT')!==-1))?false:true}
                      >
                        <Select.Option value="0">优良</Select.Option>
                        <Select.Option value="1">合格</Select.Option>
                        <Select.Option value="2">不合格</Select.Option>
                      </Select>
                    </div>
                    <div>
                      <span>暂扣除部分返还额（万元）</span>
                      <Input disabled={true} value={this.props.rightData.zkcbffhe} style={{ width: 200 }} />
                    </div>
                  </div>
                </div>
                <div className={style.tools}>
                  <div>
                    <span>实际总支付额（万元）</span>
                    <Input disabled={true} value={this.props.rightData.sjTotal} style={{ width: 200 }} />
                  </div>
              </div>
            <div className={style.mainScorll} style={{marginTop:'12px'}}>
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
                    // onChange={({ current, pageSize }) => {
                    //   this.handleRequset(current, pageSize);
                    // }}
                    scroll={{x:"900px"}}
                  />
            </div>
        </div>
      </div>
    );
  }
}
export default EditableTable;

// import React from 'react';

// export default () => <h1>hhhhhhh</h1>;
