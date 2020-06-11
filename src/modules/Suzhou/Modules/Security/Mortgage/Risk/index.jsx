import React, { Component } from 'react';
import { Table, Input, Button, Popconfirm, Form } from 'antd';
import style from './style.less';
import PublicButton from '@/components/public/TopTags/PublicButton';

import notificationTip from '@/utils/notificationTip';

import {
  updateSecurityExaminationDetail,
  updateConfirm,
  updateMonthMortgage,
  queryMonthMortgageList,
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
      const { year, month, jlNum, id, dyjNum } = { ...record, ...values };
      handleSave({ year, month, jlNum, id, dyjNum });
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
        title: '年度',
        dataIndex: 'year',
      },
      {
        title: '月份',
        dataIndex: 'month',
      },
      {
        title: '月总建筑安装进度计量款（万元）',
        dataIndex: 'jlNum',
        // editable: true,
      },
      {
        title: '月安全生产风险抵押金（万元）',
        dataIndex: 'dyjNum',
      },
    ];

    this.state = {
      dataSource: [],
      selectedRowKeys: [],
      total: 0,
    };
  }

  handleSave = row => {
    // const { score, learnTime ,learnOk} = row;
    axios.put(updateMonthMortgage, row, true).then(res => {
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
        // this.props.handleAddData();
      }
    });
  };
  handleRequset = () => {
    axios.get(queryMonthMortgageList(this.props.rightData.id, 100, 1)).then(res => {
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
  }
  render() {
    const { dataSource } = this.state;
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
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
      <div className={style.container+' '+style.main}>
        <h3 className={style.h3}>风险抵押金</h3>
        <div className={style.tools} style={{ marginBottom: 10 }}></div>
        <div className={style.mainScorll}>
          <Table
            className={style.Table}
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
          />
        </div>
      </div>
    );
  }
}
export default EditableTable;

// import React from 'react';

// export default () => <h1>hhhhhhh</h1>;
