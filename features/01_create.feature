## Create an event

As an event organiser
I want to create event so that people can register

Given I organise a following event
| Key        | Value  |
| name       | Codeup |
#| start at   | 12th May 2016 18:30|
#| end   at   | 12th May 2016 21:30|
#| capacity   | 20                 |
| registered | 0                  |
| attended   | 0                  |
| balance    | 0                  |
| deposit    | 1 ETHER            |
#| location   | Simply Business    |
#| organiser  | Makoto             |
When I create the event contract
Then I have the event contract that contains the detail above
