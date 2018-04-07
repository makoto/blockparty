import React from 'react';
import ReactDOM from 'react-dom';
import TextField from 'material-ui/TextField';

const styles = {
  paperRight:{
    flex: 3,
    textAlign: 'center',
  }
};

class NameSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: null
    };
  }

  componentDidMount(){
    this.props.eventEmitter.on('search', keyword => {
      this.setState({ keyword: keyword });
    });
  }

  handleSearchField(event){
    this.props.eventEmitter.emit('search', event.target.value)
  }

  render() {
    return (
        <TextField
        floatingLabelText="Search by name or address"
        floatingLabelFixed={true}
        value={this.state.keyword}
        onChange={this.handleSearchField.bind(this)}
        style={{margin:'0 5px'}}
        />
    );
  }
}
export default NameSearch;
