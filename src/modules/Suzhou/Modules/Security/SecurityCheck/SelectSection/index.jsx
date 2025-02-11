import React from 'react';
import { TreeSelect } from 'antd';
import { getMapSectionData } from '@/modules/Suzhou/components/Util/util';
import axios from '@/api/axios';
import { getsectionId } from '@/api/suzhou-api';
import PropTypes from 'prop-types';

export default class extends React.Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    callBack: PropTypes.func.isRequired,
  };
  static defaultProps = {
    callBack: () => {},
  };
  state = {
    sectionIds:'',
    sectionIdData: [], //标段数据
    sectionCode: null, //标段号
    sectionId: null, //标段id
    sectionName: null, //标段name
  };
  // 获取标段 默认选择第一个
  componentDidMount() {
    axios.get(getsectionId(this.props.projectId)).then(res => {
      const { data = [] } = res.data;
      this.setState(() => ({ sectionIdData: getMapSectionData(data) }));
      if (this.state.sectionIdData.length > 0) {
        const { id, name, code } = this.state.sectionIdData[0];
        this.setState({ sectionId: id, sectionCode: code, sectionName: name });
        this.props.callBack({ sectionId: id, sectionCode: code, sectionName: name });
      }
    });
  }
  render() {
    return (
      <TreeSelect
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        allowClear
        placeholder="请选择标段"
        treeData={this.state.sectionIdData}
        // value={this.props.value}
        treeDefaultExpandAll
        multiple
        onChange={(...args) => {
          const [, , triggerNode = {}] = args;
          if (triggerNode.triggerNode) {
            const { id, name, code } = triggerNode.triggerNode.props;
              let section = '' 
              let sectionCodes = ''
              let args1 = [] 
                args[1].map((item)=>{
                args1.push(item.substring(0,item.indexOf(" ")))
              })      
              section = args[0].join(',')
              sectionCodes = args1.join(',')
            this.setState({sectionIds:section,sectionCode: sectionCodes,},()=>{
            })
            this.props.callBack({ sectionIds:section,sectionId: id, sectionCode: sectionCodes, sectionName: name });
          }
        }}
        disabled={this.props.disabled?true:false}
      />
    );
  }
}
