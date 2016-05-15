## Pay back

### Users receive pay back

Given the following users has registered
| Thomas    |
| Francesco |
| Chris     |
| Phil      |
And the following users has attended
| Thomas    |
| Francesco |
| Chris     |
Then the contract has the following information
| registered | 4                |
| balance    | 4                |
| attended   | 3                |
When even organiser pays back
Users receive the following
| Name      | Amount |
| Thomas    | 1.3333 |
| Francesco | 1.3333 |
| Chris     | 1.3333 |
| Phil      | 0      |

#### Users cannot receive payback because event has not happend
#### Only organiser can trigger the payback function
#### Consideration: Let each participant claim his/her own rather than the oragniser payback to everyone so that organiser does not have to pay gas for everybody.
