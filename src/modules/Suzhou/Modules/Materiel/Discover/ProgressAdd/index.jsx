import React, { Component } from 'react';
import {Modal,Form,Row,Col,Input,Button,Icon,Select,DatePicker,Table,Slider,InputNumber,message,Checkbox,TreeSelect} from 'antd';
import moment from 'moment';
import style from './style.less';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { curdCurrentData } from '../../../../../../store/curdData/action';
import axios from '../../../../../../api/axios';
import {addInspectionProgress,getBaseSelectTree,updateInspectionProgress} from '../../../../api/suzhou-api';
import {fileList} from '../../../../../../api/api';
const { TextArea } = Input;
const Option = Select.Option;
const TreeNode = TreeSelect.TreeNode;
import PublicButton from "../../../../../../components/public/TopTags/PublicButton";
import * as dataUtil from "../../../../../../utils/dataUtil";
import UploadTpl from '../../../../components/Upload/uploadTpl';
import MyIcon from '../../../../../../components/public/TopTags/MyIcon';
import notificationFun from '@/utils/notificationTip';

export class PlanDefineAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '新增',
      info:{},
      initDone: false,
      selectSection:'',
      jobTypeOption:[],
      assignFlag:true,
      selectSetion:'',
      projectId:"",
      optionCertCategory:[],
      peopleId:[],
      peopleInfo:'',
      warnPeriod:'',
      orkTypeName:'',
      workTypeId:'',
      fileList:[],
      progressStatus:[], //进展状态下拉
      needThirdInspection:'0', //是否需第三方检测，0为是
      certInfo:'' ,//证书相关信息
      certChange:false,
    };
  }
  componentDidMount() {
    if (this.props.addOrModify == 'add') {
      this.setState({
        info:{},
        fileList:[],
      })
    } else if (this.props.addOrModify == 'modify') {
      axios.get(fileList(this.props.data.id, 'MATERIEL-DISCOVER-PROGRESS')).then(res => {
        this.setState({
          fileList: res.data.data
        })
      })
      this.setState({
        info: this.props.data
      });
    }
    //甲供乙供下拉
    const {rightData} = this.props;
    this.setState({
      source:rightData.inspectionTypeVo?rightData.inspectionTypeVo.code:'0'
    })
    const url = rightData.inspectionTypeVo.code == '0'?'szxm.wlgl.progress.status.1':'szxm.wlgl.progress.status.2';
    axios.get(getBaseSelectTree(url)).then((res)=>{
      this.setState({
        progressStatus:res.data.data,
        needThirdInspection:rightData.needThirdInspectionVo?rightData.needThirdInspectionVo.code:'0'
      })
    });
  }
  //新增提交
  handleSubmit = (val, e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (this.props.addOrModify == 'add') {
          let fileIds = [];
          let { fileList } = this.state;
          if (fileList.length) {
            for (let i = 0; i < fileList.length; i++) {
              fileIds.push(fileList[i].id)
            }
          }
          let data = {
            ...values,
            sectionId:this.props.rightData.sectionId,
            projectId:this.props.rightData.projectId,
            fileIds,
            inspectionCode:this.props.rightData.inspectionCode
          }
          axios.post(addInspectionProgress, data, true).then(res => {
            this.props.addData(res.data.data)
            if (val == 'save') {
              this.props.handleCancel()
            } else if (val == 'goOn') {
              this.props.form.resetFields();
            }
          })
        } else if (this.props.addOrModify == 'modify') {
          let fileIds = [];
          let { fileList } = this.state;
          if (fileList.length) {
            for (let i = 0; i < fileList.length; i++) {
              fileIds.push(fileList[i].id)
            }
          }
          let data = {
            ...values,
            id:this.props.data.id,
            fileIds,
          }
          axios.put(updateInspectionProgress, data, true).then(res => {
            if(res.data.status == 200){
              this.props.updateSuccess(res.data.data)
              this.props.handleCancel()
            }else{
              notificationFun('提示',!res.data.message?'增加失败':res.data.message);
            }
            
          })
        }
      }
      
    });
  };
  //上传列表控制
  operateClick = (record) => {
    let { fileList } = this.state;
    let index = fileList.findIndex(item => item.id == record.id);
    fileList.splice(index, 1);
    this.setState({
      fileList
    })
  }
  //上传回调
  file = (files) => {
    let { fileList } = this.state;
    if (files.response && files.response.data) {
      let file = files.response.data;
      let fileName = file.fileName.substring(0,file.fileName.lastIndexOf("."));
      let suffix = file.fileName.substring(file.fileName.lastIndexOf(".")+1,file.fileName.length);
      let obj = {
        id: file.id,
        fileName,
        suffix
      }
      fileList.push(obj)
    }
    this.setState({
      fileList,
    })
  }
  render() {
    const {optionCompany} = this.state;
    const { intl } = this.props.currentLocale
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const formItemLayout1 = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };
    const columns = [
        {
          title: '文件名称',
          dataIndex: 'fileName',
          key: 'fileName',
        },
        {
          title:'文件类型',
          dataIndex: 'suffix',
          key: 'suffix',
        },
        {
          title: "",
          dataIndex: 'operate',
          key: 'operate',
          render: (text, record) => <MyIcon type='icon-exit' onClick={this.operateClick.bind(this, record)} />
        }
      ]
    return (
      <div>
       
        <Modal className={style.main}
          width="850px"
          afterClose={this.props.form.resetFields}
          mask={false}
          maskClosable={false}
          footer={<div className="modalbtn">
            {/* 保存并继续 */}
            <Button key={1} onClick={this.handleSubmit.bind(this, 'goOn')}>{intl.get('wsd.global.btn.saveandcontinue')}</Button>
            {/* 保存 */}
            <Button key={2} onClick={this.handleSubmit.bind(this, 'save')} type="primary">{intl.get('wsd.global.btn.preservation')}</Button>
          </div>}
          centered={true} title={this.props.title?this.props.title:this.state.title} visible={this.props.visible}
          onCancel={this.props.handleCancel}>
          <Form onSubmit={this.handleSubmit} className={style.mainScorll}>
            <div className={style.content}>
              <Row type="flex">
                <Col span={12}>
                  <Form.Item label={'进展状态'} {...formItemLayout}>
                    {getFieldDecorator('status', {
                      initialValue: this.state.info.statusVo?this.state.info.statusVo.code.toString():'',
                      rules: [{
                        required: true,
                        message: '请选择进展状态'
                      }],
                    })(
                        <Select>
                        {
                          this.state.source == '0' && this.state.progressStatus.length && this.state.progressStatus.map((item,i) => {
                            return (
                              <Option style={{display:this.state.needThirdInspection == '1' && (item.value == '3'|| item.value =='4')?'none':'block'}} key={item.value} value={item.value}>{item.title}</Option>
                            )
                          })
                        }
                        {
                          this.state.source == '1' && this.state.progressStatus.length && this.state.progressStatus.map((item,i) => {
                            return (
                              <Option style={{display:this.state.needThirdInspection == '1' && (item.value == '1'|| item.value =='2')?'none':'block'}} key={item.value} value={item.value}>{item.title}</Option>
                            )
                          })
                        }
                      </Select>,
                    )}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label={'进展情况说明'} {...formItemLayout1}>
                    {getFieldDecorator('progressComment', {
                      initialValue:this.state.info.progressComment,
                      rules: [{required: true, message: '请输入进展情况说明'}],
                    })(
                      <TextArea rows={2} />,
                    )}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label={'备注说明'} {...formItemLayout1}>
                    {getFieldDecorator('description', {
                      initialValue:this.state.info.description,
                      rules: [],
                    })(
                      <TextArea rows={2} />,
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </Form>
          <div className={style.Modifytable}>
              <div className={style.tip}>
                {/* <span className={style.span}>备注：文件支持Word、excel格式</span> */}
                <div className={style.upload}>
                  <UploadTpl isBatch={true} file={this.file} />
                </div>
              </div>
              <Table 
                rowKey={record => record.id} 
                columns={columns} 
                dataSource={this.state.fileList} 
                pagination={false} 
                name={this.props.name} />
            </div>
        </Modal>
      </div>
    );
  }
}

const PlanDefineAdds = Form.create()(PlanDefineAdd);
export default connect(state => ({
  currentLocale: state.localeProviderData,
}))(PlanDefineAdds);
