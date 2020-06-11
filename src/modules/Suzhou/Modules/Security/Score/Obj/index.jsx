import React, { Component } from 'react';
import { Table, notification, Modal } from 'antd';
import style from './style.less';
import Search from '../../../../components/Search';
import PublicButton from '../../../../../../components/public/TopTags/PublicButton';
import axios from '../../../../../../api/axios'
import {getSysObjectScores} from '../../../../api/suzhou-api'
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
      info:{},
      selectedRowKeys: [],
      selectedRows:[],
    };
  }
  //请求接口函数
  getListData = () => {
    const {rightData}  =this.props;
    const {projectId,sectionId,year,month} = rightData;
    axios.get(getSysObjectScores,{params:{projectId,sectionId,year,month}}).then(res => {
      this.setState({
        info:res.data.data,
        data: res.data.data.scoreItemVos,
      })
    });
  }
  componentDidMount() {
    const {rightData} = this.props;
    rightData ? this.getListData(): null;
  }
  //点击行事件
  getInfo = (record, index) => {
    let id = record.id;
    if (this.state.activeIndex == id) {
      this.setState({
        activeIndex: null,
        selectData: null,
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
  // setClassName = (record, index) => {
  //   return record.id === this.state.activeIndex ? 'tableActivty' : '';
  // };
  render() {
    const columns = [
      {
          title:'违规行为',
          dataIndex: 'checkTitle',
          key: 'checkTitle',
          onCell: (record, rowIndex) => ({
            style:record.mainItem == 0?{backgroundColor: '#ccc'}:null
          }),
          render:(text,record)=>{
            return (
              <span style={(!record.violateCount || record.violateCount ==0)?null:{color:'red'}}>{text}</span>
            )
          }
      },
      {
          title:'扣分标准/分值范围',
          dataIndex: 'deductionStandard',
          key: 'deductionStandard',
          onCell: (record, rowIndex) => ({
            style:record.mainItem == 0?{backgroundColor: '#ccc'}:null
          }),
          render:(text,record)=>{
            if(record.mainItem == 0){
              return(
                <span>{record.minScore}-{record.maxScore}</span>
              )
            }else{
              return(
                <span style={(!record.violateCount || record.violateCount ==0)?null:{color:'red'}}>{text}</span>
              )
            }
          }
      },
      {
        title:'违规次数',
        dataIndex: 'violateCount',
        key: 'violateCount',
        onCell: (record, rowIndex) => ({
          style:record.mainItem == 0?{backgroundColor: '#ccc'}:null
        }),
        render:(text,record)=>{
          return (
            <span style={(!text || text ==0)?null:{color:'red'}}>{text}</span>
          )
        }
      },
      {
        title:'扣减/实得分数',
        dataIndex: 'score',
        key: 'score',
        onCell: (record, rowIndex) => ({
          style:record.mainItem == 0?{backgroundColor: '#ccc'}:null
        }),
        render:(text,record)=>{
          return (
            <span style={(!record.violateCount || record.violateCount ==0)?null:{color:'red'}}>{text}</span>
          )
        }
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
                <span className={style.scoreTxt}> 满分：{this.state.info.totalScore}</span>
                <span className={style.scoreTxt}> 实际得分：{this.state.info.actualScore}</span>
            </div>
            <div className={style.mainScorll}>
              <Table className={style.table} rowKey={record => record.id} 
                  columns={columns} 
                  dataSource={this.state.data} 
                  pagination={false}
                  name={this.props.name}
                  size='small'
                  // rowSelection={rowSelection}
                  // rowClassName={this.setClassName}
                  // scroll={{x:'1000px'}}
                  // onRow={(record, index) => {
                  //   return {
                  //     onClick: (event) => {
                  //       this.getInfo(record, index);
                  //     },
                  //     onDoubleClick: (event) => {
                  //       event.currentTarget.getElementsByClassName("ant-checkbox-wrapper")[0].click();
                  //     }
                  //   };
                  // }
                  // } 
                />
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