# Final Project


My full time job is not developper so I apologize in advance for the way I coded the angular GUI project, I had some trouble to understand to how communicate the information between pages, 
<br/>so I used a lot $rootScope and I guess it's not the way to do it. I hope you will not be too hard on me.<br/>
I tried to make the site really functional and easy to test.<br/>
For your information, the 6 test scenarios asked are in the file `vehicles_louis.js`

I noticed when running the site from vagrant vm and accessing it from the host, it was very slow on Chrome (because of a CORS related issue), but faster on firefox. (Still less fast than locally)
<br/>But if you run the project locally, you should be fine with chrome.<br/>
Thank you for reviewing my project and for this  **awesome course** !! :)

PS: Also don't pay attention to commit time, I used a vm with a wrong date thus, it is not accurate

## Install Instructions

As root on vagrant vm:
- Clone the project
- npm install
- testrpc
- truffle migrate --reset
- npm run dev

Project should be running on http://localhost:8080


## Limitations of the project :
The project is working with testrpc and also with geth (But I didn't had enough time to put any progress bar or something indicating that the transaction was waiting to be processed). Mist is not compatible with the site.
<br/>Also It's currently only possible to create one TollBoothOperator (And as asked the first TollBoothOperator is created during the deployment). I didn't want to spend too much time on the GUI and focus more on the smart contract and on finishing the project first, as it took me a lot more time than I expected.

Don't hesitate to reach me on slack or at louis.lonjon@gmail.com, if you encounter any issues.


## Preview

![Preview](https://i.imgur.com/H9O0ix9.png)