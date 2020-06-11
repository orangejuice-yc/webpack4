import React, { Component } from 'react'
import { Form, Row, Col, Input, Modal, TreeSelect, Button, Table } from 'antd'
import UploadTpl from '../../../../components/Upload/uploadTpl';
import MyIcon from '../../../../../../components/public/TopTags/MyIcon';
import {getOrgPeopleList} from '../../../../api/suzhou-api'
import axios from '../../../../../../api/axios';
import { fileList } from '../../../../../../api/api';
import style from './style.less';

const {Item} = Form
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
}

class AddPerson1 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      assignFlag:false,
      craft: '',
      info:{},
      fileList:[],
      fileIds: [],
      peopleInfo:''
    }
  }

  componentDidMount() {
    const {projectId, sectionId,addOrModify} = this.props
    if(addOrModify == 'add'){
      this.setState({
        info:{},
        fileList:[]
      })
    }else if(addOrModify == 'modify'){
      axios.get(fileList(this.props.data.id, 'DEVICE-LEDGER-PERSON')).then(res => {
        this.setState({
          fileList: res.data.data
        })
      })
      this.setState({
        info:this.props.data,
        name:this.props.data?this.props.data.name:''
      })
    }
    // 选择人员
    axios.get(getOrgPeopleList+`?projectId=${projectId}&sectionIds=${sectionId}&type=1`).then(res => {
      this.getSelectTreeArr(res.data.data,{"id":"value","name":"title"});
      this.setState({
        selectPeople: res.data.data
      })
    })
  }
  // 人员列表项
  getSelectTreeArr=(array,keyMap)=>{
    if(array){
      array.forEach((item,index,arr)=>{
        var obj = item;
        if(obj.type === 'people'){
        }else{
          obj.disabled = true;
        };
        for(var key in obj){
          var newKey = keyMap[key];
          if(newKey){
              obj[newKey] = obj[key];
          }
        }
        this.getSelectTreeArr(item.children,keyMap);
      })
    }
  }
  //选择人员
  onSelect = (selectedKeys, info,e) => {
    const peopleInfo = info.props
    this.setState({
      peopleInfo,
      craft: peopleInfo.workTypeName
    })
    this.props.form.setFieldsValue({
      craft: peopleInfo.workTypeName
    })
  }
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

  cb = () => {
    this.setState({
      fileIds: [],
      fileList: [],
    })
    this.props.form.setFieldsValue({
      name: '',
      craft: ''
    })
  }
  handleSubmit = (val, e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if(this.props.addOrModify == 'add'){
          const {peopleInfo, craft, fileList} = this.state
          const {name} = peopleInfo
          let fileIds = [];
          if (fileList.length) {
            for (let i = 0; i < fileList.length; i++) {
              fileIds.push(fileList[i].id)
            }
          }
          const data0 = {name, craft, fileIds}
          this.props.handleModalOk(data0, val, this.cb)
        }else if(this.props.addOrModify == 'modify'){
          let fileIds = [];
          let { fileList } = this.state;
          if (fileList.length) {
            for (let i = 0; i < fileList.length; i++) {
              fileIds.push(fileList[i].id)
            }
          }
          let name = !this.state.peopleInfo?this.props.data.name:this.state.peopleInfo.name;
          const data = {...this.props.data,...values,fileIds,name};
          delete(data['fileCount'])
          this.props.updateModal(data, val, this.cb)
        }
      }
    })
  }

  handleCancel = () => {
    this.props.handleModalCancel()
  }

  render() {
    const {visibleAddPerson, form,modalTitle} = this.props
    const {getFieldDecorator} = form;
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
        <Modal 
          title={modalTitle} 
          width="850px"
          className={style.main}
          afterClose={this.props.form.resetFields}
          mask={false}
          centered={true} 
          maskClosable={false}
          visible={visibleAddPerson}
          onCancel={this.handleCancel}
          footer={
            <div className="modalbtn">
              {/* 保存并继续 */}
              <Button key={1} onClick={this.handleSubmit.bind(this, 'goOn')}>保存并继续</Button>
              {/* 保存 */}
              <Button key={2} onClick={this.handleSubmit.bind(this, 'save')} type="primary">保存</Button>
            </div>
          }
        >
          <Form onSubmit={this.handleSubmit} className={style.mainScorll}>
            <div className={style.content}>
              <Row type="flex">
                <Col span={12} key={"name"}>
                  <Item label={"姓名"} {...formItemLayout}>
                    {getFieldDecorator('name', {
                      rules: [{
                        required: true,
                        message: '请选择人员姓名'
                      }], 
                      initialValue: this.state.name
                    })(
                      <TreeSelect
                        showSearch
                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                        allowClear
                        treeDefaultExpandAll
                        treeData={this.state.selectPeople}
                        onSelect= {this.onSelect}
                        disabled={this.state.assignFlag}
                      />
                    )}
                  </Item>
                </Col>
                <Col span={12} key={"craft"}>
                  <Item label={"工种"} {...formItemLayout}>
                    {getFieldDecorator("craft", {
                      initialValue: this.state.info.craft,
                      rules: [
                        {
                          required: true,
                          message: '请输入工种',
                        },
                      ], 
                      // initialValue: this.state.craft
                    })(
                      <Input disabled={true} />
                    )}
                  </Item>
                </Col>
              </Row>
            </div>
          </Form>
          <div className={style.Modifytable}>
            <div className={style.tip}>
              <span className={style.span}>备注：文件支持Word、excel格式</span>
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
    )
  }
}
const AddPerson = Form.create({name: 'AddPersonInfo'})(AddPerson1)
export default AddPerson