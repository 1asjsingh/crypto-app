# Shit-To-Do For Express.js Back-End

* Automatic linting (to match style guide) e.g. double-quotes should be single-quotes, etc.

## Express.js Back-End TODOs

1. Big ass refactor.
  * `mkdir express-server && cd express-server` as its own Node.js sub-project under `crypto-app`.
    1. `npm install -g express-generator`: Install Express.js generator globally.
    2. `express ./`: Create Express.js project inside the sub-project, including `package.json` and installs packages.
    3. Remove unnecessary view/front-end related code i.e. in `public` and `views` packages, only keep:
      * `public/stylesheets/style.css`
      * `error.jade` (after refactoring `layout.jade` into it)
    4. Replace automatically-generated `routes` with existing `server/routes`.
    5. Move existing `server/controllers` and `server/services` into this sub-project (as `controllers` and `services` respectively).
    6. Refactor automatically-generated `app.js` code with existing `server/index.js`.
      * Filename needs to be `app.js` because it's `require`'d in `bin/www`.
      * Allow the app to be exported from `app.js` to be used in `bin/www`.
    7. Move existing files to the new sub-project:
      * `.env`
      * `firestore.js`
    8. Keep calling `npm start` and `npm install <package>` for the `<package>` the error says is missing, until the server finally runs (ignore messages about "high severity vulnerabilities"). Check the endpoints are returning correctly.
    9. `npm audit fix --force`: (Called until 0 vulnerabilities) Change versions of packages with vulnerabilities to safer versions.
    10. Add `npm run dev` using `nodemon` which will re-run the server on any change in the Express.js app code:
      * `npm install -g nodemon && npm install nodemon --save-dev`: Installs `nodemon` globally and as a dev dependency in this sub-project.
      * Add `scripts.dev: "nodemon ./bin/www"` to the `package.json` so that we can run the app in development mode.
    * **TODO: Rename .env to .env.development(.local)**
  * `mkdir react-client` as its own Node.js sub-project under `crypto-app`.
    1. Just move existing code inside it:
      * `public`
      * `src`
      * `.env`
      * `.gitignore`
      * `package.json`
      * `README.md`.
  * `mkdir flask-server` as its own Python sub-project under `crypto-app`.
    1. **TODO**
  * Create `express-server/etc` sub-directory.
    * Move the Firebase service account credentials into this folder and refactor usages of this path.
    * Add `etc` to the `.gitignore`, you shouldn't push service account details to a GitHub repository (private or not) because it counts as sensitive data.
    * Also created `coin_vs_currency.json` which defines all supported versus currencies and coins (coin IDs) in a JSON object, which is `require`'d when their values are needed, e.g. in `services/getCurrencyHelper.js`.
  * Make sure `firestore.js` is under `express-server`.
  * Refactored `databaseURL` of Firebase admin initialisation to `.env` as `FIREBASE_DATABASE_URL`.
  * Also refactored `"crypto-accounts"` as `FIREBASE_USERS_COLLECTION` and `"transactions"` as `FIREBASE_USERS_TRANSACTIONS_COLLECTION` in `.env`.

3. Add error handling in back-end (also checking the endpoints actually work still).
  Express endpoints done:
  * `/user/details/:userId` (originally `user/getUserData/:id`)
  * `/portfolio/transactionhistory/:userId` (originally `/portfolio/getHistory/:id`)
  * `/portfolio/fetch/:userId/:currency` (originally `/portfolio/getPortfolio/:currency/:id`)
  * `/coingecko/currentprices/:currency` (originally `/api/getCurrencies/:currency`)
  * `/transaction/buy`
  * `/transaction/sell`
  * `/leaderboard/portfolio/:currency` (originally `/leaderboard/getLeaderboard/:currency`)
  * `/leaderboard/game` (originally `/leaderboard/getGameLeaderboard`)
  * `/leaderboard/updatescore/:userId/:newScore` (originally `/leaderboard/updateScore/:id/:newScore`)
  Express endpoints to go back to because they need fixing:
  * `/leaderboard/portfolio/:currency` - `:currency` is expected to be `gbp£`, not `gbp` like the rest.

