import React from 'react';
import {NotificationContainer, NotificationManager} from 'react-notifications';

class Notification extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount(){
    this.props.eventEmitter.on('notification', obj => {
      NotificationManager[obj.status](obj.message);
      // NotificationManager.info('Info message');
      // NotificationManager.success('Success message', 'Title here');
      // NotificationManager.warning('Warning message', 'Close after 3000ms', 3000);
      // NotificationManager.error('Error message', 'Click me!', 5000, () => {
      //   alert('callback');
      // });
      // this.setState(obj);
    });
  }

  render(){
    return (<div><NotificationContainer/></div>)
  }
}

// const Notification = (props) => (
//   <div>
//     Hello
//   </div>
// );
// import React from 'react';
// import {NotificationContainer, NotificationManager} from 'react-notifications';
// class Notification extends React.Component {
//   createNotification = (type) => {
//     return () => {
//

//     };
//   };
//
//   render() {
//     return (
//       <div>
//         <button className='btn btn-info'
//           onClick={this.createNotification('info')}>Info
//         </button>
//         <hr/>
//         <button className='btn btn-success'
//           onClick={this.createNotification('success')}>Success
//         </button>
//         <hr/>
//         <button className='btn btn-warning'
//           onClick={this.createNotification('warning')}>Warning
//         </button>
//         <hr/>
//         <button className='btn btn-danger'
//           onClick={this.createNotification('error')}>Error
//         </button>
//
//         <NotificationContainer/>
//       </div>
//     );
//   }
// }

export default Notification;
