import React from 'react';
import { Table, Input, Button, Form } from 'antd';
import style from './style.less';
import { queryEvaluateCheckList, updateEvaluateCheck } from '@/modules/Suzhou/api/suzhou-api';
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
              message: `请输入${title}`,
            },
          ],
          initialValue: record[dataIndex],
        })(
          <Input
            ref={node => (this.input = node)}
            type="number"
            onPressEnter={this.save}
            onBlur={this.save}
            style={{ width: 100 }}
            disabled={this.props.statusVo.code !== 'INIT'}
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
      columns: [
        {
          title: '检查编号',
          dataIndex: 'checkCode',
        },
        {
          title: this.props.checkType === 2 ? '扣减分数' : '检查得分',
          dataIndex: 'checkScore',
          editable: true,
        },
        {
          title: '检查时间',
          dataIndex: 'checkTime',
        },
        {
          title: '月份',
          dataIndex: 'month',
          checkType: 0,
        },
        {
          title: '详情',
          render: ({ checkId }) => (
            <a
              href="#"
              onClick={() => {
                sessionStorage['ConstructionEvaluation'] = JSON.stringify(checkId);
                this.props.openMenuByMenuCode('SECURITY-SECURITYCHECK', true);
              }}
            >
              查看
            </a>
          ),
        },
      ],
    };
  }

  handleSave = row => {
    axios
      .put(
        updateEvaluateCheck(),
        {
          id: row.id,
          checkScore: row.checkScore,
          checkType: this.props.checkType,
        },
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
        }
      });
  };
  handleRequset = (size = 10, page = 1) => {
    axios
      .get(queryEvaluateCheckList(this.props.rightData.id, this.props.checkType, 0, size, page))
      .then(res => {
        const { data, status, total } = res.data;
        if (status === 200) {
          this.setState({
            dataSource: data,
            total: total,
          });
        }
      });
  };
  handleAddUpdateTabel = data => {
    this.setState({
      dataSource: [...this.state.dataSource, data],
      total: this.state.total + 1,
    });
  };
  handleDelete = () => {
    if (this.state.selectedRowKeys.length > 0) {
      axios.deleted(delTrainStaff(), { data: this.state.selectedRowKeys }, true).then(res => {
        const { status } = res.data;
        if (status === 200) {
          this.setState(({ dataSource, selectedRowKeys, total }) => ({
            dataSource: dataSource.filter(item => !selectedRowKeys.includes(item.id)),
            selectedRowKeys: [],
            total: total - selectedRowKeys.length,
          }));
        }
      });
    }
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
    if (this.props.checkType === 0) {
      const data = this.state.columns.filter(item => item.checkType !== 0);
      this.setState({ columns: data });
    }
  }
  render() {
    const { dataSource } = this.state;
    const components = {
      body: {
        row: EditableFormRow,
        cell: props => <EditableCell statusVo={this.props.rightData.statusVo} {...props} />,
      },
    };
    const columns = this.state.columns.map(col => {
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
        <h3 className={style.h3}>
          {this.props.checkType === 0
            ? '中心季度检查'
            : this.props.checkType === 1
            ? '部门月度检查'
            : this.props.checkType === 2
            ? '日常安全巡查'
            : null}
        </h3>
        <Table
          size="small"
          components={components}
          rowKey={record => record.id}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            LocaleProvider: true,
            total: this.state.total,
            showTotal: () => `总共${this.state.total}条`,
          }}
          dataSource={dataSource}
          columns={columns}
          onChange={({ current, pageSize }) => {
            this.handleRequset(current, pageSize);
          }}
        />
      </div>
    );
  }
}
export default EditableTable;
