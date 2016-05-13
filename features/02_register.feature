## Register event

### A user can register event
As a meeting attendee
I wan to register a event so that I can attend the meeting

Scenario: User can register an event

Given there is a CodeUp event
And  Codeup has contract has the following information
| capacity   | 20                 |
| registered | 0                  |
| balance    | 0                  |
| deposit    | 1                  |
When Chris registered
Then Chris's account balance is -1 ETHER
And  Codeup has contract has the following information
| capacity   | 19                 |
| registered | 1                  |
| balance    | 1                  |
And  Codeup remaining capacity is 19

Scenario: A user cannot register because it did not pay the exact deposit ammount

### A user can unregister until a day before the event starts
### A user cannot register the event because the capacity is filled up
### A user cannot register the same event more than once
### A user cannot register the event because its too late
