import './Conference.sol';
import './zeppelin/ownership/Ownable.sol';

contract BlockParty is Ownable{
  struct PartyMetaData {
    address contractAddress; //
    bytes32 slug;
    uint256 startDate;
    string  mapUrl;
    string  locationText;
    string  descriptionText;
  }

  PartyMetaData[] public parties;

  function createParty(
    /* Contract data */
    string name,
    uint256 deposit,
    uint limitOfParticipants,
    /* Metadata */
    bytes32 slug,
    uint256 startDate,
    string mapUrl,
    string locationText,
    string descriptionText
  ) onlyOwner{
    Conference party = new Conference(
      name,
      deposit,
      limitOfParticipants,
      0,    // Cooling period
      0x0,  // Confirmation Repository Address,
      ''    // Encryption public key
    );

    parties.push(PartyMetaData(
      address(party),
      slug,
      startDate,
      mapUrl,
      locationText,
      descriptionText
    ));
  }
}