4. Fix the bad error handling in the back-end.
5. Find all places in the React project where you call the Express.js back-end and handle the possible errors.

2. Added `deploy.sh` to run the entire application in production mode. **TODO: NOT FINISHED.**



4. [Bugs to fix?]
5. *[Features to add]?

**Check controllers calling async code have next arg**
**Add dotenv name for crypto-leaderboard collection in Firebase**
**Make distinction between Firebase Firestore references and fetched values for references via promises.**
**Fix currency repr in DB (rep'd as 3-letter string + 1 cash symbol - not good way to encode) - see L52 in leaderboard.service.js**
**apiController.js has a catch callback that should probably get extracted to a coingecko callbacks.js file since it might be used elsewhere?**
**Choose one convention, either async function funcname, const funcname = async function() OR const funcname = async () => {};**
**Mock CoinGecko API behaviour, download all their data for all coins and versus currencies and set a date you want the app to start at to be your fake "now"**
**Either get both price and date or neither for buy/sell in transactions, we want date and price to be consistent with each other**
**CoinGecko base url should go somewhere globally available? constants file or in dotenv?**
**Change transaction ID from count to UUID?**
**Create transactions.service.js**
**Rather than sorting transaction history manually, can we use `orderBy` Query**
**Refactor common callback functions like when you want to handle CoinGecko response/errors - could group them in the same file for each axios instance e.g. the CoinGecko axios instance also contains callbacks to handle errors that could occur with CoinGecko**
**Refactor imports (sort, remove unnecessary, etc.), find out with the idiomatic JS way is**
**Rename service files with service prefix? e.g. `user.service.js`?**
**Change `id` to `userId`, confused because `id` is also used for coin IDs in CoinGecko API**
**FIX RELATIVE IMPORTS, WE SHOULDN'T JUMP BACK AND FORTH IN THE PROJECT LEVELS USING ./ AND ../ ETC.**
**Move supportedCoins and supportedCurrencies to a place where we can import it instead of constantly recreating it from the config.json in each file**
**Add `db` package after finishing `services`**
**npm start but it should be with req.app.get('env') === 'production' or undefined, instead of 'development'**
**Uncomment that setInterval statement for leaderboard updates**
**Do we still need the other Express.js project at C:\Users\amani\OneDrive\University\server?**
**Add npm cache to catch deps installed via npm for faster build time**
**Add eslint to lint JS**
**UNIT/INTEGRATION TESTS WITH Jest.js OR SOMETHING ELSE? Add `npm run test` if this is done.**

## TODO: React.js Front-End TODOs

1. Fix registration:
  * Username is validated against regular expression `/^[a-zA-Z0-9_-]{6,30}$/`.
  * Password cannot contain spaces.

From Amaninder:
* When user click buy or sell modal, the cost price/sell price wont update.
  * If the user opens the modal at 12:30pm on one day and the price in the window is 1500, and keeps it open until the next day, the price won't change.
* Game Page: Getting candle data every round can cause request limit to be reached and so user can lose their high score i think idk..

Bugs:
* Don't show NavigationBar icons like wallet, game leaderboard, transaction history, portfolio leaderboard and settings on non-protected pages like registration.
* Settings opens a modal when you're not signed in (i.e. homepage, signing in, registering, etc.).
* Express and Flask server URLs should be retrieved from .env file.

Major TODOs:
* Use a different method for charting.

**UNIT/INTEGRATION TESTS**

## TODO: Flask Server TODOs

**UNIT/INTEGRATION TESTS WITH Jest.js**

# Notes on changes made

(Maybe just do in the form of git commits?)

# Other Notes

* Discussion about rate limiting with current APIs and multiple users interacting with the website. More users with an unchanging rate limit for fetching data the way it's currently implemented will cause you to hit the rate limit faster.
  * Maybe we need to change the implementation so that you never let users be responsible for hitting CoinGecko, and you always get that data via the back-end, and you just make sure the back-end stays within the rate limits and caches that data.#
  * You might be getting rate limited because every time you call `getCurrentPrices`, it caches the new object with TTL 1s. You only have 3 currencies and public API users have a rate limit of 10-50/min (equivalent to calling the function 3-17/min, and you're probably getting really unlucky since you would normally navigate between that many pages in a minute).