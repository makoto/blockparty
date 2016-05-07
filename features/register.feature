## Register event

### A user can register event
As a meeting attendee
I wan to register a event so that I can attend the meeting

Given there is a CodeUp event
And  Codeup has contract has the following information
| registered | 0                  |
| balance    | 0                  |
| deposit    | 1                  |
When Chris registered
Then Chris's account balance is -1 ETHER
And  Codeup has contract has the following information
| registered | 1                  |
| balance    | 1                  |
And  Codeup remaining capacity is 19

### A user cannot register the event because the capacity is filled up
### A user cannot register the event because its too late
