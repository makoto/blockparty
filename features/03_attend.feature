## Checkin

As an event organiser I want to check who came to the event so that I can keep track of all the attendees

### A user can check in
Given the following users has registered
| Thomas    |
| Francesco |
| Chris     |
| Phil      |
When Chris has attended
Then the contract has the following information
| registered | 4                |
| balance    | 1                |
| attended   | 1                |

### A user cannot attend because he has not registered
### The conference organiser is the only one who can checkin participants
