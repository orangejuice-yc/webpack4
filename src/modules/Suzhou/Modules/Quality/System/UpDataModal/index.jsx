import React , {Component} from "react"
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import FormComponent from "../UpdataForm/index"
class UpDataQua extends Component{
  state = {
    
  }
  render(){
    const {handleModalOkUpdata, handleModalCancelUpdata, visibleModalUpdata,UpdateList,getUnitName,getTypeNoVo} = this.props
      return (
        <Modal
          title="修改"
          width={800}
          destroyOnClose={true}
          centered={true }
          maskClosable={true}
          mask={false}
          visible={visibleModalUpdata}
          onOk={handleModalOkUpdata}
          onCancel={handleModalCancelUpdata}
        >
          <FormComponent UpdateList={UpdateList} getUnitName={getUnitName} getTypeNoVo={getTypeNoVo}/>
        </Modal>
      );
  }
}
UpDataQua.propType = {
  handleModalOkUpdata: PropTypes.func,
  handleModalCancelUpdata: PropTypes.func,
  visibleUpdata: PropTypes.bool
  
};

export default UpDataQua;
