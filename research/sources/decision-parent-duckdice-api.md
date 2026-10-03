Source: https://duckdice.io/bot-api
Title: Bot API: Explore DuckDice's Bot API
Fetched: 2026-10-03T08:23:40.191Z

![splash](https://imagedelivery.net/xuk-SdtT_li6x5IVhDEO7w/bbacd277-7d42-4999-62f4-34db006a3000/public)

APY up to 171%..

# Developers API

## Original Dice / Bet Make

```
HTTP POST /api/dice/play?api_key=<API_KEY>
```

#### Request body, JSON-encoded

| **Parameter name** | Type | Required | Description | Example |
| --- | --- | --- | --- | --- |
| **symbol** | string | yes | Currency symbol | "BTC" |
| **chance** | string, decimal | yes | Bet chance, % | "88.88" |
| **isHigh** | boolean | yes | High/Low | true |
| **amount** | string, decimal | yes | Bet amount | "0.01" |
| **userWageringBonusHash** | string | no | User's wagering bonus hash, [link](https://duckdice.io/bot-api#wagering-bonus-model) | "da49f4c33a" |
| **tleHash** | string | no | TLE unique hash, [link](https://duckdice.io/bot-api#user-info-anchor) | "da4df4631f" |

#### Request Example

```
POST /api/dice/play?api_key=00000000-0000-0000-0000-000000000000 HTTP/1.1
Content-Type: application/json
User-Agent: DuckDiceBot/1.0.0
Accept: */*
Cache-Control: no-cache
Host: duckdice.io
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Content-Length: 110

{
    "symbol": "XLM",
    "amount": "0.1",
    "chance": "77.77",
    "isHigh": true
}
```

#### Response, JSON-encoded

| **Parameter name** | Type | Description | Example |
| --- | --- | --- | --- |
| **bet** | [Bet](https://duckdice.io/bot-api#bet-model) | Bet object | See [Bet](https://duckdice.io/bot-api#bet-model) |
| **isJackpot** | boolean | true, if bet is jackpot | true |
| **jackpotStatus** | boolean, nullable | Jackpot status, null if no jackpot, false if bet amount is below minimum required to obtain a jackpot. | true |
| **jackpot** | object | Jackpot object, nullable |  |
| **jackpot.amount** | string, decimal | Jackpot amount | "10.38069307" |
| **user** | [User](https://duckdice.io/bot-api#user) | User object | See [User](https://duckdice.io/bot-api#user) |

#### Bet

| **Parameter name** | Type | Description | Example |
| --- | --- | --- | --- |
| **hash** | string | Unique bet hash | "bb7bd4578d9" |
| **symbol** | string | Currency symbol | "XRP" |
| **result** | boolean | Win/Lose | true |
| **choice** | string | bet choice | >4999 |
| **choiceOption** | string | bet choice option | 0,2222 |
| **number** | integer | Bet result number | 6559 |
| **chance** | float | Bet chance, % | 77.77 |
| **payout** | float | Bet payout multiplier | 1.273 |
| **betAmount** | string, decimal | Bet amount | "0.004" |
| **winAmount** | string, decimal | Win amount | "0.005092" |
| **profit** | string, decimal | Win profit | "0.001092" |
| **mined** | string, decimal | Decoy mined amount | "22.34302483" |
| **nonce** | integer | Bet nonce | 12349977 |
| **created** | integer | Created timestamp | 1705594955 |
| **gameMode** | string | Game mode (main, bonus) | "main" |
| **game** | object | Game details (name, slug) | {name: "Original Dice", slug: "Dice"} |

#### User

| **Parameter name** | Type | Description | Example |
| --- | --- | --- | --- |
| **hash** | string | Unique user hash | "ea6d2ba75a" |
| **username** | string | Username | "DuckDiceBot" |
| **bets** | integer | Total user's bets count | 6591995 |
| **nonce** | integer | User's current seed's nonce | 95787 |
| **wins** | integer | User's wins count | 1915822 |
| **luck** | float | See [Luck](https://duckdice.io/faq#luck) | 99.94 |
| **balance** | string, decimal | User's balance in currency | "69.23805207" |
| **profit** | string, decimal | User's profit in currency | "373.03978203" |
| **volume** | string, decimal | User's wagering in currency | "77284.31558445" |
| **absoluteLevel** | object | Absolute level data |  |
| **absoluteLevel.level** | integer | Absolute level | 31 |
| **absoluteLevel.xp** | integer | Absolute level xp | 448338 |
| **absoluteLevel.xpNext** | integer | XP to next level | 459700 |
| **absoluteLevel.xpPrev** | integer | XP on previous level | 405700 |

#### Response Example

```
HTTP/1.1 200 OK
            Date: Thu, 18 Jan 2024 14:33:47 GMT
            Content-Type: application/json
            Transfer-Encoding: chunked
            Connection: keep-alive
            Cache-Control: no-cache, private
            Server: cloudflare
            Content-Encoding: gzip

            {
                "bet": {
                    "hash": "bb7bd4178d9",
                    "symbol": "XLM",
                    "result": true,
                    "choice": ">2222",
                    "number": 6559,
                    "chance": 77.77,
                    "payout": 1.273,
                    "betAmount": "0.004",
                    "winAmount": "0.005092",
                    "profit": "0.001092",
                    "mined": "0.0012011",
                    "nonce": 81,
                    "created": 1705594955,
                    "gameMode": "main",
                    "game": {
                        "name": "Original Dice",
                        "slug": "dice"
                    }
                },
                "isJackpot": true,
                "jackpotStatus": true,
                "jackpot": {
                    "amount": "100500.00"
                },
                "user": {
                    "hash": "ea6d2ba75a",
                    "username": "DuckDiceBot",
                    "bets": 6591995,
                    "nonce": 82,
                    "wins": 1915822,
                    "balance": "69.23805207",
                    "profit": "373.03978203",
                    "volume": "77284.31558445",
                    "absoluteLevel": {
                        "level": 31,
                        "xp": 448338,
                        "xpNext": 459700,
                        "xpPrev": 405700
                    }
                }
            }
```

## Range Dice / Bet Make

```
HTTP POST /api/range-dice/play?api_key=<API_KEY>
```

#### Request body, JSON-encoded

| **Parameter name** | Type | Required | Description | Example |
| --- | --- | --- | --- | --- |
| **symbol** | string | yes | Currency symbol | "BTC" |
| **range** | array | yes | Range numbers | \[0,9998\] |
| **isIn** | boolean | yes | In/Out | true |
| **amount** | string, decimal | yes | Bet amount | "0.01" |
| **userWageringBonusHash** | string | no | User's wagering bonus hash, [link](https://duckdice.io/bot-api#wagering-bonus-model) | "da49f4c33a" |
| **tleHash** | string | no | TLE unique hash, [link](https://duckdice.io/bot-api#user-info-anchor) | "da4df4631f" |

#### Request Example

```
POST /api/range-dice/play?api_key=00000000-0000-0000-0000-000000000000 HTTP/1.1
Content-Type: application/json
User-Agent: DuckDiceBot/1.0.0
Accept: */*
Cache-Control: no-cache
Host: duckdice.io
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Content-Length: 110

{
    "symbol": "XLM",
    "amount": "0.1",
    "range": [7777,7777],
    "isIn": true
}
```

#### Response, JSON-encoded

| **Parameter name** | Type | Description | Example |
| --- | --- | --- | --- |
| **bet** | [Bet](https://duckdice.io/bot-api#bet-model) | Bet object | See [Bet](https://duckdice.io/bot-api#bet-model) |
| **isJackpot** | boolean | true, if bet is jackpot | true |
| **jackpotStatus** | boolean, nullable | Jackpot status, null if no jackpot, false if bet amount is below minimum required to obtain a jackpot. | true |
| **jackpot** | object | Jackpot object, nullable |  |
| **jackpot.amount** | string, decimal | Jackpot amount | "10.38069307" |
| **user** | [User](https://duckdice.io/bot-api#user) | User object | See [User](https://duckdice.io/bot-api#user) |

#### Response Example

```
HTTP/1.1 200 OK
            Date: Thu, 18 Jan 2024 14:33:47 GMT
            Content-Type: application/json
            Transfer-Encoding: chunked
            Connection: keep-alive
            Cache-Control: no-cache, private
            Server: cloudflare
            Content-Encoding: gzip

            {
                "bet": {
                    "hash": "bb7bd4178d9",
                    "symbol": "XLM",
                    "result": true,
                    "choice": "In",
                    "choiceOption": "7777,7777",
                    "number": 6559,
                    "chance": 77.77,
                    "payout": 1.273,
                    "betAmount": "0.004",
                    "winAmount": "0.005092",
                    "profit": "0.001092",
                    "mined": "0.0012011",
                    "nonce": 81,
                    "created": 1705594955,
                    "gameMode": "main",
                    "game": {
                        "name": "Range Dice",
                        "slug": "range-dice"
                    }
                },
                "isJackpot": true,
                "jackpotStatus": true,
                "jackpot": {
                    "amount": "100500.00"
                },
                "user": {
                    "hash": "ea6d2ba75a",
                    "username": "DuckDiceBot",
                    "bets": 6591995,
                    "nonce": 82,
                    "wins": 1915822,
                    "balance": "69.23805207",
                    "profit": "373.03978203",
                    "volume": "77284.31558445",
                    "absoluteLevel": {
                        "level": 31,
                        "xp": 448338,
                        "xpNext": 459700,
                        "xpPrev": 405700
                    }
                }
            }
```

## Currency stats

```
HTTP GET /api/bot/stats/<SYMBOL>?api_key=<API_KEY>
```

#### Response, JSON-encoded

| **Parameter name** | Type | Description | Example |
| --- | --- | --- | --- |
| **bets** | int | Bets count | 2350 |
| **wins** | int | Wins count | 2345 |
| **profit** | string, decimal | Profit in currency | "1.2345" |
| **volume** | string, decimal | Volume in currency | "1.2345" |
| **balances** | object | User balances in currency |  |
| **balances.main** | string, decimal | User main balance in currency | "1.2345" |

#### Response Example

```
HTTP/1.1 200 OK
            Date: Thu, 18 Jan 2024 14:33:47 GMT
            Content-Type: application/json
            Transfer-Encoding: chunked
            Connection: keep-alive
            Cache-Control: no-cache, private
            Server: cloudflare
            Content-Encoding: gzip

            {
                "bets": 100,
                "wins": 50,
                "profit": "373.03978203",
                "volume": "77284.31558445",
                "balances": {
                    "main": "0.0012"
                }
            }
```

## User info

```
HTTP GET /api/bot/user-info?api_key=<API_KEY>
```

#### Response, JSON-encoded

| **Parameter name** | Type | Description | Example |
| --- | --- | --- | --- |
| **hash** | string | Unique user hash | "ea6d2ba75a" |
| **username** | string | Username | "DuckDiceBot" |
| **createdAt** | integer | User created timestamp | 1705594955 |
| **campaign** | string, nullable | User's affiliate campaign tracking id | "a7614e787e" |
| **affiliate** | string, nullable | Affiliate username | "Affiliate" |
| **lastDeposit** | object, nullable | Last deposit |  |
| **lastDeposit.createdAt** | integer | Deposit created timestamp | 1705594955 |
| **lastDeposit.currency** | string | Deposit currency | "BTC" |
| **lastDeposit.amount** | string, decimal | Deposit amount | "0.01234511" |
| **wagered** | array | Wagered amounts by currency | \[\] |
| **wagered.\*.currency** | string | Wager currency | "XRP" |
| **wagered.\*.amount** | string, decimal | Wager amount | "0.000222118" |
| **balances** | array | User's balances | \[\] |
| **balances.\*.currency** | string | Balance currency | "BTC" |
| **balances.\*.main** | string, decimal, nullable | Main balance | "0.000111" |
| **balances.\*.affiliate** | string, decimal, nullable | Affiliate balance | "0.0770099" |
| **wageringBonuses** | array | Active wagering bonuses, see [Wagering Bonus](https://duckdice.io/bot-api#wagering-bonus-model), only 1 item or empty | \[\] |
| **tle** | array | Active / Finished TLEs | \[\] |
| **tle.\*.hash** | string | TLE unique hash | "a7614e787e" |
| **tle.\*.name** | string | TLE name | "Halloween" |
| **tle.\*.status** | string | Status (active/finished) | "active" |

#### Wagering Bonus

| **Parameter name** | Type | Description | Example |
| --- | --- | --- | --- |
| **name** | string | Wagering bonus name | "January Deposit Bonus" |
| **type** | string | general/no-deposit/rotatable | "general" |
| **hash** | string | User's wagering bonus hash | "a7614e787e" |
| **status** | string | Bonus status: active/canceled/wasted/expired/unlocked | "active" |
| **symbol** | string | Users's bonus symbol | "XLM" |
| **margin** | string, decimal | User's bonus margin amount | "123.00" |

#### Response Example

```
HTTP/1.1 200 OK
            Date: Thu, 18 Jan 2024 14:33:47 GMT
            Content-Type: application/json
            Transfer-Encoding: chunked
            Connection: keep-alive
            Cache-Control: no-cache, private
            Server: cloudflare
            Content-Encoding: gzip

            {
                "hash": "d6f7a12ab5",
                "username": "DuckDiceBot",
                "createdAt": 1568982432,
                "campaign": "a7614e787e",
                "affiliate": "Affiliate",
                "lastDeposit": {
                    "createdAt": 1591005477,
                    "currency": "XRP",
                    "amount": "0.75"
                },
                "wagered": [\
                    {\
                        "currency": "BTC",\
                        "amount": "14.24675424"\
                    },\
                    {\
                        "currency": "LTC",\
                        "amount": "0.3914529"\
                    },\
                    {\
                        "currency": "ETH",\
                        "amount": "0"\
                    },\
                    {\
                        "currency": "XRP",\
                        "amount": "0"\
                    },\
                    {\
                        "currency": "XLM",\
                        "amount": "0"\
                    }\
                ],
                "balances": [\
                    {\
                        "currency": "BTC",\
                        "main": "0.00001"\
                    },\
                    {\
                        "currency": "ETH",\
                        "main": "0.0199",\
                    },\
                    {\
                        "currency": "DECOY",\
                        "main": "10022.167011"\
                    }\
                ],
                "wageringBonuses": [\
                    {\
                        "name": "January Deposit Bonus",\
                        "type": "general",\
                        "hash": "d3f1f121b3",\
                        "status": "active",\
                        "symbol": "XLM",\
                        "margin": "12.99"\
                    }\
                ],
                "tle": [\
                    {\
                        "hash": "d6f1a12ab3",\
                        "name": "Halloween",\
                        "status": "active"\
                    }\
                ]
            }
```

![](https://counter.yadro.ru/hit?rhttps%3A//www.google.com/;s1920*1080*24;uhttps%3A//duckdice.io/bot-api;hBot%20API%3A%20Explore%20DuckDice%27s%20Bot%20API;0.28152747558201174)