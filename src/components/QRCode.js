import React from 'react';
import ReactDOM from 'react-dom';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';

class QRCode extends React.Component {
  constructor(props) {
    super(props);
  }

  handleSearchField(event){
    web3.currentProvider
      .scanQRCode()
      .then(data => {
        console.log('QR Scanned:', data)
        this.props.eventEmitter.emit('search', data)
      })
      .catch(err => {
        console.log('Error:', err)
      })
  }

  render() {
    if(web3.currentProvider.scanQRCode){
      return (
        <IconButton onClick={this.handleSearchField.bind(this)}>
          {/* from https://materialdesignicons.com */}
          <Avatar src={require('../images/qrcode-scan.png')} size={26} backgroundColor="white" />
        </IconButton>
      );
    }else{
      return false;
    }
  }
}
export default QRCode;
