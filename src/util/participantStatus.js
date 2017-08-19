const participantStatus = function(participant, detail){
  if (!participant.attended && !detail.ended) {
    return 'Registered';
  }else if (participant.attended && !detail.ended){
    return 'Attended';
  }else if (participant.attended && !participant.paid && detail.ended){
    return 'Won';
  }else if (!participant.attended && detail.ended){
    return 'Lost';
  }else if (participant.attended && participant.paid){
    return 'Earned';
  }else{
    throw("This should not happen");
  }
}
export default participantStatus;
