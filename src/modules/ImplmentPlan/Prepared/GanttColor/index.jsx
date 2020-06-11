import React from 'react';
import { Form, Row, Col, Radio, Input, Button, Checkbox, Icon, Select, DatePicker, Modal, Switch } from 'antd';
import style from './style.less';

class PlanPreparedGanttColor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            colors: [
                ['000000', '043400', '0d6800', '199b00', '25ce00', '31ff00', '330000', '333300', '356700', '3a9b00', '40cf00', '47ff00', '650000', '653200', '666700', '689b00', '6bce00', '70ff00'],
                ['000034', '023333', '0d6830', '199b28', '25cf1a', '31ff00', '320034', '333333', '35672f', '3a9b29', '40ce1a', '47ff00', '650034', '653233', '666730', '689a28', '6bce1a', '6fff00'],
                ['000067', '003267', '096666', '169a63', '24ce5f', '30ff58', '320068', '323268', '356766', '399b63', '3fce5f', '47ff58', '650068', '653167', '666666', '689a63', '6bce5f', '6fff58'],
                ['00009c', '002f9c', '03659a', '149a99', '21cd96', '2eff93', '30009c', '302e9b', '33659a', '389a99', '3ece96', '45ff93', '64009c', '642e9c', '66659b', '679999', '6bce96', '6fff93'],
                ['0000cf', '002acf', '0063cf', '0c98cd', '1ecdcc', '2cffc9', '2f00d9', '2e2acf', '3163cf', '3699ce', '3ccdcc', '44ffca', '6300d0', '6329cf', '6463cf', '6799ce', '69cdcc', '6dffc9'],
                ['0000ff', '0022ff', '0061ff', '0097ff', '18ccff', '28ffff', '2a00ff', '2b22ff', '32e61ff', '3397ff', '3accff', '41ffff', '6200ff', '6221ff', '6360ff', '6596ff', '68ccfe', '68ccff'],
                ['980002', '983100', '996600', '999a00', '9cce00', '9eff00', 'ca0002', 'ca2e00', 'cb6500', 'cb9900', 'cdce00', 'cfff00', 'fd0004', 'fc2900', 'fd6300', 'fe9800', 'ffcd00', 'ffff00'],
                ['970034', '983033', '986630', '999a29', '9bce1a', '9eff00', 'ca0034', 'ca2d34', 'cb6530', 'cb9929', 'd8d91c', 'cfff00', 'fd0035', 'fd2834', 'fd6331', 'fd9829', 'ffcd1c', 'ffff00'],
                ['980068', '982f68', '996666', '999a63', '9bce5f', '9eff59', 'ca0068', 'ca2c68', 'ca6466', 'cb9964', 'cdcd5f', 'cfff59', 'fc0068', 'fd2768', 'fd6266', 'ffcd5f', 'ffcd60', 'ffff59'],
                ['97009c', '972c9c', '98649b', '999999', '9acd96', '9dff92', 'ca009c', 'c9289b', 'ca639b', 'cb9999', 'cdcd97', 'ceff93', 'fd009c', 'fc229b', 'fd619b', 'fe989c', 'fe989a', 'ffff93'],
                ['9600d0', '9626cf', '9762ce', '9998ce', '9acccc', '9dffc9', 'c900d0', 'c922cf', 'ca61cf', 'cb97ce', 'cccccc', 'ceffca', 'fc00d0', 'fc1ccf', 'fd5fcf', 'fd96cd', 'fecbcc', 'ffffca'],
                ['9600ff', '961dff', '965fff', '9896ff', '9accff', '9cffff', 'c900ff', 'c918ff', 'c95eff', 'ca96ff', 'cbcbff', 'cdffff', 'fc00ff', 'fc0eff', 'fc5cff', 'fd95ff', 'fdcaff', 'ffffff']
                 
            ],
            currentColor: 'ffffff'
        }
    }

    handleChangeComplete = (color) => {
        this.setState({ background: color.hex });
    };

    handleSubmit = () => {
        this.props.setGanttColor(this.props.currentGantt, '#' + this.state.currentColor)
        this.props.handleCancel()
    }

    getCurrentColor = (color) => {
        this.setState({
            currentColor: color
        })
    }

    render() {
        return (
            <Modal className={style.main} title="横道设置" visible={true} width={466} onCancel={this.props.handleCancel} footer={[
                <Button key="1" onClick={this.handleSubmit}>恢复默认颜色</Button>,
                <Button key="2" type="primary" onClick={this.handleSubmit}>保存</Button>,
            ]}>
                <div className={style.colorCurrent}>
                    <span style={{ background: `#${this.state.currentColor}` }}></span>&nbsp;&nbsp;#&nbsp;&nbsp;<Input style={{ width: 80 }} value={this.state.currentColor} />
                    &nbsp;&nbsp;<a href="javascript:void(0);" style={{color: '#666'}} onClick={this.props.handleCancel}>关闭</a>
                </div>
                <div className={style.colorPicker}>
                    <div className={style.cpLeft}>
                        <span style={{ backgroundColor: '#000000' }} onClick={this.getCurrentColor.bind(this, '000000')}></span>
                        <span style={{ backgroundColor: '#333333' }} onClick={this.getCurrentColor.bind(this, '333333')}></span>
                        <span style={{ backgroundColor: '#666666' }} onClick={this.getCurrentColor.bind(this, '666666')}></span>
                        <span style={{ backgroundColor: '#999999' }} onClick={this.getCurrentColor.bind(this, '999999')}></span>
                        <span style={{ backgroundColor: '#cccccc' }} onClick={this.getCurrentColor.bind(this, 'cccccc')}></span>
                        <span style={{ backgroundColor: '#ffffff' }} onClick={this.getCurrentColor.bind(this, 'ffffff')}></span>
                        <span style={{ backgroundColor: '#ff0000' }} onClick={this.getCurrentColor.bind(this, 'ff0000')}></span>
                        <span style={{ backgroundColor: '#31ff00' }} onClick={this.getCurrentColor.bind(this, '31ff00')}></span>
                        <span style={{ backgroundColor: '#0000ff' }} onClick={this.getCurrentColor.bind(this, '0000ff')}></span>
                        <span style={{ backgroundColor: '#ffff00' }} onClick={this.getCurrentColor.bind(this, 'ffff00')}></span>
                        <span style={{ backgroundColor: '#28ffff' }} onClick={this.getCurrentColor.bind(this, '28ffff')}></span>
                        <span style={{ backgroundColor: '#fb00ff' }} onClick={this.getCurrentColor.bind(this, 'fb00ff')}></span>
                    </div>
                    <div className={style.cpRight}>
                        {
                            this.state.colors.map((v, i) => {
                                return (
                                    <div key={i}>
                                        {
                                            v.map((vs) => {
                                                return <span key={vs} style={{ backgroundColor: `#${vs}`}} onClick={this.getCurrentColor.bind(this, vs)}></span>
                                            })
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </Modal>
        );
    }
}

export default PlanPreparedGanttColor