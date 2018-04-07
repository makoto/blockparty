import React from 'react';
import ReactDOM from 'react-dom';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';

const styles = {
  paperRight:{
    flex: 3,
    textAlign: 'center',
  }
};

class QRCode extends React.Component {
  constructor(props) {
    super(props);
  }

  handleSearchField(event){
    this.props.eventEmitter.emit('search', 'makoto')
  }

  render() {
    return (
      <IconButton onClick={this.handleSearchField.bind(this)}>
        {/* from https://materialdesignicons.com */}
        <Avatar src={require('../images/qrcode-scan.png')} size={26} backgroundColor="white" />
      </IconButton>
    );
  }
}
export default QRCode;
