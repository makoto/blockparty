// This is to add non contract binding data into Dapp.
// May be replaced with IPFS at some point.
let Data = [
  {
    name:"ENS Hackathon 2018",
    address:"0x742cd182c2e63b60ca2a13ed3095cccaac69e86c",
    date:"11-12th(Sat/Sun) August 2018",
    map_url:"https://goo.gl/maps/ywdQBuEAfns",
    location_text:"King's college London at Strand London WC2R 2LS",
    description_text:"To be qualifed for the payout, please PHYSICALLY be at the venue by 10am at the latest",
    ether_price:453
  },
  {
    name:"CodeUp #29",
    address:"0x742cd182c2e63b60ca2a13ed3095cccaac69e86c",
    date:"Thursday, July 19, 2018 6:30 PM to 9:00 PM(UTC+1)",
    map_url:"https://goo.gl/maps/TRC3K3Gxd6N2",
    location_text:"Balderton Capital (The Stables, 28 Britannia St, Kings Cross, London  WC1X 9JF)",
    description_text:"",
    ether_price:468
  },
  {
    name:"Ethereum London July 2018",
    address: "0x42d8242bb174a12b8ebceb2aeba09b1b15ceb1e6",
    date:"Wednesday, July 18, 2018 6:25 PM to 9:00 PM(UTC+1)",
    description_text:"",
    map_url: 'https://www.google.com/maps/place/Imperial+College+London/@51.4987997,-0.1770659,17z/data=!3m1!4b1!4m5!3m4!1s0x48760567da220a01:0x31911b371c692e86!8m2!3d51.4987997!4d-0.1748772?hl=en',
    location_text: 'Sir Alexander Fleming Building (SAF) LT1 G16',
    ether_price:400,
    testnet:true
  },
  {
    name:"CodeUp #28",
    address:"0x83a0d3183df9B5a9a7A1ADa5034eE6881beF0e72",
    date:"Tuesday, June 19, 2018 6:30 PM to 9:00 PM(UTC+1)",
    map_url:"https://www.google.co.uk/maps/place/Simply+Business/@51.51528,-0.0904011,15z/data=!4m5!3m4!1s0x0:0x70f23f24baccffdc!8m2!3d51.51528!4d-0.0904011",
    location_text:"Simply Business (99 Gresham St, London EC2V 7NG)",
    description_text:"",
    ether_price:402
  },
  {
    name:"CodeUp #27",
    address:"0x83a0d3183df9B5a9a7A1ADa5034eE6881beF0e72",
    date:"Wednesday, May 9, 2018 6:30 PM to 9:00 PM(UTC+1)",
    map_url:"https://www.google.co.uk/maps/place/Simply+Business/@51.51528,-0.0904011,15z/data=!4m5!3m4!1s0x0:0x70f23f24baccffdc!8m2!3d51.51528!4d-0.0904011",
    location_text:"Simply Business (99 Gresham St, London EC2V 7NG)",
    description_text:"",
    ether_price:402
  },
  {
    name:"Ethereum London April 2018",
    address:"0x5B0A85D249FF3143B933AcaE36B4C139833527f2",
    date:"Wednesday, April 18, 2018 5 PM to 6 PM(UTC+0)",
    map_url:"https://goo.gl/maps/jRUEfLboN7K2",
    location_text:"Olympia, London Hammersmith Road, Kensington · London W14 8UX, 'Blockchain for Business' stage INSIDE the 'Blockchain Expo' show at the Olympia.",
    description_text:"Note that it is FREE to attend the expo floor on the 18th however you MUST register to get a free pass at https://gateway.blockchain-expo.com/global/free-expo-pass/register",
    ether_price:402,
    testnet:true
  },
  {
    name:"Simply business internal drinks",
    address:"0x9834074c07c3584314b80FaA6f130fb98241071d",
    date:"Thursday, April 12, 2018 5:15 PM(UTC+1)",
    map_url:"https://goo.gl/maps/Jv6HywnnJ2p",
    location_text:"Old Doctor Butler’s Head 2 Masons Ave, Moorgate, London EC2V 5BT",
    description_text:"",
    ether_price:402,
    testnet:true
  },
  {
    name:"CodeUp #26",
    address:"0x48Fae9ef344c63a0D39566B0941F6eBf58Fa6Ed9",
    date:"Tuesday, April 10, 2018 6:30 PM to 9:00 PM(UTC+1)",
    map_url:"https://www.google.co.uk/maps/place/Simply+Business/@51.51528,-0.0904011,15z/data=!4m5!3m4!1s0x0:0x70f23f24baccffdc!8m2!3d51.51528!4d-0.0904011",
    location_text:"Simply Business (99 Gresham St, London EC2V 7NG)",
    description_text:"",
    ether_price:402,
    testnet:true
  },
  {
    name: 'Ethereum London March 2018',
    address: '0xD2fDdAD19D6Fd3159fe2658030De2962871aa3Fc',
    date:'Wednesday, March 14, 2018 6:25 PM to 9:00 PM(UTC+0)',
    map_url: 'https://www.google.co.uk/maps/place/Blackett+Laboratory/@51.4990621,-0.1797274,18z/data=!4m8!1m2!2m1!1sBlackett+Laboratory,+Imperial+College+London!3m4!1s0x0:0xd04e1ad92205e646!8m2!3d51.4993979!4d-0.1791809?hl=en',
    location_text: "Physics LT1, Blackett Laboratory, Imperial College London, corner of Prince Consort Road and Queen's Gate",
    description_text: '',
    ether_price: 615,
  },
  {
    name: 'EthCC Post conference lunch',
    address: '0x21b50df62c8c49db34f81afdd9bf2c612dac6a0e',
    date:'Sunday, March 11, 2018 11am ~ 1pm (UTC+1)',
    map_url: 'https://www.google.co.uk/maps/place/Restaurant+Le+Tr%C3%A9sor/@48.8570837,2.35761,15z/data=!4m5!3m4!1s0x0:0xe2358c4424d7c287!8m2!3d48.8570837!4d2.35761',
    location_text: "Restaurant Le Trésor, 9 Rue du Trésor 75004 Paris.",
    description_text: "<a target='_blank' href='https://m.lafourchette.com/fr_FR/restaurant/le-tresor/76107'>Restaurant Le Trésor</a> is an amazing french restaurant according to @jdetychey. Please pay for your meal individually(or we split). Maximum delay time to be eligible for the deposit is 30 min.",
    ether_price: 615,
  },
  {
    name: 'Ethereum London February 2018',
    address: null,
    date:'Wednesday, February 21, 2018 6:25 PM to 9:00 PM(UTC+0)',
    map_url: 'https://www.google.co.uk/maps/place/Blackett+Laboratory/@51.4990621,-0.1797274,18z/data=!4m8!1m2!2m1!1sBlackett+Laboratory,+Imperial+College+London!3m4!1s0x0:0xd04e1ad92205e646!8m2!3d51.4993979!4d-0.1791809?hl=en',
    location_text: "Physics LT1, Blackett Laboratory, Imperial College London, corner of Prince Consort Road and Queen's Gate",
    description_text: '',
    ether_price: 538,
  },
  {
    name: 'CodeUp #24',
    address: '0x19a61bf1436d6b8f6b918575583d4b0481cf3989',
    date:'Nov 28th (Tues) 6:30 PM(UTC)',
    map_url: 'https://www.google.co.uk/maps/place/Simply+Business/@51.51528,-0.0904011,15z/data=!4m5!3m4!1s0x0:0x70f23f24baccffdc!8m2!3d51.51528!4d-0.0904011',
    location_text: 'Simply Business (99 Gresham St, London EC2V 7NG)',
    description_text: '',
    ether_price: 474
  },
  {
    name: 'Ethereum London November 2017',
    address: '0xda0ec6ef1288cf3829d0cd499a626a107ef3943d',
    date:'Wednesday, November 15, 2017 6:25 PM to 9:00 PM(UTC+1)',
    map_url: 'https://www.google.com/maps?f=q&hl=en&q=Huxley+Building,+Imperial+College+,+London+SW7+2AZ,+gb',
    location_text: 'Clore Lecture Theatre, Huxley Building, Imperial College , London SW7 2AZ',
    description_text: '',
    ether_price: 334,
  },
  {
    name: 'Devcon3 dinner for global Ethereum meetup organisers',
    address: '0x6f36d375c11f410d7dc4c170b1f14af601a4d108',
    date:'Wednesday, November 1, 2017 6:30 PM ~ (UTC-05:00)',
    map_url: 'https://www.google.co.uk/maps/place/La+Isla+Shopping+Village/@21.1108433,-86.7653545,17z/data=!3m1!4b1!4m5!3m4!1s0x8f4c285f9f1c5055:0xc2d79d4d1a890dc7!8m2!3d21.1108433!4d-86.7631658',
    location_text: 'Hotel Zone, Blvd. Kukulcan, La Isla Shopping Village Km.12, TEL. 883-0902 883-0897',
    description_text: "<a target='_blank' href='https://www.opentable.com/r/cambalache-cancun?lang=en&utm_source=opentable&utm_medium=tms_email&utm_campaign=reso_confirm'>Cambalache</a> steak house (price range $26 or over). Chance to chat with other Ethereum meetup organisers around the world over dinner.",
    ether_price: 316,
  },
  {
    name: 'CodeUp #23',
    address: '0x015b631f1ea6434b1a71ed1bff5ac38b79e7f5c4',
    date:'Oct 18th (Tues) 6:30 PM(UTC+1)',
    map_url: 'https://www.google.co.uk/maps/place/Simply+Business/@51.51528,-0.0904011,15z/data=!4m5!3m4!1s0x0:0x70f23f24baccffdc!8m2!3d51.51528!4d-0.0904011',
    location_text: 'Simply Business (99 Gresham St, London EC2V 7NG)',
    description_text: '',
    ether_price: 317,
  },
  {
    name: 'Ethereum London October 2017',
    address: '0xf618af176f6521ae0ab249133740dd173c3e43e1',
    date:'Wednesday, October 11, 2017 6:25 PM to 9:00 PM(UTC+1)',
    map_url: 'https://www.google.com/maps/place/Imperial+College+London/@51.4987997,-0.1770659,17z/data=!3m1!4b1!4m5!3m4!1s0x48760567da220a01:0x31911b371c692e86!8m2!3d51.4987997!4d-0.1748772?hl=en',
    location_text: 'Sir Alexander Fleming Building (SAF) LT1 G16',
    description_text: '',
    ether_price: 335,
  },
  {
    name: 'Ethereum London September 2017',
    address: '0x56812b5b1c3594af9e0b8a22d07025f5ee3debcd',
    date:'Wednesday, September 13, 2017 6:45 PM to 9:00 PM(UTC+1)',
    map_url: 'https://maps.google.com/maps?f=q&hl=en&q=Huxley+Building%2C+Imperial+College+%2C+London+SW7+2AZ%2C+gb',
    location_text: 'Clore Lecture Theatre, Huxley Building, Imperial College, London (SW7 2AZ)',
    description_text: '',
    ether_price: 214,
  },
  {
    name: 'CodeUp #22',
    address: '0x03738b2fd7ab1d8b3003c3e4d83864eef636bed2',
    date:'Sep 7th (Thur) 6:30 PM(UTC+1)',
    map_url: 'https://www.google.co.uk/maps/place/Simply+Business/@51.51528,-0.0904011,15z/data=!4m5!3m4!1s0x0:0x70f23f24baccffdc!8m2!3d51.51528!4d-0.0904011',
    location_text: 'Simply Business (99 Gresham St, London EC2V 7NG)',
    description_text: '',
    ether_price: 299,
  },
  {
    name: 'CodeUp #21',
    address: '0x97a6ec1ea5810388b6cb513b087e55a65c4bf417',
    date:'Jun 22nd (Thur) 6:30 PM(UTC+1)',
    map_url: 'https://www.google.co.uk/maps/place/Simply+Business/@51.51528,-0.0904011,15z/data=!4m5!3m4!1s0x0:0x70f23f24baccffdc!8m2!3d51.51528!4d-0.0904011',
    location_text: 'Simply Business (99 Gresham St, London EC2V 7NG)',
    description_text: '',
    ether_price: 326,
  },
  {
    name: 'Edcon Post conference lunch',
    address: '0x7b249881af36cccd1ab2e4325a8eed2a7848b263',
    date:'Feb 19th (Sun) 12:30(UTC+1)',
    map_url: 'https://www.google.co.uk/maps/place/Mama+Shelter+Paris/@48.8597157,2.4006691,17z/data=!4m5!3m4!1s0x47e66d8670ddcb91:0xb81d5c1e065c8167!8m2!3d48.8597122!4d2.4028631',
    location_text: 'Mama Shelter Paris (109 Rue de Bagnolet, 75020 Paris)',
    description_text: "<a target='_blank' href='http://www.mamashelter.com/en/paris/restaurants/restaurant'>Mama Shelter Paris</a> is a restaurant of the hotel all the Edcon speakers stay. Their brunch buffet(42€) is a bit pricy but very high quality and quantity, according to @jdetychey",
    ether_price: 12,
  },
  {
    name: 'DevCon2 Pre conference dinner',
    address: '0x7473a821fffc1e75524f9b99d6d4e9a2f9c7b12e',
    date: 'Sep 18th (Sun) 7pm(UTC+8)',
    map_url: 'https://goo.gl/maps/Uty16SUcxd42',
    location_text: 'The lobby at Hyatt On the bund (199 Huangpu Road, Shanghai)',
    description_text: "After meeting at the lobby, we will head to <a target='_blank' href='http://chope.net.cn/shanghai-restaurants/restaurant/lostheaven-yadl'> Lost Heaven</a>(17 Yan An Dong Lu, Huangpu District). The table of 10 is booked under Makoto",
    ether_price: 13,
  },
]
module.exports = Data;
