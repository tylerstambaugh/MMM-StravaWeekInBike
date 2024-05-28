# MMM-StravaWeekInBike

---

A simple magic mirror module for displaying the last 'X' days of riding stats.  
![alt stravaWeekInBike](./public/assets/images/StravaWeekInBike.png)

## Table of contents

1. [Setup](#setup)
2. [Configuration](#configuration)
3. [Updates](#updates)

## Setup

-In order to run the module, you'll need to [setup API access](https://developers.strava.com/docs/getting-started/#account) on your Strava account.

-You'll need to get your clientId, clientSecret, and initial refreshToken. Follow [these instructions](https://developers.strava.com/docs/getting-started/#oauth) to get those values.

-Scopes for the token should include: activity:read_all

- Note: The access token and refresh tokens are kept in a file in the directory above the module. This is for the case where you are running both of my Strava MM modules, they'll share the token data between them allowing them to stay in sync and avoid "Unauthorized" errors
## Configuration

```json
{
  module: "MMM-StravaWeekInBike",
  position: "top_right",
  config: {
    clientId: "[YOUR CLIENT ID]",
    clientSecret: "[YOUR CLIENT SECRET]",
    refreshToken: "[YOUR REFRESH TOKEN]",
    numberOfDaysToQuery: 7, //number of days to look back for stats
    maxWidth: "250px",
    header: "Strava Week in Bike" //custom header if you want something different
  }
}
```

## Updates

I will likely continue to update the module. When you see that an update is available:

1. Open the command prompt and change to directory \MagicMirror\modules\MMM-StravaWeekInBike\
2. Run command `git pull`
3. Restart the Magic Mirror
