import React, { Component } from 'react';
import { Table, notification, Modal } from 'antd';
import style from './style.less';
import Search from '../../../../components/Search';
import PublicButton from '../../../../../../components/public/TopTags/PublicButton';
import axios from '../../../../../../api/axios'
import {selectSubjectScore} from '../../../../api/suzhou-api'
import { connect } from 'react-redux';
const confirm = Modal.confirm;
import { baseURL } from '../../../../../../api/config';
import * as dataUtil from '../../../../../../utils/dataUtil';
import CheckModal from "../../../../components/CheckModal/"
class Permission extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: '',
      record: '',
      data: [],
      selectedRowKeys: [],
      selectedRows:[],
      currentPageNum: 1,
      total:'',
      pageSize: 10,
    };
  }
  //请求接口函数
  getListData = (val) => {
    const {projectId,sectionId,year,month} = val;
    const {pageSize,currentPageNum}=this.state;
    axios.get(selectSubjectScore(pageSize,currentPageNum),{params:{projectId,sectionId,year,month}}).then(res => {
      this.setState({
        data: res.data.data.subjectScoreItemVos.list,
        total:res.data.data.subjectScoreItemVos.total
      })
    });
  }
  componentDidMount() {
    const {rightData} = this.props;
    rightData ? this.getListData(rightData): null;
  }
  //点击行事件
  getInfo = (record, index) => {
    let id = record.id;
    if (this.state.activeIndex == id) {
      this.setState({
        activeIndex: null,
        selectData: null,
        addOrModify: 'add',
      });
    } else {
      this.setState({
        activeIndex: id,
        selectData: record,
        record: record
      });
    }

  };
  //设置table的选中行class样式
  setClassName = (record, index) => {
    return record.id === this.state.activeIndex ? 'tableActivty' : '';
  };
  render() {
    const columns = [
      {
          title:'模块名称',
          dataIndex: 'moduleTitle',
          key: 'moduleTitle',
      },
      {
        title:'文档标题',
        dataIndex: 'fileTitle',
        key: 'fileTitle',
      },
      {
        title:'上传人',
        dataIndex: 'uploader',
        key: 'uploader',
      },
      {
        title:'上传日期',
        dataIndex: 'uploadfileTime',
        key: 'uploadfileTime',
      },
      {
        title:'评分',
        dataIndex: 'score',
        key: 'score',
      },
        {
          title:'评分人',
          dataIndex: 'rater',
          key: 'rater',
        },
        {
          title:'评分日期',
          dataIndex: 'scoreTime',
          key: 'scoreTime',
        },
    ];
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
    return (
      <div className={style.main}>
          <div className={style.mainHeight}>
            <h3 className={style.listTitle}>{this.props.title}</h3>
            <div className={style.rightTopTogs}>
              
            </div>
            <div className={style.mainScorll}>
              <Table className={style.table} rowKey={record => record.id} 
                columns={columns} 
                dataSource={this.state.data} 
                pagination={false}
                name={this.props.name}
                size='small'
                rowSelection={rowSelection}
                rowClassName={this.setClassName}
                onRow={(record, index) => {
                  return {
                    onClick: (event) => {
                      this.getInfo(record, index);
                    },
                    onDoubleClick: (event) => {
                      event.currentTarget.getElementsByClassName("ant-checkbox-wrapper")[0].click();
                    }
                  };
                }
                } />
            </div>
          </div>
      </div>
    );
  }
}
const mapStateToProps = state => {
  return {
    currentLocale: state.localeProviderData,
  
  }
};
export default connect(mapStateToProps, null)(Permission);