const participantStatus = function(participant, detail){
  if (!participant.attended && !detail.ended) {
    return 'Registered';
  }else if (detail.cancelled && !participant.paid){
    return 'Cancelled';  
  }else if (participant.attended && !detail.ended){
    return 'Attended';
  }else if (participant.attended && !participant.paid && detail.ended){
    return 'Won';
  }else if (participant.paid){
    return 'Withdrawn';
  }else if (!participant.attended && detail.ended){
    return 'Lost';
  }else{
    throw("This should not happen");
  }
}
export default participantStatus;
